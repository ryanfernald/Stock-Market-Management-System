# stock_manipulation_router.py
from flask import Blueprint, request, jsonify
from db_config import db

stock_manipulation = Blueprint('stock_manipulation', __name__)

@stock_manipulation.route('/buy/<user_id>/<ticker>/<quantity>', methods=['POST'])
def buy_stock(user_id, ticker, quantity):
    try:
        db.buy_stock(user_id, ticker, int(quantity))
        return jsonify({"status": "success", "message": "Stock purchased successfully"}), 200
    except ValueError as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@stock_manipulation.route('/sell/<user_id>/<ticker>/<quantity>', methods=['POST'])
def sell_stock(user_id, ticker, quantity):
    try:
        db.sell_stock(user_id, ticker, int(quantity))
        return jsonify({"status": "success", "message": "Stock sold successfully"}), 200
    except ValueError as e:
        return jsonify({"status": "error", "message": str(e)}), 400
    
@stock_manipulation.route('/list', methods=['GET'])
def get_list_of_supported_stocks():
    return db.get_list_of_supported_stocks(), 200