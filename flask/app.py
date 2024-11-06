from flask import Flask, request, jsonify
from flask_cors import CORS
from database import get_db
from sqlalchemy.sql import text
from router.user_rout import user_bp
# import the example "blueprint" from the router folder to include the route in the main application
from router.example_router import example

from middle_layer.src.classes.DataBase import DataBase



app = Flask(__name__) # app initialization
CORS(app)             # allow requests from anywhere


#########################
##### START OF DEMO #####
#########################

@app.route('/hello', methods=['GET', 'POST'])
def hello_world():
    
    if request.method == 'POST':
        return {'message': 'HELLO FROM POST'}
    
    return {'message': 'HELLO FROM GET'}, 200 # set the response code to OK   


@app.route('/test', methods=['POST'])
def test(): 
    data = request.get_json()  # extracts JSON data from the request body data is a dictionary object 
    name = data.get('name')    # access name field from the JSON data
    return {'data': name}, 200 

#######################
##### END OF DEMO #####
#######################
# Register user Blueprint
app.register_blueprint(user_bp)
@app.route('/')
def testdb():
    # sample usage
    # db = DataBase(
    #     host='localhost',
    #     user='root',
    #     password='data_warehouse',
    #     database='stonks_market'
    # )
    # db.add_user("user_id", "first_name", "last_name", "email")
    # db.close()

    try:
        # Use the `next` function to get a session from the `get_db` generator
        with next(get_db()) as db:
            # Execute a query to fetch all table names in the current database
            result = db.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")).fetchall()
            # Extract table names from the result
            tables = [row[0] for row in result]
            return jsonify({"status": "success", "tables": tables}), 200 # return all the tables in the db
    except Exception as e:
        # If there is an error, return it as a response
        return jsonify({"status": "error", "error": str(e)}), 500


app.register_blueprint(example, url_prefix='/api') 

if __name__ == '__main__':
    app.run(debug=True)