import json
from flask import jsonify
import psycopg2
import mysql
import mysql.connector

class DataBase:
    #this help us switch between mysql and postgress easily
    def __init__(self, host, user, password, database, port=3306, db='mysql'):
        try:
            if db == 'mysql':
                self.connection = mysql.connector.connect(
                    host=host,
                    user=user,
                    password=password,
                    database=database,
                    port=port
                )
            elif db == 'postgres':
                self.connection = psycopg2.connect(
                    host=host,
                    user=user,
                    password=password,
                    database=database,
                    port=port
                )
                self.connection.autocommit = True  # Optional: Automatically commit changes
            else:
                raise ValueError("Unsupported database type. Use 'mysql' or 'postgres'.")

            self.cursor = self.connection.cursor()

        except Exception as e:
            print(f"Error connecting to the database: {e}")
            self.connection = None
            self.cursor = None

# Test Connection
    def test_connection(self):
        self.cursor.execute("""
             SELECT table_name 
             FROM information_schema.tables
             WHERE table_schema = 'public'
         """)
        tables = self.cursor.fetchall()
        table_names = [table[0] for table in tables]
        return jsonify({
            "status": "success",
            "tables": table_names
        })
# get courser
    def get_courser(self):
        return self.cursor
 # Close the connection
    def close(self):
        if self.cursor:
            self.cursor.close()
        if self.connection:
            self.connection.close()
            print("Database connection closed")
# Transaction History (tested)
    # Retrieves transaction history for a user in JSON format.
    # Returns JSON string of a list of transactions with each transaction's details.
    def get_user_transaction_history(self, user_id):
        transaction_query = """
            SELECT order_id, ticker_symbol, order_type, quantity, price_purchased, purchase_date
            FROM MarketOrder
            WHERE user_id = %s
            ORDER BY purchase_date ASC
        """
        self.cursor.execute(transaction_query, (user_id,))
        transactions = self.cursor.fetchall()

        transaction_history = [
            {
                "order_id": row[0],
                "ticker_symbol": row[1],
                "order_type": row[2],
                "quantity": row[3],
                "price_purchased": float(row[4]),
                "purchase_date": row[5].strftime("%Y-%m-%dT%H:%M:%SZ")
            }
            for row in transactions
        ]
        return jsonify(transaction_history)

# Portfolio (tested)
    # Retrieves user's stock portfolio, including quantities, value, and profit.
    # Returns JSON string of a list of assets with financial details.
    def get_user_portfolio(self, user_id):
        portfolio_query = """
            SELECT ticker_symbol, order_type, quantity, price_purchased
            FROM MarketOrder
            WHERE user_id = %s
        """
        self.cursor.execute(portfolio_query, (user_id,))
        transactions = self.cursor.fetchall()

        portfolio = {}
        for ticker_symbol, order_type, quantity, price_purchased in transactions:
            if ticker_symbol not in portfolio:
                portfolio[ticker_symbol] = {"quantity_available": 0, "total_purchased": 0, "total_sold": 0}

            if order_type == 'BUY':
                portfolio[ticker_symbol]["quantity_available"] += quantity
                portfolio[ticker_symbol]["total_purchased"] += price_purchased * quantity
            elif order_type == 'SELL':
                portfolio[ticker_symbol]["quantity_available"] -= quantity
                portfolio[ticker_symbol]["total_sold"] += price_purchased * quantity

        assets = []
        for ticker, data in portfolio.items():
            if data["quantity_available"] > 0:
                most_recent_price_data = self.get_most_recent_stock_price(ticker)
                if most_recent_price_data:
                    most_recent_price_data = json.loads(most_recent_price_data)
                    current_price = most_recent_price_data["price"]
                    total_current_value = current_price * data["quantity_available"]
                    current_profit = (float(data["total_sold"]) + float(total_current_value)) - float(data["total_purchased"])
                    current_profit_percent = f"{(((float(data['total_sold']) + float(total_current_value)) / float(data['total_purchased']) - 1) * 100):.2f}"
                    assets.append({
                        "ticker_symbol": ticker,
                        "quantity": data["quantity_available"],
                        "total_current_value": float(total_current_value),
                        "total_purchased": float(data["total_purchased"]),
                        "total_sold": float(data["total_sold"]),
                        "current_profit": current_profit,
                        "current_profit_percent": current_profit_percent,
                        "current_price": float(current_price)
                    })
        if assets:
            return jsonify(sorted(assets, key=lambda x: x["ticker_symbol"]))
        else:
            return jsonify(None)

    # Calculates the total current value of the user's portfolio.
    # Returns a float representing the total value.
    def get_user_portfolio_value(self, user_id):
        assets_json = self.get_user_portfolio(user_id)
        assets = json.loads(assets_json)
        if assets:
            total_portfolio_value = sum(asset["total_current_value"] for asset in assets)
            return total_portfolio_value
        return 0

