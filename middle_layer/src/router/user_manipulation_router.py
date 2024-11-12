from flask import Blueprint, request, jsonify
from db_config import db  

user_manipulation = Blueprint('user_insertion', __name__)

@user_manipulation.route('/insertUser', methods=['POST', 'OPTIONS'])
def execute():
    # Handle the OPTIONS request for CORS preflight
    if request.method == 'OPTIONS':
        return '', 200  # Respond OK to preflight

    # Handle POST request
    data = request.get_json()
    db.add_user(data['user_id'], data['email'], data['first_name'], data['last_name'])
    return jsonify({"message": "User added successfully"}), 200


@user_manipulation.route('/<user_id>', methods=['GET'])
def get_user_data(user_id):
    return db.get_user_data(user_id)