import mysql.connector

class DataBase:
    def __init__(self, host, user, password, database):
        self.connection = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=database
        )
        self.cursor = self.connection.cursor()

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
                "price_purchased": row[4],
                "purchase_date": row[5]
            }
            for row in transactions
        ]
        return transaction_history

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
                portfolio[ticker_symbol] = {"quantity": 0, "total_value": 0}

            if order_type == 'BUY':
                portfolio[ticker_symbol]["quantity"] += quantity
                portfolio[ticker_symbol]["total_value"] += price_purchased * quantity
            elif order_type == 'SELL':
                portfolio[ticker_symbol]["quantity"] -= quantity
                portfolio[ticker_symbol]["total_value"] -= price_purchased * quantity

        assets = sorted(
            [
                {
                    "ticker_symbol": ticker,
                    "quantity": data["quantity"],
                    "total_value": float(data["total_value"])
                }
                for ticker, data in portfolio.items() if data["quantity"] > 0
            ],
            key=lambda x: x["ticker_symbol"]
        )
        return assets

    def get_user_portfolio_value(self, user_id):
        assets = self.get_user_portfolio(user_id)
        total_portfolio_value = sum(asset["total_value"] for asset in assets)
        return total_portfolio_value

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

        return net_balance

    # works
    def buy_stock(self, user_id, ticker, quantity):
        user_balance = self.get_user_balance(user_id)
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

    def sell_stock(self, user_id, ticker, quantity):
        portfolio = self.get_user_portfolio(user_id)
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

    # tested
    def add_funds(self, user_id, amount):
        if amount <= 0:
            raise ValueError("Amount must be greater than zero.")

        # Insert a new entry into the FundsDeposit table
        insert_deposit_query = """
            INSERT INTO FundsDeposit (user_id, amount, time_initiated, cleared)
            VALUES (%s, %s, NOW(), TRUE)
        """
        self.cursor.execute(insert_deposit_query, (user_id, amount))

        # Update the UserBalance table to add the amount
        update_balance_query = """
            UPDATE UserBalance
            SET balance_usd = balance_usd + %s
            WHERE user_id = %s
        """
        self.cursor.execute(update_balance_query, (amount, user_id))

        # Commit the transaction to save changes
        self.connection.commit()

    # tested
    def withdraw_funds(self, user_id, amount):
        if amount <= 0:
            raise ValueError("Amount must be greater than zero.")

        # Check if the user has enough balance to withdraw
        user_balance = self.get_user_balance(user_id)
        if user_balance < amount:
            raise ValueError("Insufficient balance to complete this withdrawal.")

        # Insert a new entry into the FundsWithdraw table
        insert_withdraw_query = """
            INSERT INTO FundsWithdraw (user_id, amount, time_initiated, cleared)
            VALUES (%s, %s, NOW(), TRUE)
        """
        self.cursor.execute(insert_withdraw_query, (user_id, amount))

        # Update the UserBalance table to subtract the amount
        update_balance_query = """
            UPDATE UserBalance
            SET balance_usd = balance_usd - %s
            WHERE user_id = %s
        """
        self.cursor.execute(update_balance_query, (amount, user_id))

        # Commit the transaction to save changes
        self.connection.commit()


