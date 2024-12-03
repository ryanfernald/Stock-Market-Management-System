from flask import Blueprint, jsonify, request
from db_config import db  # Assuming `db` is an instance of the `DataBase` class

admin_fetch_bp = Blueprint('admin_fetch', __name__)

# Fetch table data
@admin_fetch_bp.route('/fetch_table', methods=['GET'])
def fetch_table():
    table_name = request.args.get('tableName')
    if not table_name:
        return jsonify({'error': 'Table name is required'}), 400

    try:
        # Fetch data from the database
        data = db.admin_table_fetch_manip(table_name)
        if not data:
            return jsonify({'error': f'No data found for table {table_name}'}), 404

        return jsonify(data), 200
    except Exception as e:
        return jsonify({'error': f'Error fetching data from {table_name}: {str(e)}'}), 500
# Delete a row
@admin_fetch_bp.route('/delete_row', methods=['POST'])
def delete_row():
    request_data = request.get_json()
    table_name = request_data.get('tableName')
    row_data = request_data.get('row')

    if not table_name or not row_data:
        return jsonify({'error': 'Table name and row data are required'}), 400

    try:
        primary_key_column = list(row_data.keys())[0]
        primary_key_value = row_data[primary_key_column]
        result = db.admin_table_row_deletion(table_name, primary_key_column, primary_key_value)

        if result:
            return jsonify({'message': f'Row deleted from {table_name}'}), 200
        else:
            return jsonify({'error': 'Row deletion failed'}), 500
    except Exception as e:
        return jsonify({'error': f'Error deleting row from {table_name}: {str(e)}'}), 500
