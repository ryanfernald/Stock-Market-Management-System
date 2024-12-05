import json
from flask import jsonify
import psycopg2
import mysql
import mysql.connector
import os
import pandas as pd
import requests
from io import StringIO

class DataBase:

    def __init__(self, host, user, password, database, port=3306, db='mysql'):
        self.host = host
        self.user = user
        self.password = password
        self.database = database
        self.port = port
        self.db = db

    def connect_to_db(self):
        if self.db == 'mysql':
            connection = mysql.connector.connect(
                host=self.host,
                user=self.user,
                password=self.password,
                database=self.database,
                port=self.port
            )
        elif self.db == 'postgres':
            connection = psycopg2.connect(
                host=self.host,
                user=self.user,
                password=self.password,
                database=self.database,
                port=self.port
            )
            connection.autocommit = True  # Optional: Automatically commit changes
        else:
            raise ValueError("Unsupported database type. Use 'mysql' or 'postgres'.")

        cursor = connection.cursor()
        return cursor, connection

    def close_db(self, cursor,conn):
        try:
            if cursor:
                cursor.close()
                print("Database cursor closed.")
            if self.cursor:
                self.cursor.close()       
        except Exception as e:
            print(f"Error closing cursor: {e}")

        try:
            if self.connection:
                self.connection.close()
        except Exception as e:
            print(f"Error closing connection: {e}")

# Transaction History (tested)
    # Retrieves transaction history for a user in JSON format.
    # Returns JSON string of a list of transactions with each transaction's details.
    def get_user_transaction_history(self, user_id):
        cursor,conn=self.connect_to_db()

        transaction_query = """
            SELECT order_id, ticker_symbol, order_type, quantity, price_purchased, purchase_date
            FROM MarketOrder
            WHERE user_id = %s
            ORDER BY purchase_date ASC
        """
        cursor.execute(transaction_query, (user_id,))
        transactions = cursor.fetchall()

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

        self.close_db(cursor,conn)
        return jsonify(transaction_history)

# Portfolio (tested)
    # Retrieves user's stock portfolio, including quantities, value, and profit.
    # Returns JSON string of a list of assets with financial details.
    def get_user_portfolio(self, user_id):
        cursor,conn=self.connect_to_db()

        portfolio_query = """
            SELECT ticker_symbol, order_type, quantity, price_purchased
            FROM MarketOrder
            WHERE user_id = %s
        """
        cursor.execute(portfolio_query, (user_id,))
        transactions = cursor.fetchall()

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
                    print("AAA", most_recent_price_data)
                  
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
        self.close_db(cursor,conn)
        if assets:
            return jsonify(sorted(assets, key=lambda x: x["ticker_symbol"]))
        else:
            return jsonify(None)

    # Calculates the total current value of the user's portfolio.
    # Returns a float representing the total value.
    def get_user_portfolio_value(self, user_id):
        cursor,conn=self.connect_to_db()
        print(cursor, conn)

        portfolio_query = """
            SELECT ticker_symbol, order_type, quantity, price_purchased
            FROM MarketOrder
            WHERE user_id = %s
        """
        cursor.execute(portfolio_query, (user_id,))
        transactions = cursor.fetchall()

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
        
        self.close_db(cursor,conn)
        print(assets)
        if assets:
            total_portfolio_value = sum(asset["total_current_value"] for asset in assets)
            print(total_current_value)
            return jsonify(total_portfolio_value)
        return jsonify(0)

