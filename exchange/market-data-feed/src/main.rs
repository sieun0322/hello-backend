use std::sync::Arc;

use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        State,
    },
    response::Response,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use tokio::sync::broadcast;

// ─── 타입 ────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
struct TradeEvent {
    symbol: String,
    price: u64,
    quantity: u64,
    timestamp: u64,
}

#[derive(Clone)]
struct AppState {
    tx: Arc<broadcast::Sender<String>>,
}

// ─── WebSocket 핸들러 ─────────────────────────────────────────

// GET /ws  — 클라이언트가 실시간 체결 이벤트를 구독
async fn ws_handler(ws: WebSocketUpgrade, State(state): State<AppState>) -> Response {
    ws.on_upgrade(move |socket| handle_socket(socket, state.tx))
}

async fn handle_socket(mut socket: WebSocket, tx: Arc<broadcast::Sender<String>>) {
    let mut rx = tx.subscribe();

    loop {
        match rx.recv().await {
            Ok(msg) => {
                if socket.send(Message::Text(msg.into())).await.is_err() {
                    break; // 클라이언트 연결 끊김
                }
            }
            Err(broadcast::error::RecvError::Lagged(n)) => {
                // 느린 구독자: 메시지 n개 스킵됨, 계속 진행
                eprintln!("client lagged, skipped {n} messages");
            }
            Err(broadcast::error::RecvError::Closed) => break,
        }
    }
}

// ─── Publish 핸들러 ───────────────────────────────────────────

// POST /publish  — order-gateway가 체결 이벤트를 여기로 전송
async fn publish_trade(
    State(state): State<AppState>,
    Json(event): Json<TradeEvent>,
) -> Json<serde_json::Value> {
    let msg = serde_json::to_string(&event).unwrap_or_default();
    let subscribers = state.tx.send(msg).unwrap_or(0);

    Json(serde_json::json!({ "ok": true, "subscribers": subscribers }))
}

// ─── main ────────────────────────────────────────────────────

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let (tx, _rx) = broadcast::channel::<String>(256);
    let state = AppState { tx: Arc::new(tx) };

    let app = Router::new()
        .route("/ws", get(ws_handler))
        .route("/publish", post(publish_trade))
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:9001").await?;
    println!("Market Data Feed listening on http://0.0.0.0:9001");
    println!("  WebSocket : ws://0.0.0.0:9001/ws");
    println!("  Publish   : POST http://0.0.0.0:9001/publish");
    axum::serve(listener, app).await?;

    Ok(())
}
