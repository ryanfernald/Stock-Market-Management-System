# USER
use YHFinance;
-- USER table
CREATE TABLE User (
    user_id VARCHAR(255) PRIMARY KEY,
    user_first_name VARCHAR(100) NOT NULL,
    user_last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);

-- SECTORS table
CREATE TABLE Sectors (
    sector_id INT PRIMARY KEY,
    aerospace_defense BOOLEAN DEFAULT FALSE NOT NULL,
    automobiles BOOLEAN DEFAULT FALSE NOT NULL,
    banks BOOLEAN DEFAULT FALSE NOT NULL,
    biotechnology BOOLEAN DEFAULT FALSE NOT NULL,
    chemicals BOOLEAN DEFAULT FALSE NOT NULL,
    communication_services BOOLEAN DEFAULT FALSE NOT NULL,
    construction_engineering BOOLEAN DEFAULT FALSE NOT NULL,
    construction_materials BOOLEAN DEFAULT FALSE NOT NULL,
    consumer_discretionary BOOLEAN DEFAULT FALSE NOT NULL,
    consumer_services BOOLEAN DEFAULT FALSE NOT NULL,
    consumer_staples BOOLEAN DEFAULT FALSE NOT NULL,
    electric_utilities BOOLEAN DEFAULT FALSE NOT NULL,
    energy BOOLEAN DEFAULT FALSE NOT NULL,
    entertainment BOOLEAN DEFAULT FALSE NOT NULL,
    financials BOOLEAN DEFAULT FALSE NOT NULL,
    food_beverage BOOLEAN DEFAULT FALSE NOT NULL,
    gas_utilities BOOLEAN DEFAULT FALSE NOT NULL,
    hardware BOOLEAN DEFAULT FALSE NOT NULL,
    healthcare BOOLEAN DEFAULT FALSE NOT NULL,
    healthcare_equipment_services BOOLEAN DEFAULT FALSE NOT NULL,
    household_products BOOLEAN DEFAULT FALSE NOT NULL,
    industrials BOOLEAN DEFAULT FALSE NOT NULL,
    information_technology BOOLEAN DEFAULT FALSE NOT NULL,
    insurance BOOLEAN DEFAULT FALSE NOT NULL,
    machinery BOOLEAN DEFAULT FALSE NOT NULL,
    materials BOOLEAN DEFAULT FALSE NOT NULL,
    media BOOLEAN DEFAULT FALSE NOT NULL,
    metals_mining BOOLEAN DEFAULT FALSE NOT NULL,
    oil_gas BOOLEAN DEFAULT FALSE NOT NULL,
    pharmaceuticals BOOLEAN DEFAULT FALSE NOT NULL,
    real_estate BOOLEAN DEFAULT FALSE NOT NULL,
    reits BOOLEAN DEFAULT FALSE NOT NULL,
    renewable_energy BOOLEAN DEFAULT FALSE NOT NULL,
    retail BOOLEAN DEFAULT FALSE NOT NULL,
    semiconductors BOOLEAN DEFAULT FALSE NOT NULL,
    software BOOLEAN DEFAULT FALSE NOT NULL,
    telecommunication_services BOOLEAN DEFAULT FALSE NOT NULL,
    utilities BOOLEAN DEFAULT FALSE NOT NULL,
    water_utilities BOOLEAN DEFAULT FALSE NOT NULL
);
-- News Feed table
-- Stores newsfeed information
CREATE TABLE NewsFeed (
    newsfeed_id INT PRIMARY KEY AUTO_INCREMENT,
    source VARCHAR(255),
    txtContext TEXT NOT NULL
);
-- Media Table
-- Stores media files related to newsfeed posts
CREATE TABLE Media (
    media_id INT PRIMARY KEY AUTO_INCREMENT,
    photo_url VARCHAR(255),
    video_url VARCHAR(255)
);
-- STOCK table
CREATE TABLE Stock (
    ticker_symbol VARCHAR(10) PRIMARY KEY,
    sector INT,
    FOREIGN KEY (sector) REFERENCES Sectors(sector_id)
        ON UPDATE CASCADE ON DELETE SET NULL
);