# Stock Manipulation (tested)
    # Buys a specified quantity of stock for a user if funds are sufficient.
    # Returns None, but updates user's balance and adds a new buy order in the database.
    def buy_stock(self, user_id, ticker, quantity):
        user_balance = json.loads(self.get_user_balance(user_id))["net_balance"]
        price_query = """
            SELECT price
            FROM StockPrice
            WHERE ticker_symbol = %s
            ORDER BY time_posted DESC
            LIMIT 1
        """
        self.cursor.execute(price_query, (ticker,))
        stock_price = self.cursor.fetchone()[0]
        total_cost = stock_price * quantity

        if user_balance < total_cost:
            raise ValueError("Insufficient balance to complete this purchase.")

        update_balance_query = """
            UPDATE UserBalance
            SET balance_usd = balance_usd - %s
            WHERE user_id = %s
        """
        self.cursor.execute(update_balance_query, (total_cost, user_id))

        insert_order_query = """
            INSERT INTO MarketOrder (user_id, ticker_symbol, price_purchased, quantity, purchase_date, order_type)
            VALUES (%s, %s, %s, %s, NOW(), 'BUY')
        """
        self.cursor.execute(insert_order_query, (user_id, ticker, stock_price, quantity))

        self.connection.commit()

    # Sells a specified quantity of stock for a user if holdings are sufficient.
    # Returns None, but updates user's balance and adds a new sell order in the database.
    def sell_stock(self, user_id, ticker, quantity):
        portfolio = json.loads(self.get_user_portfolio(user_id))
        portfolio_entry = next((entry for entry in portfolio if entry['ticker_symbol'] == ticker), None)

        if not portfolio_entry or portfolio_entry['quantity'] < quantity:
            raise ValueError("Insufficient shares to complete this sale.")

        price_query = """
            SELECT price
            FROM StockPrice
            WHERE ticker_symbol = %s
            ORDER BY time_posted DESC
            LIMIT 1
        """
        self.cursor.execute(price_query, (ticker,))
        stock_price = self.cursor.fetchone()[0]
        total_sale_amount = stock_price * quantity

        update_balance_query = """
            UPDATE UserBalance
            SET balance_usd = balance_usd + %s
            WHERE user_id = %s
        """
        self.cursor.execute(update_balance_query, (total_sale_amount, user_id))

        insert_order_query = """
            INSERT INTO MarketOrder (user_id, ticker_symbol, price_purchased, quantity, purchase_date, order_type)
            VALUES (%s, %s, %s, %s, NOW(), 'SELL')
        """
        self.cursor.execute(insert_order_query, (user_id, ticker, stock_price, quantity))

        self.connection.commit()

    # Retrieves a list of all supported stock ticker symbols from the Stock table.
    # Returns a JSON string containing a list of ticker symbols.
    def get_list_of_supported_stocks(self):
        query = """
            SELECT ticker_symbol
            FROM Stock
        """
        self.cursor.execute(query)
        stocks = [row[0] for row in self.cursor.fetchall()]  # Extract ticker symbols into a list
        return jsonify(stocks)

