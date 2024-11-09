from dotenv import load_dotenv
import os
import yfinance as yf
import pandas as pd
import requests
import io
import mysql.connector
from mysql.connector import Error
from tqdm import tqdm  # For progress tracking
from db_config import db

# load environment variables from .env file
load_dotenv()

# access the API key and DB connection variables from environment variables
FINNHUB_API_KEY = os.getenv('FINNHUB_API_KEY')

# connect to MySQL database
try:
    connection = db  
    cursor = db.get_courser()  
    print("Successfully connected to the database")
except Error as e:
    print(f"Error connecting to the database: {e}")

# function to check and insert sector if it doesn't exist
def get_or_create_sector(sector_name):
    cursor.execute("SELECT sector_id FROM Sector WHERE sector_name = %s", (sector_name,))
    result = cursor.fetchone()
    if result:
        return result[0]  # sector_id exists
    else:
        # get the current maximum sector_id and add 1 for the new entry
        cursor.execute("SELECT COALESCE(MAX(sector_id), 0) + 1 FROM Sector")
        new_sector_id = cursor.fetchone()[0]
        cursor.execute("INSERT INTO Sector (sector_id, sector_name) VALUES (%s, %s)", (new_sector_id, sector_name))
        db.connection.commit()  # Use db.connection.commit()
        return new_sector_id  # return new sector_id

# function to insert or replace stock data (symbol and sector)
def insert_or_replace_stock(ticker_symbol, sector_id):
    cursor.execute(
        "REPLACE INTO Stock (ticker_symbol, sector_id) VALUES (%s, %s)", 
        (ticker_symbol, sector_id)
    )
    db.connection.commit()  

# function to insert or update stock price
def insert_or_update_stock_price(ticker_symbol, price):
    cursor.execute(
        "INSERT INTO StockPrice (ticker_symbol, price) VALUES (%s, %s) "
        "ON DUPLICATE KEY UPDATE price = VALUES(price), time_posted = CURRENT_TIMESTAMP",
        (ticker_symbol, float(price))
    )
    db.connection.commit()  

# fetch S&P 500 company list from Wikipedia
url = 'https://en.wikipedia.org/wiki/List_of_S%26P_500_companies'
response = requests.get(url)
html_content = io.StringIO(response.text)
sp500_df = pd.read_html(html_content)[0]

# extract relevant columns and format tickers
sp500_tickers = sp500_df[['Symbol', 'GICS Sector']].copy()
sp500_tickers['Symbol'] = sp500_tickers['Symbol'].apply(lambda x: x.replace('.', '-'))

# function to fetch stock data from Yahoo Finance with Finnhub as a backup
def fetch_stock_data(ticker):
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period="1d")
        if not hist.empty:
            return round(hist['Close'].iloc[0], 2)
    except Exception as e:
        print(f"Yahoo Finance error for {ticker}: {e}")

    # fallback to Finnhub if Yahoo Finance fails
    try:
        url = f'https://finnhub.io/api/v1/quote?symbol={ticker}&token={FINNHUB_API_KEY}'
        response = requests.get(url)
        data = response.json()
        return round(data["c"], 2) if "c" in data else None
    except Exception as e:
        print(f"Finnhub error for {ticker}: {e}")
    return None

# Insert each stock's sector, symbol, and latest price into the database, with progress tracking
for _, row in tqdm(sp500_tickers.iterrows(), total=len(sp500_tickers), desc="Processing S&P 500 stocks"):
    ticker_symbol = row['Symbol']
    sector_name = row['GICS Sector']
    
    sector_id = get_or_create_sector(sector_name)
    insert_or_replace_stock(ticker_symbol, sector_id)
    
    price = fetch_stock_data(ticker_symbol)
    if price is not None:
        insert_or_update_stock_price(ticker_symbol, price)

# close the database connection
if connection.connection.is_connected():
    cursor.close()
    db.close()  
    print("Database connection closed")
