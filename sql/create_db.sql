use YHFinance;
CREATE TABLE User (
    user_id VARCHAR(255) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);
CREATE TABLE Sector(
    sector_name VARCHAR(50) PRIMARY KEY NOT NULL
);
CREATE TABLE Stock (
    ticker_symbol VARCHAR(10) PRIMARY KEY,
    sector_id INT,
    FOREIGN KEY (sector_id) REFERENCES Sector(sector_name) ON UPDATE CASCADE ON DELETE
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

# users saves news article
CREATE TABLE SavedNews(
    user_id
    news_id
);

# news articles saved here
CREATE TABLE News(
    news_id
    news_content
);