# Stock Price (tested)
    # Adds a new stock price to the StockPrice table.
    # Returns None but inserts price information for a stock ticker.
    def add_stock_price(self, ticker_symbol, price):
        query = """
               INSERT INTO StockPrice (ticker_symbol, price)
               VALUES (%s, %s)
                       """
        self.cursor.execute(query, (ticker_symbol, price))
        self.connection.commit()

    # Retrieves the most recent stock price for a ticker in JSON format.
    # Returns JSON string with price and time of last update.
    def get_most_recent_stock_price(self, ticker):
        query = """
            SELECT price, time_posted
            FROM StockPrice
            WHERE ticker_symbol = %s
            ORDER BY time_posted DESC
            LIMIT 1
        """
        self.cursor.execute(query, (ticker,))
        result = self.cursor.fetchone()
        if result:
            price, time_posted = result
            response = {
                "price": float(price),
                "time_posted": time_posted.strftime("%Y-%m-%dT%H:%M:%SZ")
            }
            return jsonify(response)
        else:
            return jsonify(None)

# User Balance (tested)
    # Adds funds to the user's account balance and logs the deposit.
    # Returns None, but updates user's balance and records deposit in the database.
    def add_funds(self, user_id, amount):
        if amount <= 0:
            raise ValueError("Amount must be greater than zero.")

        insert_deposit_query = """
            INSERT INTO FundsDeposit (user_id, amount, time_initiated, cleared)
            VALUES (%s, %s, NOW(), TRUE)
        """
        self.cursor.execute(insert_deposit_query, (user_id, amount))

        update_balance_query = """
            UPDATE UserBalance
            SET balance_usd = balance_usd + %s
            WHERE user_id = %s
        """
        self.cursor.execute(update_balance_query, (amount, user_id))

        self.connection.commit()

    # Withdraws funds from user's account if balance is sufficient.
    # Returns None, but updates user's balance and logs withdrawal in the database.
    def withdraw_funds(self, user_id, amount):
        if amount <= 0:
            raise ValueError("Amount must be greater than zero.")

        # user_balance = json.loads(self.get_user_balance(user_id))["net_balance"]
        # if user_balance < amount:
        #     raise ValueError("Insufficient balance to complete this withdrawal.")

        insert_withdraw_query = """
            INSERT INTO FundsWithdraw (user_id, amount, time_initiated, cleared)
            VALUES (%s, %s, NOW(), TRUE)
        """
        self.cursor.execute(insert_withdraw_query, (user_id, amount))

        update_balance_query = """
            UPDATE UserBalance
            SET balance_usd = balance_usd - %s
            WHERE user_id = %s
        """
        self.cursor.execute(update_balance_query, (amount, user_id))

        self.connection.commit()

    # Retrieves user's balance, deposits, withdrawals, and market orders in JSON format.
    # Returns JSON string with total deposits, withdrawals, net market orders, and net balance.
    def get_user_balance(self, user_id):
        deposit_query = """
            SELECT COALESCE(SUM(amount), 0) 
            FROM FundsDeposit 
            WHERE user_id = %s AND cleared = TRUE
        """
        withdraw_query = """
            SELECT COALESCE(SUM(amount), 0) 
            FROM FundsWithdraw 
            WHERE user_id = %s AND cleared = TRUE
        """
        market_order_query = """
            SELECT COALESCE(SUM(
                CASE 
                    WHEN order_type = 'BUY' THEN -price_purchased * quantity 
                    WHEN order_type = 'SELL' THEN price_purchased * quantity 
                    ELSE 0
                END
            ), 0) 
            FROM MarketOrder 
            WHERE user_id = %s
        """
        self.cursor.execute(deposit_query, (user_id,))
        total_deposit = self.cursor.fetchone()[0]
        self.cursor.execute(withdraw_query, (user_id,))
        total_withdraw = self.cursor.fetchone()[0]
        self.cursor.execute(market_order_query, (user_id,))
        net_market_orders = self.cursor.fetchone()[0]
        net_balance = total_deposit - total_withdraw + net_market_orders
        balance_data = {
            "total_deposit": float(total_deposit),
            "total_withdraw": float(total_withdraw),
            "net_market_orders": float(net_market_orders),
            "net_balance": float(net_balance)
        }
        return jsonify(balance_data)