# Stock Manipulation (tested)
    # Buys a specified quantity of stock for a user if funds are sufficient.
    # Returns None, but updates user's balance and adds a new buy order in the database.
    def buy_stock(self, user_id, ticker, quantity):
        cursor,conn=self.connect_to_db()
        # print(f"AAAA{user_id}{self.get_user_balance(user_id)}, {str(self.get_user_balance(user_id))}")
        # user_balance = json.loads(str(self.get_user_balance(user_id)))["net_balance"]
        price_query = """
            SELECT price
            FROM StockPrice
            WHERE ticker_symbol = %s
            ORDER BY time_posted DESC
            LIMIT 1
        """
        cursor.execute(price_query, (ticker,))
        stock_price = cursor.fetchone()[0]
        total_cost = stock_price * quantity

        # if user_balance < total_cost:
        #     raise ValueError("Insufficient balance to complete this purchase.")

        update_balance_query = """
            UPDATE UserBalance
            SET balance_usd = balance_usd - %s
            WHERE user_id = %s
        """
        cursor.execute(update_balance_query, (total_cost, user_id))

        insert_order_query = """
            INSERT INTO MarketOrder (user_id, ticker_symbol, price_purchased, quantity, purchase_date, order_type)
            VALUES (%s, %s, %s, %s, NOW(), 'BUY')
        """
        cursor.execute(insert_order_query, (user_id, ticker, stock_price, quantity))
        conn.commit()
        self.close_db(cursor,conn)

    # Sells a specified quantity of stock for a user if holdings are sufficient.
    # Returns None, but updates user's balance and adds a new sell order in the database.
    def sell_stock(self, user_id, ticker, quantity):
        cursor,conn=self.connect_to_db()

        # portfolio = json.loads(self.get_user_portfolio(user_id))
        # portfolio_entry = next((entry for entry in portfolio if entry['ticker_symbol'] == ticker), None)

        # if not portfolio_entry or portfolio_entry['quantity'] < quantity:
        #     raise ValueError("Insufficient shares to complete this sale.")

        price_query = """
            SELECT price
            FROM StockPrice
            WHERE ticker_symbol = %s
            ORDER BY time_posted DESC
            LIMIT 1
        """
        cursor.execute(price_query, (ticker,))
        stock_price = cursor.fetchone()[0]
        total_sale_amount = stock_price * quantity

        update_balance_query = """
            UPDATE UserBalance
            SET balance_usd = balance_usd + %s
            WHERE user_id = %s
        """
        cursor.execute(update_balance_query, (total_sale_amount, user_id))

        insert_order_query = """
            INSERT INTO MarketOrder (user_id, ticker_symbol, price_purchased, quantity, purchase_date, order_type)
            VALUES (%s, %s, %s, %s, NOW(), 'SELL')
        """
        cursor.execute(insert_order_query, (user_id, ticker, stock_price, quantity))

        conn.commit()
        self.close_db(cursor,conn)

    # Retrieves a list of all supported stock ticker symbols from the Stock table.
    # Returns a JSON string containing a list of ticker symbols.
    def get_list_of_supported_stocks(self):
        cursor,conn=self.connect_to_db()

        query = """
            SELECT ticker_symbol
            FROM Stock
        """
        cursor.execute(query)
        stocks = [row[0] for row in cursor.fetchall()]  # Extract ticker symbols into a list
        self.close_db(cursor,conn)
        return jsonify(stocks)

# Stock Price (tested)
    # Adds a new stock price to the StockPrice table.
    # Returns None but inserts price information for a stock ticker.
    def add_stock_price(self, ticker_symbol, price):
        cursor,conn=self.connect_to_db()

        query = """
               INSERT INTO StockPrice (ticker_symbol, price)
               VALUES (%s, %s)
                       """
        cursor.execute(query, (ticker_symbol, price))
        conn.commit()
        self.close_db(cursor,conn)

    # Retrieves the most recent stock price for a ticker in JSON format.
    # Returns JSON string with price and time of last update.
    def get_most_recent_stock_price(self, ticker):
        cursor,conn=self.connect_to_db()

        query = """
            SELECT price, time_posted
            FROM StockPrice
            WHERE ticker_symbol = %s
            ORDER BY time_posted DESC
            LIMIT 1
        """
        cursor.execute(query, (ticker,))
        result = cursor.fetchone()
        self.close_db(cursor,conn)
        if result:
            price, time_posted = result
            response = {
                "price": float(price),
                "time_posted": time_posted.strftime("%Y-%m-%dT%H:%M:%SZ")
            }
            return response
        else:
            return None

