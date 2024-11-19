use YHFinance;

CREATE TABLE User (
    user_id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL
);

-- This table categorizes stocks into different market sectors.
CREATE TABLE Sector(
    sector_id INT PRIMARY KEY,
    sector_name VARCHAR(50) NOT NULL
);

-- This table contains information about stocks available on the platform.
CREATE TABLE Stock (
    ticker_symbol VARCHAR(10) PRIMARY KEY,
    sector_id INT,
    FOREIGN KEY (sector_id) REFERENCES Sector(sector_id) ON UPDATE CASCADE ON DELETE SET NULL
);

-- Tracks historical prices of each stock, recorded with timestamps.
CREATE TABLE StockPrice (
    ticker_symbol VARCHAR(10),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    time_posted TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ticker_symbol, time_posted),
    FOREIGN KEY (ticker_symbol) REFERENCES Stock(ticker_symbol) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Records all stock transactions (buy/sell) initiated by users.
CREATE TABLE MarketOrder (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(255) NOT NULL,
    ticker_symbol VARCHAR(10),
    price_purchased DECIMAL(10, 2) NOT NULL CHECK (price_purchased >= 0),
    quantity INT NOT NULL CHECK (quantity > 0),
    purchase_date DATETIME NOT NULL,
    order_type ENUM('BUY', 'SELL') NOT NULL,
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (ticker_symbol) REFERENCES Stock(ticker_symbol) ON UPDATE CASCADE ON DELETE SET NULL
);

-- Maintains the USD balance for each user on the platform.
CREATE TABLE UserBalance (
    user_id VARCHAR(255) PRIMARY KEY,
    balance_usd DECIMAL(10, 2) NOT NULL CHECK (balance_usd >= 0),
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Tracks deposits made by users into their accounts.
CREATE TABLE FundsDeposit (
    deposit_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    time_initiated TIMESTAMP NOT NULL,
    cleared BOOLEAN DEFAULT FALSE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Records withdrawal requests made by users.
CREATE TABLE FundsWithdraw (
    withdraw_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    time_initiated TIMESTAMP NOT NULL,
    cleared BOOLEAN DEFAULT FALSE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Allows users to save stocks they are interested in tracking.
CREATE TABLE Watchlist (
    user_id VARCHAR(255) NOT NULL,
    ticker_symbol VARCHAR(10) NOT NULL,
    PRIMARY KEY (user_id, ticker_symbol),
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (ticker_symbol) REFERENCES Stock(ticker_symbol) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Stores news articles that users can save for later reference.
CREATE TABLE News (
    news_id INT PRIMARY KEY AUTO_INCREMENT,
    news_content TEXT NOT NULL,
    time_posted TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Links users to the news articles they have saved.
CREATE TABLE SavedNews (
    user_id VARCHAR(255) NOT NULL,
    news_id INT NOT NULL,
    PRIMARY KEY (user_id, news_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (news_id) REFERENCES News(news_id) ON UPDATE CASCADE ON DELETE CASCADE
);
