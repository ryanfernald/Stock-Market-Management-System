from flask import Blueprint, request, jsonify
from db_config import db 

admin_connection_bp = Blueprint('admin_router', __name__)

@admin_connection_bp.route('/insertion', methods=['POST'])
def exetcute():
    try:
        data = request.get_json()
        table_name = data["tableName"]
        insert_data = data["data"]

        if not table_name or not insert_data:
            return jsonify({"error": "Table name or data is missing"}), 400

        # Call your database insertion function (you may need to implement this)
        result = db.admin_insertion(table_name, insert_data)

        return jsonify({"message": f"Data inserted into {table_name} successfully", "result": result}), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Failed to insert data"}), 500