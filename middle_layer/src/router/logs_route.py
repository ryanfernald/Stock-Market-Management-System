from flask import Blueprint, jsonify, request
from db_config import db

logs_bp = Blueprint('logs_bp', __name__)

@logs_bp.route('/admin_fetch_log', methods=['GET'])
def fetch_logs():
    page = request.args.get('page', default=1, type=int)
    limit = request.args.get('limit', default=50, type=int)
    try:
        logs = db.admin_fetch_log()
        # Apply pagination
        start_index = (page - 1) * limit
        end_index = start_index + limit
        paginated_logs = logs[start_index:end_index]
        return jsonify(paginated_logs), 200
    except Exception as e:
        print(f"Error in admin_fetch_log: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()
