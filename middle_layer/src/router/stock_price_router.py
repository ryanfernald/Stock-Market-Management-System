# stock_price_router.py
from flask import Blueprint, request, jsonify
from db_config import db

stock_price = Blueprint('stock_price', __name__)

@stock_price.route('/add_price/<ticker>/<price>', methods=['POST'])
def add_stock_price(ticker, price):
    db.add_stock_price(ticker, float(price))
    return jsonify({"status": "success", "message": "Stock price added successfully"}), 201

@stock_price.route('/recent_price/<ticker>', methods=['GET'])
def get_most_recent_stock_price(ticker):
    return db.get_most_recent_stock_price(ticker)
