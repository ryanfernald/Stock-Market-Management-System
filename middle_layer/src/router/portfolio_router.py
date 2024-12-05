# portfolio_router.py
from flask import Blueprint, request, jsonify
from db_config import db

portfolio = Blueprint('portfolio', __name__)

@portfolio.route('/<user_id>', methods=['GET'])
def get_user_portfolio(user_id):
    return db.get_user_portfolio(user_id)

@portfolio.route('/value/<user_id>', methods=['GET'])
def get_user_portfolio_value(user_id):
    print("portfolio get value called for user " + user_id)
    return db.get_user_portfolio_value(user_id)
