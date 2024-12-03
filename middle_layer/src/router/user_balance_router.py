# user_balance_router.py
from flask import Blueprint, request, jsonify
from db_config import db

user_balance = Blueprint('user_balance', __name__)

@user_balance.route('/add_funds/<user_id>/<amount>', methods=['POST'])
def add_funds(user_id, amount):
    try:
        db.add_funds(user_id, float(amount))
        return jsonify({"status": "success", "message": "Funds added successfully"}), 200
    except ValueError as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@user_balance.route('/withdraw_funds/<user_id>/<amount>', methods=['POST'])
def withdraw_funds(user_id, amount):
    try:
        db.withdraw_funds(user_id, float(amount))
        return jsonify({"status": "success", "message": "Funds withdrawn successfully"}), 200
    except ValueError as e:
        return jsonify({"status": "error", "message": str(e)}), 400
@user_balance.route('/balance/<user_id>', methods=['GET'])
def get_user_balance(user_id):
    result = db.get_user_balance(user_id)

    return result
