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
    sNp = pd.read_csv('SP500.csv')
    symList = sNp.Symbol.to_list()
    for comp in symList:
        get_current_stats(comp)
        print('Fetched'+comp+'current price!')
        time.sleep(2) # to metigate API request limitation
def get_current_stats(symbol):    
    file_path = './currentHrPrice/' + symbol + 'currentPrice.csv'
    
    # Current price API URL
    url = 'https://api.polygon.io/v2/aggs/ticker/' + symbol + '/range/1/day/2023-01-09/2023-01-09?apiKey=uCLlY61Ll3RgbgV0CwXuxUXA4TkJPjfP'
    header = {
        "Authorization": AUTH,
        "Content-Type": TYPE
    }
    
    # Send the request
    response = requests.get(url, headers=header)
    
    # Check if the response was successful
    if response.status_code == 200:
        # Convert the response to JSON
        data = response.json()
        
        # Check if 'results' exist in the response
        if 'results' in data:
            # Create a DataFrame from the results
            df = pd.DataFrame(data['results'])
            
            # Check if the CSV file already exists
            if os.path.exists(file_path):
                # Append the data if the file exists
                df.to_csv(file_path, mode='a', header=False, index=False)
                print(f"Appended data to {file_path}")
            else:
                # Write the data to a new CSV file if it doesn't exist
                df.to_csv(file_path, mode='w', index=False)
                print(f"Created new file and wrote data to {file_path}")
        else:
            print("No 'results' key in the response data.")
    else:
        print(f"Request failed with status code {response.status_code}")
fetcher.start()

# fetcher executes async while script runs
try:
    while True:
        addRequest()
        hr = 3600
        time.sleep(hr) #updates every hour

except KeyboardInterrupt():
    print("Stopped script")
finally:
    fetcher.stop()
