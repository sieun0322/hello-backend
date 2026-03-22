use std::sync::Arc;

use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::Json,
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use tonic::transport::Channel;

pub mod matching {
    tonic::include_proto!("matching");
}

use matching::matching_engine_client::MatchingEngineClient;
use matching::{OrderRequest, Symbol};

type GrpcClient = Arc<tokio::sync::Mutex<MatchingEngineClient<Channel>>>;

#[derive(Clone)]
struct AppState {
    grpc: GrpcClient,
    http: reqwest::Client,
    market_data_url: String,
}

// ─── 요청/응답 타입 ───────────────────────────────────────────

#[derive(Deserialize)]
struct SubmitOrderReq {
    symbol: String,
    side: String,       // "BUY" | "SELL"
    price: u64,
    quantity: u64,
    order_type: String, // "LIMIT" | "MARKET"
}

#[derive(Serialize)]
struct SubmitOrderRes {
    order_id: u64,
    status: String,
    filled_quantity: u64,
}

#[derive(Serialize)]
struct OrderBookRes {
    symbol: String,
    bids: Vec<PriceLevel>,
    asks: Vec<PriceLevel>,
}

#[derive(Serialize)]
struct PriceLevel {
    price: u64,
    quantity: u64,
}

#[derive(Serialize)]
struct ErrorRes {
    error: String,
}

type ApiResult<T> = Result<Json<T>, (StatusCode, Json<ErrorRes>)>;

fn bad_request(msg: &str) -> (StatusCode, Json<ErrorRes>) {
    (
        StatusCode::BAD_REQUEST,
        Json(ErrorRes { error: msg.to_string() }),
    )
}

fn service_err(e: impl std::fmt::Display) -> (StatusCode, Json<ErrorRes>) {
    (
        StatusCode::SERVICE_UNAVAILABLE,
        Json(ErrorRes { error: e.to_string() }),
    )
}

// ─── 체결 이벤트 타입 (market-data-feed와 공유) ───────────────

#[derive(Serialize)]
struct TradeEvent {
    symbol: String,
    price: u64,
    quantity: u64,
    timestamp: u64,
}

// ─── 핸들러 ──────────────────────────────────────────────────

// POST /orders
async fn submit_order(
    State(state): State<AppState>,
    Json(req): Json<SubmitOrderReq>,
) -> ApiResult<SubmitOrderRes> {
    let side = match req.side.to_uppercase().as_str() {
        "BUY" => 0,
        "SELL" => 1,
        _ => return Err(bad_request("side must be BUY or SELL")),
    };

    let order_type = match req.order_type.to_uppercase().as_str() {
        "LIMIT" => 0,
        "MARKET" => 1,
        _ => return Err(bad_request("order_type must be LIMIT or MARKET")),
    };

    if req.quantity == 0 {
        return Err(bad_request("quantity must be > 0"));
    }

    let symbol = req.symbol.clone();
    let price = req.price;

    let grpc_req = OrderRequest {
        symbol: req.symbol,
        side,
        price: req.price,
        quantity: req.quantity,
        order_type,
    };

    let mut c = state.grpc.lock().await;
    let res = c.submit_order(grpc_req).await.map_err(service_err)?.into_inner();

    // 체결이 발생한 경우 market-data-feed에 이벤트 전송
    if res.filled_quantity > 0 {
        let event = TradeEvent {
            symbol,
            price,
            quantity: res.filled_quantity,
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs(),
        };
        // 실패해도 주문 응답에는 영향 없음 (fire-and-forget)
        let _ = state.http
            .post(&state.market_data_url)
            .json(&event)
            .send()
            .await;
    }

    Ok(Json(SubmitOrderRes {
        order_id: res.order_id,
        status: res.status,
        filled_quantity: res.filled_quantity,
    }))
}

// GET /orderbook/:symbol
async fn get_order_book(
    State(state): State<AppState>,
    Path(symbol): Path<String>,
) -> ApiResult<OrderBookRes> {
    let mut c = state.grpc.lock().await;
    let snapshot = c
        .get_order_book(Symbol { symbol: symbol.clone() })
        .await
        .map_err(service_err)?
        .into_inner();

    Ok(Json(OrderBookRes {
        symbol: snapshot.symbol,
        bids: snapshot
            .bids
            .into_iter()
            .map(|p| PriceLevel { price: p.price, quantity: p.quantity })
            .collect(),
        asks: snapshot
            .asks
            .into_iter()
            .map(|p| PriceLevel { price: p.price, quantity: p.quantity })
            .collect(),
    }))
}

// ─── main ────────────────────────────────────────────────────

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let channel = Channel::from_static("http://[::1]:50051")
        .connect()
        .await?;
    let grpc = Arc::new(tokio::sync::Mutex::new(MatchingEngineClient::new(channel)));

    let state = AppState {
        grpc,
        http: reqwest::Client::new(),
        market_data_url: "http://localhost:9001/publish".to_string(),
    };

    let app = Router::new()
        .route("/orders", post(submit_order))
        .route("/orderbook/:symbol", get(get_order_book))
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await?;
    println!("Order Gateway listening on http://0.0.0.0:8080");
    axum::serve(listener, app).await?;

    Ok(())
}
