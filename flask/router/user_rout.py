# user_rout.py
from flask import Blueprint, request, jsonify
from database import get_db  # Importing get_db from database.py
from sqlalchemy.orm import Session
from .Model.user import User

user_bp = Blueprint('user', __name__)

@user_bp.route('/api/insertUser', methods=['POST'])
def insert_user():

    # # sample usage
    # db = DataBase(
    #     host='localhost',
    #     user='root',
    #     password='data_warehouse',
    #     database='stonks_market'
    # )
    # db.add_user("user_id", "first_name", "last_name", "email")
    # db.close()

    data = request.json
    db: Session = next(get_db())  # Create a session

    try:
        new_user = User(
            user_id=data['user_id'],
            email=data['email'],
            first_name=data['first_name'],
            last_name=data['last_name']
        )
        db.add(new_user)
        db.commit()
        return jsonify({"message": "User added successfully"}), 201
    except Exception as e:
        db.rollback()
        return jsonify({"detail": str(e)}), 500
    finally:
        db.close()
