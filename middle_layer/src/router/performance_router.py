from dotenv import load_dotenv
from flask import Blueprint, jsonify
from db_config import db
import os

# load environment variables from .env file
load_dotenv()

perfomance_bp = Blueprint('performance', __name__)

@perfomance_bp.route('/api/performance', methods=['GET'])
def get_performance_metrics():
    data = db.Admin_performance()
    print(data)
    return data
    
    
