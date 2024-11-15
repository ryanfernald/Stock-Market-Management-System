from flask import Blueprint, request, jsonify
from db_config import db  

user_manipulation = Blueprint('user_insertion', __name__)

@user_manipulation.route('/insertUser', methods=['POST', 'OPTIONS'])
def execute():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = jsonify({"message": "CORS preflight successful"})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        return response, 200

    # Handle POST request
    data = request.get_json()
    db.add_user(data['user_id'], data['first_name'], data['last_name'], data['email'])
    response = jsonify({"message": "User added successfully"})
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
    return response, 200



@user_manipulation.route('/<user_id>', methods=['GET'])
def get_user_data(user_id):
    return db.get_user_data(user_id)