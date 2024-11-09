use YHFinance;
CREATE TABLE User (
    user_id VARCHAR(255) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);
CREATE TABLE Sector(
    sector_id INT PRIMARY KEY,
    sector_name VARCHAR(50) NOT NULL
);
CREATE TABLE Stock (
    ticker_symbol VARCHAR(10) PRIMARY KEY,
    sector_id INT,
    FOREIGN KEY (sector_id) REFERENCES Sector(sector_id) ON UPDATE CASCADE ON DELETE
    SET NULL
);
-- STOCK PRICE table
CREATE TABLE StockPrice (
    ticker_symbol VARCHAR(10),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    time_posted TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ticker_symbol, time_posted),
    FOREIGN KEY (ticker_symbol) REFERENCES Stock(ticker_symbol) ON UPDATE CASCADE ON DELETE CASCADE
);
-- MARKET ORDER table
CREATE TABLE MarketOrder (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(255) NOT NULL,
    ticker_symbol VARCHAR(10),
    price_purchased DECIMAL(10, 2) NOT NULL CHECK (price_purchased >= 0),
    quantity INT NOT NULL CHECK (quantity > 0),
    purchase_date DATETIME NOT NULL,
    order_type ENUM('BUY', 'SELL') NOT NULL,
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (ticker_symbol) REFERENCES Stock(ticker_symbol) ON UPDATE CASCADE ON DELETE
    SET NULL
);
-- USER BALANCE table
CREATE TABLE UserBalance (
    user_id VARCHAR(255) PRIMARY KEY,
    balance_usd DECIMAL(10, 2) NOT NULL CHECK (balance_usd >= 0),
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON UPDATE CASCADE ON DELETE CASCADE
);
-- FUNDS DEPOSIT table
CREATE TABLE FundsDeposit (
    deposit_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    time_initiated TIMESTAMP NOT NULL,
    cleared BOOLEAN DEFAULT FALSE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON UPDATE CASCADE ON DELETE CASCADE
);
-- FUNDS WITHDRAW table
CREATE TABLE FundsWithdraw (
    withdraw_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    time_initiated TIMESTAMP NOT NULL,
    cleared BOOLEAN DEFAULT FALSE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON UPDATE CASCADE ON DELETE CASCADE
);
-- WATCHLIST table
CREATE TABLE Watchlist (
    user_id VARCHAR(255) NOT NULL,
    ticker_symbol VARCHAR(10) NOT NULL,
    PRIMARY KEY (user_id, ticker_symbol),
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (ticker_symbol) REFERENCES Stock(ticker_symbol) ON UPDATE CASCADE ON DELETE CASCADE
);
-- List of supported stocks
CREATE TABLE SupportedStocks (ticker_symbol VARCHAR(10) PRIMARY KEY);
-- 10 entities up to this point
-- AN: I think its better to handle newfeed by querying
-- we still have 10 entities
-- CREATE TABLE NewsSource (
--     news_post_id INT PRIMARY KEY AUTO_INCREMENT,
--     ticker_symbol VARCHAR(10),
--     content TEXT,
--     time_posted TIMESTAMP,
--     FOREIGN KEY (ticker_symbol) REFERENCES Stock(ticker_symbol)
-- );
-- NF Media Table
-- Links NewsFeed and Media
-- News Feed table
-- Stores newsfeed information
-- Media Table
-- Stores media files related to newsfeed posts
-- Activity Wall table
-- Logs user activities, such as shared newsfeed or posted purchase orders.
CREATE TABLE DashBoard (
    dashboard_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(255) NOT NULL,
    activity_type ENUM('NEWSFEED_SHARE', 'PURCHASE_ORDER') NOT NULL,
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON UPDATE CASCADE ON DELETE CASCADE
);
-- POActivity Table
-- Associates DashBoard entries with PurchaseOrder
CREATE TABLE PurchaseOrderActivity (
    dashboard_id INT,
    order_id INT,
    PRIMARY KEY (dashboard_id, order_id),
    FOREIGN KEY (dashboard_id) REFERENCES DashBoard(dashboard_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES MarketOrder(order_id) ON UPDATE CASCADE ON DELETE CASCADE
);