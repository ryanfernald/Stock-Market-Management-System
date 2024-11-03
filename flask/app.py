from flask import Flask, request, jsonify
from flask_cors import CORS

# import the example "blueprint" from the router folder to include the route in the main application
from router.example_router import example




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


app.register_blueprint(example, url_prefix='/api') 

if __name__ == '__main__':
    app.run(debug=True)