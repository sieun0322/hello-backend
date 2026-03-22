mod order_book;
mod service;

use std::collections::HashMap;
use std::sync::{Arc, Mutex};

use tonic::transport::Server;

pub mod matching {
    tonic::include_proto!("matching");
}

use matching::matching_engine_server::MatchingEngineServer;
use service::MatchingEngineService;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let addr = "[::1]:50051".parse()?;

    let books = Arc::new(Mutex::new(HashMap::new()));
    let svc = MatchingEngineService::new(books);

    println!("Matching Engine gRPC listening on {}", addr);

    Server::builder()
        .add_service(MatchingEngineServer::new(svc))
        .serve(addr)
        .await?;

    Ok(())
}
