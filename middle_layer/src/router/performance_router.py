from dotenv import load_dotenv
from flask import Blueprint, jsonify
from db_config import db
import os
from mysql.connector import Error
# load environment variables from .env file
load_dotenv()

perfomance_bp = Blueprint('performance', __name__)

@perfomance_bp.route('/api/performance', methods=['GET'])
def get_performance_metrics():
    try:
        # Connect to MySQL
        if not db.connection.is_connected():
                print("Reconnecting to the database...")
                db.connection.reconnect()
                db.cursor = db.connection.cursor()
        #cursor = db.get_courser()  # Get a new cursor with dictionary format
        
        # Query for table size
        query = """
            SELECT 
                table_name AS 'Table',
                ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size_MB'
            FROM 
                information_schema.TABLES 
            WHERE 
                table_schema = %s
            ORDER BY 
                (data_length + index_length) DESC
            LIMIT 10;
        """
        db.cursor.execute(query,(os.getenv('DATABASE_NAME'),))
        results = db.cursor.fetchall()
        
        return jsonify(results)
    except Error as e:
        return jsonify({"error": str(e)}), 500
    
    
