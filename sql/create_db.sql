# USER
CREATE TABLE User (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(100) # not sure how secure this is
);


# STOCK
CREATE TABLE Stock (
    ticker_symbol VARCHAR(10) PRIMARY KEY,
    sector ENUM(
        'Aerospace & Defense',
        'Automobiles',
        'Banks',
        'Biotechnology',
        'Chemicals',
        'Communication Services',
        'Construction & Engineering',
        'Construction Materials',
        'Consumer Discretionary',
        'Consumer Services',
        'Consumer Staples',
        'Electric Utilities',
        'Energy',
        'Entertainment',
        'Financials',
        'Food & Beverage',
        'Gas Utilities',
        'Hardware',
        'Healthcare',
        'Healthcare Equipment & Services',
        'Household Products',
        'Industrials',
        'Information Technology',
        'Insurance',
        'Machinery',
        'Materials',
        'Media',
        'Metals & Mining',
        'Oil & Gas',
        'Pharmaceuticals',
        'Real Estate',
        'Real Estate Investment Trusts (REITs)',
        'Renewable Energy',
        'Retail',
        'Semiconductors',
        'Software',
        'Telecommunication Services',
        'Utilities',
        'Water Utilities'
    )
);

CREATE TABLE StockPrice (
    ticker_symbol VARCHAR(10),
    price DECIMAL(10, 2),
    time_posted TIMESTAMP,
    PRIMARY KEY (ticker_symbol, time_posted),
    FOREIGN KEY (ticker_symbol) REFERENCES Stock(ticker_symbol)
);

CREATE TABLE MarketOrder (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    ticker_symbol VARCHAR(10),
    price_purchased DECIMAL(10, 2),
    quantity INT,
    purchase_date DATETIME,
    order_type ENUM('BUY', 'SELL'),
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (ticker_symbol) REFERENCES Stock(ticker_symbol)
);

CREATE TABLE Portfolio (
    portfolio_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    ticker_symbol VARCHAR(10),
    quantity INT,
    total_value DECIMAL(10, 2),
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (ticker_symbol) REFERENCES Stock(ticker_symbol)
);


# BALANCE
CREATE TABLE UserBalance (
    user_id INT PRIMARY KEY,
    balance_usd DECIMAL(10, 2),
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);

CREATE TABLE FundsDeposit (
    deposit_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    amount DECIMAL(10, 2),
    time_initiated TIMESTAMP,
    cleared BOOLEAN,
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);

CREATE TABLE FundsWithdraw (
    withdraw_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    amount DECIMAL(10, 2),
    time_initiated TIMESTAMP,
    cleared BOOLEAN,
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);


# NEWS
CREATE TABLE Watchlist (
    user_id INT,
    ticker_symbol VARCHAR(10),
    PRIMARY KEY(user_id, ticker_symbol),
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (ticker_symbol) REFERENCES Stock(ticker_symbol)
);

CREATE TABLE NewsSource (
    news_post_id INT PRIMARY KEY AUTO_INCREMENT,
    ticker_symbol VARCHAR(10),
    content TEXT,
    time_posted TIMESTAMP,
    FOREIGN KEY (ticker_symbol) REFERENCES Stock(ticker_symbol)
);


# exactly 10 tables, lets go

# TODO
# Add NOT NULL where applicable
# Add constrains
# Add ON UPDATE ON DELETE