# User Balance (tested)
    # Adds funds to the user's account balance and logs the deposit.
    # Returns None, but updates user's balance and records deposit in the database.
    def add_funds(self, user_id, amount):
        cursor,conn=self.connect_to_db()

        if amount <= 0:
            raise ValueError("Amount must be greater than zero.")

        insert_deposit_query = """
            INSERT INTO FundsDeposit (user_id, amount, time_initiated, cleared)
            VALUES (%s, %s, NOW(), TRUE)
        """
        cursor.execute(insert_deposit_query, (user_id, amount))

        update_balance_query = """
            UPDATE UserBalance
            SET balance_usd = balance_usd + %s
            WHERE user_id = %s
        """
        cursor.execute(update_balance_query, (amount, user_id))

        conn.commit()
        self.close_db(cursor,conn)

    # Withdraws funds from user's account if balance is sufficient.
    # Returns None, but updates user's balance and logs withdrawal in the database.
    def withdraw_funds(self, user_id, amount):
        cursor,conn=self.connect_to_db()

        if amount <= 0:
            raise ValueError("Amount must be greater than zero.")

        # user_balance = json.loads(self.get_user_balance(user_id))["net_balance"]
        # if user_balance < amount:
        #     raise ValueError("Insufficient balance to complete this withdrawal.")

        insert_withdraw_query = """
            INSERT INTO FundsWithdraw (user_id, amount, time_initiated, cleared)
            VALUES (%s, %s, NOW(), TRUE)
        """
        cursor.execute(insert_withdraw_query, (user_id, amount))

        update_balance_query = """
            UPDATE UserBalance
            SET balance_usd = balance_usd - %s
            WHERE user_id = %s
        """
        cursor.execute(update_balance_query, (amount, user_id))

        conn.commit()
        self.close_db(cursor,conn)

    # Retrieves user's balance, deposits, withdrawals, and market orders in JSON format.
    # Returns JSON string with total deposits, withdrawals, net market orders, and net balance.
    def get_user_balance(self, user_id):
        cursor,conn=self.connect_to_db()

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
        cursor.execute(deposit_query, (user_id,))
        total_deposit = cursor.fetchone()[0]
        cursor.execute(withdraw_query, (user_id,))
        total_withdraw = cursor.fetchone()[0]
        cursor.execute(market_order_query, (user_id,))
        net_market_orders = cursor.fetchone()[0]
        net_balance = total_deposit - total_withdraw + net_market_orders
        balance_data = {
            "total_deposit": float(total_deposit),
            "total_withdraw": float(total_withdraw),
            "net_market_orders": float(net_market_orders),
            "net_balance": float(net_balance)
        }
        self.close_db(cursor,conn)

        return jsonify(balance_data)

