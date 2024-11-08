from flask import Flask, jsonify
from flask_cors import CORS


from db import DB
from router.portfolio_router import portfolio
from router.stock_manipulation_router import stock_manipulation
from router.stock_price_router import stock_price
from router.transaction_history_router import transaction_history
from router.user_balance_router import user_balance
from router.user_manipulation_router import user_manipulation


app = Flask(__name__)
# allow universal requests
CORS(app)





@app.route('/test_db_connection', methods=['GET'])
def test_db_connection():
    try:
        # Connect to the database
        connection = db.connection
        cursor = connection.cursor()

        # Query to fetch all table names
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables
            WHERE table_schema = 'public'
        """)

        # Fetch all table names
        tables = cursor.fetchall()
        table_names = [table[0] for table in tables]

        # Close cursor
        cursor.close()

        # Return the table names as a JSON response
        return jsonify({
            "status": "success",
            "tables": table_names
        }), 200
    except Exception as e:
        # Handle any errors
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500




app.register_blueprint(portfolio, url_prefix='/portfolio') 
app.register_blueprint(stock_manipulation, url_prefix='/stock_m') 
app.register_blueprint(stock_price, url_prefix='/stock_p') 
app.register_blueprint(transaction_history, url_prefix='/transaction_h') 
app.register_blueprint(user_balance, url_prefix='/user_b') 
app.register_blueprint(user_manipulation, url_prefix='/user_m') 


if __name__ == '__main__':
    app.run(debug=True)