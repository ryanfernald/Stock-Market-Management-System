#from dotenv import load_dotenv
import sys
import os
import requests
import pandas as pd
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from config.config import config
from src.classes.DataFetcher import DataFetcher
import time
# Load environment variables from .env file
#load_dotenv
AUTH = os.getenv('RAPIDAPI_AUTHORIZATION')
TYPE = os.getenv('Content-Type')
fetcher = DataFetcher(config)
def addRequest():
    url ='https://api.polygon.io/v2/aggs/ticker/AAPL/range/1/day/2023-01-09/2023-01-09?apiKey=uCLlY61Ll3RgbgV0CwXuxUXA4TkJPjfP'
    header = {
        "Authorization": AUTH,
        "Content-Type": TYPE
    }
    response = requests.get(url, headers=header)
    if response.status_code == 200:
        # Convert the response to JSON
        data = response.json()

        # Extract the relevant data for pandas DataFrame (assumed 'results' contains the desired data)
        if 'results' in data:
            df = pd.DataFrame(data['results'])
            df.to_csv('currentPrice.csv', index=False)
        else:
            print("No 'results' key in the response data.")
    else:
        print(f"Request failed with status code {response.status_code}")
fetcher.start()

# fetcher executes async while script runs
try:
    while True:
        addRequest()
        time.sleep(10)

except KeyboardInterrupt():
    print("Stopped script")
finally:
    fetcher.stop()
