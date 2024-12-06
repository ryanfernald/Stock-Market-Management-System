from db_config import db
from quick_fetch import qf

qf() # comment this function call out if you just want to run the functions to update jsons fast
db.get_historical_data()
db.get_stock_details()
print("JSONs have all been updated")