-- STOCK PRICE table
CREATE TABLE StockPrice (
    ticker_symbol VARCHAR(10),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    time_posted TIMESTAMP NOT NULL,
    PRIMARY KEY (ticker_symbol, time_posted),
    FOREIGN KEY (ticker_symbol) REFERENCES Stock(ticker_symbol)
        ON UPDATE CASCADE ON DELETE CASCADE
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
    FOREIGN KEY (user_id) REFERENCES User(user_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (ticker_symbol) REFERENCES Stock(ticker_symbol)
        ON UPDATE CASCADE ON DELETE SET NULL
);

-- PORTFOLIO table
CREATE TABLE Portfolio (
    portfolio_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(255) NOT NULL,
    ticker_symbol VARCHAR(10) NOT NULL,
    quantity INT NOT NULL CHECK (quantity >= 0),
    total_value DECIMAL(10, 2) NOT NULL CHECK (total_value >= 0),
    sector INT,
    FOREIGN KEY (user_id) REFERENCES User(user_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (ticker_symbol) REFERENCES Stock(ticker_symbol)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (sector) REFERENCES Sectors(sector_id)
        ON UPDATE CASCADE ON DELETE SET NULL
);

-- USER BALANCE table
CREATE TABLE UserBalance (
    user_id VARCHAR(255) PRIMARY KEY,
    balance_usd DECIMAL(10, 2) NOT NULL CHECK (balance_usd >= 0),
    FOREIGN KEY (user_id) REFERENCES User(user_id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- FUNDS DEPOSIT table
CREATE TABLE FundsDeposit (
    deposit_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    time_initiated TIMESTAMP NOT NULL,
    cleared BOOLEAN DEFAULT FALSE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES User(user_id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- FUNDS WITHDRAW table
CREATE TABLE FundsWithdraw (
    withdraw_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    time_initiated TIMESTAMP NOT NULL,
    cleared BOOLEAN DEFAULT FALSE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES User(user_id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- WATCHLIST table
CREATE TABLE Watchlist (
    user_id VARCHAR(255) NOT NULL,
    ticker_symbol VARCHAR(10) NOT NULL,
    PRIMARY KEY (user_id, ticker_symbol),
    FOREIGN KEY (user_id) REFERENCES User(user_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (ticker_symbol) REFERENCES Stock(ticker_symbol)
        ON UPDATE CASCADE ON DELETE CASCADE
);

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
CREATE TABLE NewsFeedMedia (
    newsfeed_id INT,
    media_id INT,
    PRIMARY KEY (newsfeed_id, media_id),
    FOREIGN KEY (newsfeed_id) REFERENCES NewsFeed(newsfeed_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (media_id) REFERENCES Media(media_id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- Activity Wall table 
-- Logs user activities, such as shared newsfeed or posted purchase orders.
CREATE TABLE ActivityWall (
    activity_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(255) NOT NULL,
    activity_type ENUM('NEWSFEED_SHARE', 'PURCHASE_ORDER') NOT NULL,
    FOREIGN KEY (user_id) REFERENCES User(user_id)
        ON UPDATE CASCADE ON DELETE CASCADE
);
 -- NF Activity Table
 --  Associates ActivityWall entries with NewsFeed items
CREATE TABLE NewsFeedActivity (
    activity_id INT,
    newsfeed_id INT,
    PRIMARY KEY (activity_id, newsfeed_id),
    FOREIGN KEY (activity_id) REFERENCES ActivityWall(activity_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (newsfeed_id) REFERENCES NewsFeed(newsfeed_id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- PO Table
-- Associates ActivityWall entries with PurchaseOrder
CREATE TABLE PurchaseOrderActivity (
    activity_id INT,
    order_id INT,
    PRIMARY KEY (activity_id, order_id),
    FOREIGN KEY (activity_id) REFERENCES ActivityWall(activity_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES MarketOrder(order_id)
        ON UPDATE CASCADE ON DELETE CASCADE
);
