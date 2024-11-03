use stonks_market;

INSERT INTO User (user_id, first_name, last_name, email)
VALUES
    ('user1', 'John', 'Doe', 'johndoe@example.com'),
    ('user2', 'Jane', 'Smith', 'janesmith@example.com');

INSERT INTO UserBalance (user_id, balance_usd)
VALUES
    ('user1', 0.00),
    ('user2', 0.00);

INSERT INTO Sector (sector_id, sector_name)
VALUES
    (1, 'Technology'),
    (2, 'Finance');

INSERT INTO Stock (ticker_symbol, sector_id)
VALUES
    ('AAPL', 1),
    ('GOOGL', 1),
    ('JPM', 2),
    ('BAC', 2);

INSERT INTO StockPrice (ticker_symbol, price, time_posted)
VALUES
    ('AAPL', 150.00, '2023-01-01 09:00:00'),
    ('AAPL', 155.00, '2023-01-02 09:00:00'),
    ('GOOGL', 2800.00, '2023-01-01 09:00:00'),
    ('GOOGL', 2850.00, '2023-01-02 09:00:00'),
    ('JPM', 160.00, '2023-01-01 09:00:00'),
    ('BAC', 40.00, '2023-01-01 09:00:00');

# INSERT INTO MarketOrder (user_id, ticker_symbol, price_purchased, quantity, purchase_date, order_type)
# VALUES
#     ('user1', 'AAPL', 150.00, 10, '2023-01-01 10:00:00', 'BUY'),
#     ('user1', 'GOOGL', 2800.00, 5, '2023-01-01 11:00:00', 'BUY'),
#     ('user2', 'JPM', 160.00, 20, '2023-01-01 12:00:00', 'BUY'),
#     ('user2', 'AAPL', 155.00, 5, '2023-01-02 10:00:00', 'SELL');

# INSERT INTO FundsDeposit (user_id, amount, time_initiated, cleared)
# VALUES
#     ('user1', 10000.00, '2023-01-01 08:00:00', TRUE),
#     ('user2', 5000.00, '2023-01-01 08:30:00', TRUE);
#
# INSERT INTO FundsWithdraw (user_id, amount, time_initiated, cleared)
# VALUES
#     ('user1', 2000.00, '2023-01-02 14:00:00', TRUE),
#     ('user2', 1000.00, '2023-01-02 15:00:00', TRUE);

INSERT INTO Watchlist (user_id, ticker_symbol)
VALUES
    ('user1', 'AAPL'),
    ('user1', 'GOOGL'),
    ('user2', 'JPM'),
    ('user2', 'BAC');

INSERT INTO SupportedStocks (ticker_symbol)
VALUES
    ('AAPL'),
    ('GOOGL'),
    ('JPM'),
    ('BAC');