# User Manipulation (tested)
    # Adds a new user to the User table.
    # Returns None but inserts user data into the database.
    def add_user(self, user_id, first_name, last_name, email):
        query = """
                INSERT INTO User (user_id, first_name, last_name, email)
                VALUES (%s, %s, %s, %s)
            """
        self.cursor.execute(query, (user_id, first_name, last_name, email))
        self.connection.commit()

    # Retrieves user data by user_id in JSON format.
    # Returns JSON string with user's basic details or None if the user does not exist.
    def get_user_data(self, user_id):
        query = """
            SELECT user_id, first_name, last_name, email
            FROM User
            WHERE user_id = %s
        """
        self.cursor.execute(query, (user_id,))
        result = self.cursor.fetchone()
        if result:
            user_id, first_name, last_name, email = result
            response = {
                "user_id": user_id,
                "first_name": first_name,
                "last_name": last_name,
                "email": email
            }
            return jsonify(response)
        else:
            return jsonify(None)

    def admin_insertion(self, TableName, data):
        columns = ', '.join(data.keys())
        values = ', '.join(f"'{v}'" for v in data.values())
        query = f"INSERT INTO {TableName} ({columns}) VALUES ({values})"
        try:
            # Execute the query with the provided values
            self.cursor.execute(query,data)
            self.connection.commit()
            print(f"Inserted {data} into {TableName}")
        except mysql.connector.Error as error:
            print(f"Error: {error}")
        finally:
            self.cursor.close()
            self.connection.close()


    ## Functions for fetching
    
    # Check if today's entry exists for a specific ticker
    def check_today_entry_exists(self, ticker_symbol, date):
        query = "SELECT 1 FROM StockPrice WHERE ticker_symbol = %s AND DATE(time_posted) = %s"
        self.cursor.execute(query, (ticker_symbol, date))
        result = self.cursor.fetchone()
        return result is not None

    # Insert or update stock price for a ticker and timestamp
    def insert_or_update_price(self, ticker_symbol, price, timestamp):
        query = """
            INSERT INTO StockPrice (ticker_symbol, price, time_posted)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE
                price = VALUES(price),
                time_posted = VALUES(time_posted)
        """
        self.cursor.execute(query, (ticker_symbol, price, timestamp))
        self.connection.commit()

    # Clear all data from a specified table
    def clear_table(self, table_name):
        query = f"TRUNCATE TABLE {table_name}"
        self.cursor.execute(query)
        self.connection.commit()

    # Insert or replace stock data for a ticker and sector
    def insert_or_replace_stock(self, ticker_symbol, sector_name):
        sector_id = self.get_or_create_sector(sector_name)
        query = """
            REPLACE INTO Stock (ticker_symbol, sector_id)
            VALUES (%s, %s)
        """
        self.cursor.execute(query, (ticker_symbol, sector_id))
        self.connection.commit()

    # Fetch or create a sector ID for a sector name
    def get_or_create_sector(self, sector_name):
        # Check if the sector already exists
        self.cursor.execute("SELECT sector_id FROM Sector WHERE sector_name = %s", (sector_name,))
        result = self.cursor.fetchone()
        if result:
            return result[0]  # Return the existing sector_id

        # Create a new sector if it does not exist
        self.cursor.execute("SELECT COALESCE(MAX(sector_id), 0) + 1 FROM Sector")
        new_sector_id = self.cursor.fetchone()[0]
        self.cursor.execute(
            "INSERT INTO Sector (sector_id, sector_name) VALUES (%s, %s)",
            (new_sector_id, sector_name)
        )
        self.connection.commit()
        return new_sector_id  # Return the new sector_id

    # Fetch all ticker symbols from the Stock table
    def fetch_sp500_tickers(self):
        query = "SELECT ticker_symbol FROM Stock"
        self.cursor.execute(query)
        result = self.cursor.fetchall()
        return list(result)

# TODO
# x make sure all are json
# x make sure no error handling happens, errors passed to front

######### FUNCTIONS FOR FRONT END WISH LIST #########

'''When a user owns a stock, '''

######################################################