# User Manipulation (tested)
    # Adds a new user to the User table.
    # Returns None but inserts user data into the database.
    def add_user(self, user_id, first_name, last_name, email):
        cursor,conn=self.connect_to_db()

        # Insert into User table
        user_query = """
            INSERT INTO User (user_id, email)
            VALUES (%s, %s)
                """
        cursor.execute(user_query, (user_id, email))

        # Insert into UserDetails table
        user_details_query = """
            INSERT INTO UserData (email, first_name, last_name)
            VALUES (%s, %s, %s)
                """
        cursor.execute(user_details_query, (email, first_name, last_name))

        # Commit the transaction
        conn.commit()
        self.close_db(cursor,conn)

    # Retrieves user data by user_id in JSON format.
    # Returns JSON string with user's basic details or None if the user does not exist.
    def get_user_data(self, user_id):
        cursor,conn=self.connect_to_db()

        user_query = """
            SELECT email
            FROM User
            WHERE user_id = %s
        """
        cursor.execute(user_query, (user_id,))
        user_result = cursor.fetchone()

        if user_result:
            email = user_result[0]

            user_details_query = """
                SELECT first_name, last_name
                FROM UserData
                WHERE email = %s
            """
            cursor.execute(user_details_query, (email,))
            user_details_result = cursor.fetchone()

            if user_details_result:
                first_name, last_name = user_details_result
                response = {
                    "user_id": user_id,
                    "first_name": first_name,
                    "last_name": last_name,
                    "email": email
                }
                self.close_db(cursor,conn)
                return jsonify(response)

        self.close_db(cursor,conn)
        return jsonify(None)

    def admin_insertion(self, TableName, data):
        cursor,conn=self.connect_to_db()

        if not conn.is_connected():
                print("Reconnecting to the database...")
                conn.reconnect()
                cursor = conn.cursor()
        columns = ', '.join(data.keys())
        values = ', '.join(f"'{v}'" for v in data.values())
        query = f"INSERT INTO {TableName} ({columns}) VALUES ({values})"

        cursor.execute(query,data)
        conn.commit()
        self.close_db(cursor,conn)
        print(f"Inserted {data} into {TableName}")

    # admin table fetch
    def admin_table_fetch(self, TableName):
        cursor,conn=self.connect_to_db()

        if not conn.is_connected():
                print("Reconnecting to the database...")
                conn.reconnect()
                cursor = conn.cursor()
        query = f"""
                    SELECT *
                    FROM {TableName}
                """
        # Execute the query with the provided values
        cursor.execute(query)
        logs = cursor.fetchall()
        #Returns the log
        self.close_db(cursor,conn)
        return logs

    # admin fetch tables
    def admin_table_fetch_manip(self, TableName):
        if not conn.is_connected():
            print("Reconnecting to the database...")
            conn.reconnect()
            cursor = conn.cursor()

        query = f"SELECT * FROM {TableName}"

        # Execute the query
        cursor.execute(query)
        rows = cursor.fetchall()

        # Fetch column names
        column_names = [desc[0] for desc in cursor.description]

        # Convert rows to list of dictionaries
        data = [dict(zip(column_names, row)) for row in rows]
        self.close_db(cursor,conn)
        return data

    # admin table row deletion
    def admin_table_row_deletion(self, TableName, data_name, data_value):
        if not conn.is_connected():
                print("Reconnecting to the database...")
                conn.reconnect()
                cursor = conn.cursor()
        query = f"""
                    DELETE FROM {TableName}
                    WHERE {data_name} = {data_value}
                """
        # Execute the query with the provided values
        cursor.execute(query)
        conn.commit()
        print(f"Deleted {data_name} with value of {data_value} from the table {TableName}")
        # conn.close()
        response = f"Deleted {data_name} with value of {data_value} from the table {TableName}"
        self.close_db(cursor,conn)
        return response

    #function for acessing logs
    def admin_fetch_log(self):
        # Check if the connection or cursor is closed and reinitialize if needed
        if not conn.is_connected():
            print("Reconnecting to the database...")
            conn.reconnect()
            cursor = conn.cursor()

        # Execute the query
        cursor.execute("SELECT * FROM Log ORDER BY operation_time DESC")
        logs = cursor.fetchall()
        self.close_db(cursor,conn)

        # Return the logs directly as raw data
        return logs
        
