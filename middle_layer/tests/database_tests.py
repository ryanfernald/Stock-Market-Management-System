from classes.DataBase import DataBase

db = DataBase(
    host='localhost',
    user='root',
    password='data_warehouse',
    database='stonks_market'
)


# works
def test_balance_add(user_id, amount):
    try:
        print(f"balance before: ${db.get_user_balance(user_id)}")
        db.add_funds(user_id, amount)
        print(f"balance after: ${db.get_user_balance(user_id)}")
    except Exception as e:
        print(e)

# test_point
# test_balance_add('user1', 1000)


# works
def test_balance_withdraw(user_id, amount):
    try:
        print(f"balance before: ${db.get_user_balance(user_id)}")
        db.withdraw_funds(user_id, amount)
        print(f"balance after: ${db.get_user_balance(user_id)}")
    except Exception as e:
        print(e)

# test_point
# test_balance_withdraw('user1', 1000)


# works
def test_buying_stock(user_id, ticker, quantity):
    try:
        print(f"balance before: ${db.get_user_balance(user_id)}")
        print(f"portfolio value before: ${db.get_user_portfolio_value(user_id)}")
        print(f"portfolio before:\n{db.get_user_portfolio(user_id)}")
        db.buy_stock(user_id, ticker, quantity)
        print(f"balance after: ${db.get_user_balance(user_id)}")
        print(f"portfolio value after: ${db.get_user_portfolio_value(user_id)}")
        print(f"portfolio after:\n{db.get_user_portfolio(user_id)}")
    except Exception as e:
        print(e)

# test_point
test_buying_stock('user1', "AAPL", 10)

# works
def test_selling_stock(user_id, ticker, quantity):
    try:
        print(f"balance before: ${db.get_user_balance(user_id)}")
        print(f"portfolio value before: ${db.get_user_portfolio_value(user_id)}")
        print(f"portfolio before:\n{db.get_user_portfolio(user_id)}")
        db.sell_stock(user_id, ticker, quantity)
        print(f"balance after: ${db.get_user_balance(user_id)}")
        print(f"portfolio value after: ${db.get_user_portfolio_value(user_id)}")
        print(f"portfolio after:\n{db.get_user_portfolio(user_id)}")
    except Exception as e:
        print(e)

# test_point
# test_selling_stock('user1', "BAC", 10)


# works
def test_transaction_history(user_id):
    print("Transaction History for", user_id)
    print(db.get_user_transaction_history(user_id))

# test_point
# test_transaction_history('user1')


# works
def test_get_portfolio(user_id):
    print(f"portfolio:\n{db.get_user_portfolio(user_id)}")

# test_point
# test_get_portfolio('user1')


# works
def test_get_portfolio_value(user_id):
    print(f"portfolio value: ${db.get_user_portfolio_value(user_id)}")

# test_point
# test_get_portfolio_value('user1')


# works
def test_get_balance(user_id):
    print(f"balance : ${db.get_user_balance(user_id)}")

# test_point
# test_get_balance('user1')

# works
def test_insert_stock_price(ticker, price):
    print(f"before ${db.get_most_recent_stock_price(ticker)}")
    db.add_stock_price(ticker, price)
    print(f"after ${db.get_most_recent_stock_price(ticker)}")

# test_point
# test_insert_stock_price("BAC", 80)


# testing
def test_insert_user(user_id, first_name, last_name, email):
    print(f"before {db.get_user_data(user_id)}")
    db.add_user(user_id, first_name, last_name, email)
    print(f"after {db.get_user_data(user_id)}")

# test_insert_user('user4', 'maxim', 'dokukin', 'mda@sjsu')

