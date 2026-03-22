use std::collections::{BTreeMap, VecDeque};
use std::cmp::Reverse;

#[derive(Debug, Clone, PartialEq)]
pub enum Side {
    Buy,
    Sell,
}

#[derive(Debug, Clone, PartialEq)]
pub enum OrderType {
    Limit,
    Market,
}

#[derive(Debug, Clone)]
pub struct Order {
    pub id: u64,
    pub symbol: String,
    pub side: Side,
    pub price: u64,     // 정수 (소수점 없음)
    pub quantity: u64,
    pub timestamp: u64,
}

#[derive(Debug, Clone)]
pub struct Trade {
    pub maker_order_id: u64,
    pub taker_order_id: u64,
    pub price: u64,
    pub quantity: u64,
}

pub struct OrderBook {
    pub symbol: String,
    // 매수: 높은 가격 우선 → Reverse로 내림차순
    bids: BTreeMap<Reverse<u64>, VecDeque<Order>>,
    // 매도: 낮은 가격 우선 → 오름차순 (기본)
    asks: BTreeMap<u64, VecDeque<Order>>,
    next_order_id: u64,
}

impl OrderBook {
    pub fn new(symbol: &str) -> Self {
        Self {
            symbol: symbol.to_string(),
            bids: BTreeMap::new(),
            asks: BTreeMap::new(),
            next_order_id: 1,
        }
    }

    pub fn submit(&mut self, mut order: Order) -> (u64, Vec<Trade>) {
        order.id = self.next_order_id;
        self.next_order_id += 1;

        let order_id = order.id;
        let trades = match order.side {
            Side::Buy => self.match_buy(order),
            Side::Sell => self.match_sell(order),
        };

        (order_id, trades)
    }

    fn match_buy(&mut self, mut taker: Order) -> Vec<Trade> {
        let mut trades = Vec::new();

        // asks에서 가장 낮은 가격부터 체결 시도
        while taker.quantity > 0 {
            let best_ask_price = match self.asks.keys().next() {
                Some(&price) => price,
                None => break,
            };

            // 매수가 < 최우선 매도가 → 체결 불가
            if taker.price < best_ask_price {
                break;
            }

            let queue = self.asks.get_mut(&best_ask_price).unwrap();
            let maker = queue.front_mut().unwrap();

            let fill_qty = taker.quantity.min(maker.quantity);
            trades.push(Trade {
                maker_order_id: maker.id,
                taker_order_id: taker.id,
                price: best_ask_price,
                quantity: fill_qty,
            });

            maker.quantity -= fill_qty;
            taker.quantity -= fill_qty;

            if maker.quantity == 0 {
                queue.pop_front();
            }
            if queue.is_empty() {
                self.asks.remove(&best_ask_price);
            }
        }

        // 미체결 수량 → bids에 대기
        if taker.quantity > 0 {
            self.bids
                .entry(Reverse(taker.price))
                .or_default()
                .push_back(taker);
        }

        trades
    }

    fn match_sell(&mut self, mut taker: Order) -> Vec<Trade> {
        let mut trades = Vec::new();

        // bids에서 가장 높은 가격부터 체결 시도
        while taker.quantity > 0 {
            let best_bid_price = match self.bids.keys().next() {
                Some(&Reverse(price)) => price,
                None => break,
            };

            // 매도가 > 최우선 매수가 → 체결 불가
            if taker.price > best_bid_price {
                break;
            }

            let queue = self.bids.get_mut(&Reverse(best_bid_price)).unwrap();
            let maker = queue.front_mut().unwrap();

            let fill_qty = taker.quantity.min(maker.quantity);
            trades.push(Trade {
                maker_order_id: maker.id,
                taker_order_id: taker.id,
                price: best_bid_price,
                quantity: fill_qty,
            });

            maker.quantity -= fill_qty;
            taker.quantity -= fill_qty;

            if maker.quantity == 0 {
                queue.pop_front();
            }
            if queue.is_empty() {
                self.bids.remove(&Reverse(best_bid_price));
            }
        }

        // 미체결 수량 → asks에 대기
        if taker.quantity > 0 {
            self.asks
                .entry(taker.price)
                .or_default()
                .push_back(taker);
        }

        trades
    }

    pub fn best_bid(&self) -> Option<u64> {
        self.bids.keys().next().map(|Reverse(p)| *p)
    }

    pub fn best_ask(&self) -> Option<u64> {
        self.asks.keys().next().copied()
    }

    pub fn bid_levels(&self) -> Vec<(u64, u64)> {
        self.bids
            .iter()
            .map(|(Reverse(price), queue)| {
                let total_qty: u64 = queue.iter().map(|o| o.quantity).sum();
                (*price, total_qty)
            })
            .collect()
    }

    pub fn ask_levels(&self) -> Vec<(u64, u64)> {
        self.asks
            .iter()
            .map(|(price, queue)| {
                let total_qty: u64 = queue.iter().map(|o| o.quantity).sum();
                (*price, total_qty)
            })
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_order(side: Side, price: u64, quantity: u64) -> Order {
        Order {
            id: 0, // submit()에서 할당
            symbol: "AAPL".to_string(),
            side,
            price,
            quantity,
            timestamp: 0,
        }
    }

    #[test]
    fn test_no_match_resting_order() {
        let mut book = OrderBook::new("AAPL");
        let (_, trades) = book.submit(make_order(Side::Buy, 100, 10));
        assert!(trades.is_empty());
        assert_eq!(book.best_bid(), Some(100));
        assert_eq!(book.best_ask(), None);
    }

    #[test]
    fn test_full_match() {
        let mut book = OrderBook::new("AAPL");
        book.submit(make_order(Side::Sell, 100, 10));
        let (_, trades) = book.submit(make_order(Side::Buy, 100, 10));

        assert_eq!(trades.len(), 1);
        assert_eq!(trades[0].price, 100);
        assert_eq!(trades[0].quantity, 10);
        assert_eq!(book.best_bid(), None);
        assert_eq!(book.best_ask(), None);
    }

    #[test]
    fn test_partial_match() {
        let mut book = OrderBook::new("AAPL");
        book.submit(make_order(Side::Sell, 100, 5));
        let (_, trades) = book.submit(make_order(Side::Buy, 100, 10));

        assert_eq!(trades[0].quantity, 5);
        assert_eq!(book.best_bid(), Some(100)); // 미체결 5 대기 중
        assert_eq!(book.best_ask(), None);
    }

    #[test]
    fn test_price_priority() {
        let mut book = OrderBook::new("AAPL");
        book.submit(make_order(Side::Sell, 102, 10));
        book.submit(make_order(Side::Sell, 100, 10)); // 더 낮은 가격
        let (_, trades) = book.submit(make_order(Side::Buy, 105, 10));

        // 낮은 가격(100)이 먼저 체결돼야 함
        assert_eq!(trades[0].price, 100);
    }

    #[test]
    fn test_no_match_price_gap() {
        let mut book = OrderBook::new("AAPL");
        book.submit(make_order(Side::Sell, 105, 10));
        let (_, trades) = book.submit(make_order(Side::Buy, 100, 10));

        assert!(trades.is_empty());
        assert_eq!(book.best_bid(), Some(100));
        assert_eq!(book.best_ask(), Some(105));
    }
}
