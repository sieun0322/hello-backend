use std::collections::HashMap;
use std::sync::{Arc, Mutex};

use tonic::{Request, Response, Status};

use crate::matching::matching_engine_server::MatchingEngine;
use crate::matching::{
    CancelRequest, CancelResponse, OrderBookSnapshot, OrderRequest, OrderResponse, PriceLevel,
    Symbol,
};
use crate::order_book::{Order, OrderBook, Side};

pub struct MatchingEngineService {
    books: Arc<Mutex<HashMap<String, OrderBook>>>,
}

impl MatchingEngineService {
    pub fn new(books: Arc<Mutex<HashMap<String, OrderBook>>>) -> Self {
        Self { books }
    }
}

#[tonic::async_trait]
impl MatchingEngine for MatchingEngineService {
    async fn submit_order(
        &self,
        request: Request<OrderRequest>,
    ) -> Result<Response<OrderResponse>, Status> {
        let req = request.into_inner();

        let side = match req.side {
            0 => Side::Buy,
            1 => Side::Sell,
            _ => return Err(Status::invalid_argument("invalid side")),
        };

        let symbol = req.symbol.clone();
        let orig_qty = req.quantity;

        let order = Order {
            id: 0,
            symbol: req.symbol,
            side,
            price: req.price,
            quantity: req.quantity,
            timestamp: 0,
        };

        let mut books = self.books.lock().unwrap();
        let book = books
            .entry(symbol.clone())
            .or_insert_with(|| OrderBook::new(&symbol));

        let (order_id, trades) = book.submit(order);

        let filled_quantity: u64 = trades.iter().map(|t| t.quantity).sum();
        let status = if filled_quantity == 0 {
            "OPEN"
        } else if filled_quantity < orig_qty {
            "PARTIAL"
        } else {
            "FILLED"
        };

        Ok(Response::new(OrderResponse {
            order_id,
            status: status.to_string(),
            filled_quantity,
        }))
    }

    async fn cancel_order(
        &self,
        _request: Request<CancelRequest>,
    ) -> Result<Response<CancelResponse>, Status> {
        // TODO: Phase 3
        Err(Status::unimplemented("cancel not yet implemented"))
    }

    async fn get_order_book(
        &self,
        request: Request<Symbol>,
    ) -> Result<Response<OrderBookSnapshot>, Status> {
        let symbol = request.into_inner().symbol;
        let books = self.books.lock().unwrap();

        let (bids, asks) = match books.get(&symbol) {
            Some(book) => {
                let bids = book
                    .bid_levels()
                    .into_iter()
                    .map(|(price, quantity)| PriceLevel { price, quantity })
                    .collect();
                let asks = book
                    .ask_levels()
                    .into_iter()
                    .map(|(price, quantity)| PriceLevel { price, quantity })
                    .collect();
                (bids, asks)
            }
            None => (vec![], vec![]),
        };

        Ok(Response::new(OrderBookSnapshot { symbol, bids, asks }))
    }
}
