## This script is only for "quickly" fetching and inserting/replacing the latest stock price data for the current day
## If you want to fill in past data as well, run main_fetch

from dotenv import load_dotenv
import os
import yfinance as yf
import requests
from datetime import datetime
import pytz
from tqdm import tqdm
from db_config import db

# load environment variables
load_dotenv()
FINNHUB_API_KEY = os.getenv('FINNHUB_API_KEY')
if not FINNHUB_API_KEY: raise ValueError("API key for Finnhub not found.")
cursor = db.get_courser()

# define Pacific Time Zone
pacific = pytz.timezone("America/Los_Angeles")

# function to check if today's entry exists in the table (based on date only, ignoring time)
def today_entry_exists(ticker_symbol):
    today = datetime.now(pacific).date()
    cursor.execute(
        "SELECT 1 FROM StockPrice WHERE ticker_symbol = %s AND DATE(time_posted) = %s",
        (ticker_symbol, today)
    )
    return cursor.fetchone() is not None

# function to insert or update today's price
def insert_or_update_today_price(ticker_symbol, price):
    current_timestamp = datetime.now(pacific)
    if today_entry_exists(ticker_symbol):
        # update the existing entry for today
        cursor.execute(
            "UPDATE StockPrice SET price = %s, time_posted = %s WHERE ticker_symbol = %s AND DATE(time_posted) = %s",
            (float(price), current_timestamp, ticker_symbol, current_timestamp.date())
        )
    else:
        # insert a new entry for today
        cursor.execute(
            "INSERT INTO StockPrice (ticker_symbol, price, time_posted) VALUES (%s, %s, %s)",
            (ticker_symbol, float(price), current_timestamp)
        )
    db.connection.commit()

# fetch and insert or update the current price with Yahoo Finance, fallback to Finnhub
def fetch_and_insert_or_update_current_price(ticker_symbol):
    try:
        stock = yf.Ticker(ticker_symbol)
        current_data = stock.history(period="1d")
        if not current_data.empty:
            current_price = round(current_data['Close'].iloc[0], 2)
            insert_or_update_today_price(ticker_symbol, current_price)
        else:
            raise Exception("No data from Yahoo Finance")

    except Exception as e:
        print(f"Yahoo Finance error for {ticker_symbol}: {e}")
        fetch_and_insert_current_price_finnhub(ticker_symbol)

# fallback to fetch and insert or update the current price from Finnhub
def fetch_and_insert_current_price_finnhub(ticker_symbol):
    url = f'https://finnhub.io/api/v1/quote?symbol={ticker_symbol}&token={FINNHUB_API_KEY}'
    try:
        data = requests.get(url).json()
        if "c" in data:
            current_price = round(data["c"], 2)
            insert_or_update_today_price(ticker_symbol, current_price)
    except Exception as e:
        print(f"Finnhub error for {ticker_symbol}: {e}")

# fetch S&P 500 company list from the existing database
cursor.execute("SELECT ticker_symbol FROM Stock")
sp500_tickers = cursor.fetchall()

# process each stock to fetch only the current price, with a progress bar
for (ticker_symbol,) in tqdm(sp500_tickers, desc="Processing current prices for S&P 500 stocks"):
    fetch_and_insert_or_update_current_price(ticker_symbol)

# close the database connection
if db.connection.is_connected():
    cursor.close()
    db.connection.close()
    print("Database connection closed")