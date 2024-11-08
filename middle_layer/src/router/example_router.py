from flask import Blueprint

# Create a Blueprint named "example"
example = Blueprint('example', __name__)

@example.route('/example', methods=['GET'])
def example_route():
    
    return {"message": "Hello from example route!"}, 200 # set the response code to OK   

@example.route('/example/<int:id>', methods=['GET'])
def example_route2(id):
    return {"message": f"The id is: {id}"}, 201 # set the response code to CREATED

