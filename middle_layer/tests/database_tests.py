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

# test_balance_add('user1', 1000)


# works
def test_balance_withdraw(user_id, amount):
    try:
        print(f"balance before: ${db.get_user_balance(user_id)}")
        db.withdraw_funds(user_id, amount)
        print(f"balance after: ${db.get_user_balance(user_id)}")
    except Exception as e:
        print(e)

# test_balance_withdraw('user1', 10000)


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

# test_buying_stock('user1', "AAPL", 1)


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


# test_selling_stock('user1', "AAPL", 1)


# works
def test_transaction_history(user_id):
    print("Transaction History for", user_id)
    transactions = db.get_user_transaction_history(user_id)
    for transaction in transactions:
        print(transaction)

# test_transaction_history('user1')


# works
def test_get_portfolio(user_id):
    print(f"portfolio:\n{db.get_user_portfolio(user_id)}")

# test_get_portfolio('user1')


# works
def test_get_portfolio_value(user_id):
    print(f"portfolio value: ${db.get_user_portfolio_value(user_id)}")

# test_get_portfolio_value('user1')


# works
def test_get_balance(user_id):
    print(f"balance : ${db.get_user_balance(user_id)}")

test_get_balance('user1')
