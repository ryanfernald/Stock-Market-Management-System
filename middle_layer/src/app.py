from flask import Flask, jsonify
from flask_cors import CORS
from db_config import db
from router.portfolio_router import portfolio
from router.stock_manipulation_router import stock_manipulation
from router.stock_price_router import stock_price
from router.transaction_history_router import transaction_history
from router.user_balance_router import user_balance
from router.user_manipulation_router import user_manipulation
from router.logs_route import logs_bp
from router.performance_router import perfomance_bp

# import the example "blueprint" from the router folder to include the route in the main application
from router.example_router import example
from router.admin_connections_router import admin_connection_bp
# import the example "blueprint" from the router folder to include the route in the main application
from router.example_router import example
from router.admin_connections_router import admin_connection_bp
from router.AdminFetch_route import admin_fetch_bp
from classes.DataBase import DataBase
import os


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Register your blueprints here
app.register_blueprint(portfolio, url_prefix='/portfolio') 
app.register_blueprint(stock_manipulation, url_prefix='/stock_m') 
app.register_blueprint(stock_price, url_prefix='/stock_p') 
app.register_blueprint(transaction_history, url_prefix='/transaction_h') 
app.register_blueprint(user_balance, url_prefix='/user_b') 
app.register_blueprint(user_manipulation, url_prefix='/user_m') 
app.register_blueprint(admin_connection_bp, url_prefix='/Admin')
app.register_blueprint(perfomance_bp)
app.register_blueprint(logs_bp)
app.register_blueprint(admin_fetch_bp)

if __name__ == '__main__':
    app.run(debug=True)
