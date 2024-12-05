# transaction_history_router.py
from flask import Blueprint, request
from flask_cors import cross_origin

from db_config import db

transaction_history = Blueprint('transaction_history', __name__)

@transaction_history.route('/<user_id>', methods=['GET'])
@cross_origin()
def get_user_transaction_history(user_id):
    return db.get_user_transaction_history(user_id)