## Functions for fetching
    # Check if today's entry exists for a specific ticker
    def check_today_entry_exists(self, ticker_symbol, date):
        cursor,conn=self.connect_to_db()
        query = "SELECT 1 FROM StockPrice WHERE ticker_symbol = %s AND DATE(time_posted) = %s"
        cursor.execute(query, (ticker_symbol, date))
        result = cursor.fetchone()
        self.close_db(cursor,conn)
        return result is not None

    # Insert or update stock price for a ticker and timestamp
    def insert_or_update_price(self, ticker_symbol, price, timestamp):
        cursor,conn=self.connect_to_db()
        query = """
            INSERT INTO StockPrice (ticker_symbol, price, time_posted)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE
                price = VALUES(price),
                time_posted = VALUES(time_posted)
        """
        cursor.execute(query, (ticker_symbol, price, timestamp))
        conn.commit()
        self.close_db(cursor,conn)
        print(f"Price for {ticker_symbol} updated in the database.")


    # Clear all data from a specified table
    def clear_table(self, table_name):
        cursor,conn=self.connect_to_db()
        query = f"TRUNCATE TABLE {table_name}"
        cursor.execute(query)
        conn.commit()
        self.close_db(cursor,conn)

    # Insert or replace stock data for a ticker and sector
    def insert_or_replace_stock(self, ticker_symbol, sector_name):
        cursor,conn=self.connect_to_db()
        sector_id = self.get_or_create_sector(sector_name)
        query = """
            REPLACE INTO Stock (ticker_symbol, sector_id)
            VALUES (%s, %s)
        """
        cursor.execute(query, (ticker_symbol, sector_id))
        conn.commit()
        self.close_db(cursor,conn)

    # Fetch or create a sector ID for a sector name
    def get_or_create_sector(self, sector_name):
        # Check if the sector already exists
        cursor,conn=self.connect_to_db()
        cursor.execute("SELECT sector_id FROM Sector WHERE sector_name = %s", (sector_name,))
        result = cursor.fetchone()
        if result:
            return result[0]  # Return the existing sector_id

        # Create a new sector if it does not exist
        cursor.execute("SELECT COALESCE(MAX(sector_id), 0) + 1 FROM Sector")
        new_sector_id = cursor.fetchone()[0]
        cursor.execute(
            "INSERT INTO Sector (sector_id, sector_name) VALUES (%s, %s)",
            (new_sector_id, sector_name)
        )
        conn.commit()
        self.close_db(cursor,conn)
        return new_sector_id  # Return the new sector_id

    # Fetch all ticker symbols from the Stock table
    def fetch_sp500_tickers(self):
        cursor,conn=self.connect_to_db()
        query = "SELECT ticker_symbol FROM Stock"
        cursor.execute(query)
        result = cursor.fetchall()
        self.close_db(cursor,conn)
        return list(result)
    
    # Retrieve all stock price data for every ticker and save it in separate JSON files
    def get_historical_data(self):
        cursor,conn=self.connect_to_db()

        # Fetch all unique ticker symbols
        tickers_query = "SELECT DISTINCT ticker_symbol FROM StockPrice"
        cursor.execute(tickers_query)
        tickers = [row[0] for row in cursor.fetchall()]

        for ticker_symbol in tickers:
            query = """
                SELECT ticker_symbol, price, time_posted
                FROM StockPrice
                WHERE ticker_symbol = %s
                ORDER BY time_posted ASC
            """
            cursor.execute(query, (ticker_symbol,))
            rows = cursor.fetchall()

            # Prepare data for JSON output
            data = [
                {
                    "ticker_symbol": row[0],
                    "price": float(row[1]),
                    "time_posted": row[2].strftime('%Y-%m-%d')
                }
                for row in rows
            ]

            # Define the file path relative to the current working directory
            file_path = os.path.join(
                os.getcwd(),
                "frontend",
                "src",
                "user_component",
                "historical_data",
                f"{ticker_symbol}_historical_data.json"
            )

            # Save data to a JSON file
            os.makedirs(os.path.dirname(file_path), exist_ok=True)  # Ensure directory exists
            with open(file_path, "w") as json_file:
                json.dump(data, json_file, indent=4)
        self.close_db(cursor,conn)

    # Generate a JSON file containing stock symbol, name, sector, and latest price.
    def get_stock_details(self):
        cursor,conn=self.connect_to_db()
        # SQL query to get symbol, sector, and latest price
        query = """
            SELECT s.ticker_symbol, sec.sector_name, sp.price
            FROM Stock s
            JOIN Sector sec ON s.sector_id = sec.sector_id
            JOIN (
                SELECT ticker_symbol, MAX(time_posted) AS latest_time
                FROM StockPrice
                GROUP BY ticker_symbol
            ) latest_price ON s.ticker_symbol = latest_price.ticker_symbol
            JOIN StockPrice sp ON s.ticker_symbol = sp.ticker_symbol AND sp.time_posted = latest_price.latest_time
        """
        cursor.execute(query)
        rows = cursor.fetchall()

        # Fetch S&P 500 company names from Wikipedia
        url = "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies"
        response = requests.get(url)
        sp500_df = pd.read_html(StringIO(response.text))[0]
        company_names = dict(zip(sp500_df['Symbol'], sp500_df['Security']))

        # Prepare data for JSON output
        data = []
        for row in rows:
            ticker_symbol, sector_name, price = row
            data.append({
                "Symbol": ticker_symbol,
                "Name": company_names.get(ticker_symbol, "Unknown"),
                "Sector": sector_name,
                "Price": str(price)
            })

        # Define file path relative to the current working directory
        file_path = os.path.join(
            os.getcwd(),
            "frontend",
            "src",
            "user_component",
            "stock_details.json"  # Single JSON file for all stocks
        )

        # Save data to JSON file
        with open(file_path, "w") as json_file:
            json.dump(data, json_file, indent=4)
        print(f"JSON saved to {file_path}")
        self.close_db(cursor,conn)
