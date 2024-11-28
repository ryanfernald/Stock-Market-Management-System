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
    date_posted TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Links users to the news articles they have saved.
CREATE TABLE SavedNews (
    user_id VARCHAR(255) NOT NULL,
    news_id INT NOT NULL,
    PRIMARY KEY (user_id, news_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (news_id) REFERENCES News(news_id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Create the Log table to check all the insertion deletion and updates by db admin
CREATE TABLE Log (
    log_id INT AUTO_INCREMENT PRIMARY KEY, 
    table_name VARCHAR(100) NOT NULL,
    operation ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL, 
    affected_row_id VARCHAR(255) NOT NULL,
    operation_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(255),
    details TEXT,       -- Additional details about the operation
    op_status ENUM('SUCCESS', 'FAILURE') DEFAULT 'SUCCESS' -- Whether the operation succeeded or failed
);

-- Create triggers for logging operations
-- in this section these triggers logs activities into log table for these tables
--      {user, market order, stocks, stocks prices} -> insertion,deletion and update, and wether it faild or succed 
--      these logs is going to show up in the admin console

-- Trigger for User table
DELIMITER //

CREATE TRIGGER after_user_insert
AFTER INSERT ON User
FOR EACH ROW
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        INSERT INTO Log (table_name, operation, affected_row_id, details, op_status)
        VALUES ('User', 'INSERT', NEW.user_id, 'Trigger failed.', 'FAILURE');

    END;

    INSERT INTO Log (table_name, operation, affected_row_id, details, op_status)
    VALUES ('User', 'INSERT', NEW.user_id, CONCAT('Email: ', NEW.email), 'SUCCESS');
END;
//

CREATE TRIGGER after_user_update
AFTER UPDATE ON User
FOR EACH ROW
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        INSERT INTO Log (table_name, operation, affected_row_id, details, op_status)
        VALUES ('User', 'UPDATE', NEW.user_id, 'Trigger failed.', 'FAILURE');

    END;

    INSERT INTO Log (table_name, operation, affected_row_id, details, op_status)
    VALUES ('User', 'UPDATE', NEW.user_id, CONCAT('Updated email to: ', NEW.email), 'SUCCESS');
END;
//

CREATE TRIGGER after_user_delete
AFTER DELETE ON User
FOR EACH ROW
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        INSERT INTO Log (table_name, operation, affected_row_id, details, op_status)
        VALUES ('User', 'DELETE', OLD.user_id, 'Trigger failed.', 'FAILURE');

    END;

    INSERT INTO Log (table_name, operation, affected_row_id, details, op_status)
    VALUES ('User', 'DELETE', OLD.user_id, CONCAT('Deleted email: ', OLD.email), 'SUCCESS');
END;
//


-- Triggers for MarketOrder table
CREATE TRIGGER after_market_order_insert
AFTER INSERT ON MarketOrder
FOR EACH ROW
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        INSERT INTO Log (table_name, operation, affected_row_id, details, op_status)
        VALUES ('MarketOrder', 'INSERT', NEW.order_id, 'Trigger failed.', 'FAILURE');
    END;

    INSERT INTO Log (table_name, operation, affected_row_id, details, op_status)
    VALUES ('MarketOrder', 'INSERT', NEW.order_id, CONCAT('Order Type: ', NEW.order_type, ', Quantity: ', NEW.quantity), 'SUCCESS');
END;
//

CREATE TRIGGER after_market_order_update
AFTER UPDATE ON MarketOrder
FOR EACH ROW
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        INSERT INTO Log (table_name, operation, affected_row_id, details, op_status)
        VALUES ('MarketOrder', 'UPDATE', NEW.order_id, 'Trigger failed.', 'FAILURE');

    END;

    INSERT INTO Log (table_name, operation, affected_row_id, details, op_status)
    VALUES ('MarketOrder', 'UPDATE', NEW.order_id, CONCAT('Updated quantity to: ', NEW.quantity), 'SUCCESS');
END;
//

CREATE TRIGGER after_market_order_delete
AFTER DELETE ON MarketOrder
FOR EACH ROW
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        INSERT INTO Log (table_name, operation, affected_row_id, details, op_status)
        VALUES ('MarketOrder', 'DELETE', OLD.order_id, 'Trigger failed.', 'FAILURE');

    END;

    INSERT INTO Log (table_name, operation, affected_row_id, details, op_status)
    VALUES ('MarketOrder', 'DELETE', OLD.order_id, CONCAT('Deleted order type: ', OLD.order_type), 'SUCCESS');
END;
//


-- Triggers for Stock table
CREATE TRIGGER after_stock_insert
AFTER INSERT ON Stock
FOR EACH ROW
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        INSERT INTO Log (table_name, operation, affected_row_id, details, op_status)
        VALUES ('Stock', 'INSERT', NEW.ticker_symbol, 'Trigger failed.', 'FAILURE');

    END;

    INSERT INTO Log (table_name, operation, affected_row_id, details, op_status)
    VALUES ('Stock', 'INSERT', NEW.ticker_symbol, CONCAT('Sector ID: ', NEW.sector_id), 'SUCCESS');
END;
//

CREATE TRIGGER after_stock_update
AFTER UPDATE ON Stock
FOR EACH ROW
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        INSERT INTO Log (table_name, operation, affected_row_id, details, op_status)
        VALUES ('Stock', 'UPDATE', NEW.ticker_symbol, 'Trigger failed.', 'FAILURE');

    END;

    INSERT INTO Log (table_name, operation, affected_row_id, details, op_status)
    VALUES ('Stock', 'UPDATE', NEW.ticker_symbol, CONCAT('Updated sector to: ', NEW.sector_id), 'SUCCESS');
END;
//

CREATE TRIGGER after_stock_delete
AFTER DELETE ON Stock
FOR EACH ROW
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        INSERT INTO Log (table_name, operation, affected_row_id, details, op_status)
        VALUES ('Stock', 'DELETE', OLD.ticker_symbol, 'Trigger failed.', 'FAILURE');

    END;

    INSERT INTO Log (table_name, operation, affected_row_id, details, op_status)
    VALUES ('Stock', 'DELETE', OLD.ticker_symbol, CONCAT('Deleted ticker symbol: ', OLD.ticker_symbol), 'SUCCESS');
END;
//

-- Trigger for StockPrice table
CREATE TRIGGER after_stockprice_insert
AFTER INSERT ON StockPrice
FOR EACH ROW
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        INSERT INTO Log (table_name, operation, affected_row_id, details, op_status)
        VALUES ('StockPrice', 'INSERT', CONCAT(NEW.ticker_symbol, '-', NEW.time_posted), 'Trigger failed.', 'FAILURE');

    END;

    INSERT INTO Log (table_name, operation, affected_row_id, details, op_status)
    VALUES (
        'StockPrice',
        'INSERT',
        CONCAT(NEW.ticker_symbol, '-', NEW.time_posted),
        CONCAT('Price: ', NEW.price, ', Time: ', NEW.time_posted),
        'SUCCESS'
    );
END;
//

CREATE TRIGGER after_stockprice_update
AFTER UPDATE ON StockPrice
FOR EACH ROW
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        INSERT INTO Log (table_name, operation, affected_row_id, details, op_status)
        VALUES ('StockPrice', 'UPDATE', CONCAT(NEW.ticker_symbol, '-', NEW.time_posted), 'Trigger failed.', 'FAILURE');

    END;

    INSERT INTO Log (table_name, operation, affected_row_id, details, op_status)
    VALUES (
        'StockPrice',
        'UPDATE',
        CONCAT(NEW.ticker_symbol, '-', NEW.time_posted),
        CONCAT('Updated price to: ', NEW.price, ', Updated time to: ', NEW.time_posted),
        'SUCCESS'
    );
END;
//

CREATE TRIGGER after_stockprice_delete
AFTER DELETE ON StockPrice
FOR EACH ROW
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        INSERT INTO Log (table_name, operation, affected_row_id, details, op_status)
        VALUES ('StockPrice', 'DELETE', CONCAT(OLD.ticker_symbol, '-', OLD.time_posted), 'Trigger failed.', 'FAILURE');

    END;

    INSERT INTO Log (table_name, operation, affected_row_id, details, op_status)
    VALUES (
        'StockPrice',
        'DELETE',
        CONCAT(OLD.ticker_symbol, '-', OLD.time_posted),
        CONCAT('Deleted price: ', OLD.price, ', Time: ', OLD.time_posted),
        'SUCCESS'
    );
END;
//

DELIMITER ;
