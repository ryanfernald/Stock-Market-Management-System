from dotenv import load_dotenv
import os
import yfinance as yf
import requests
from datetime import datetime, time, timedelta
import pytz
from tqdm import tqdm
from db_config import db

# load environment variables
load_dotenv()
FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY")
if not FINNHUB_API_KEY:
    raise ValueError("API key for Finnhub not found.")

# define Pacific Time Zone
pacific = pytz.timezone("America/Los_Angeles")

# function to fetch the last available closing price and insert it if not already in the database
def fetch_and_insert_latest_closing_price(ticker_symbol):
    try:
        # Fetch data for the last 5 days to ensure the most recent closing price is included
        stock = yf.Ticker(ticker_symbol)
        hist = stock.history(period="5d")  # Fetch last 5 days of data

        if not hist.empty:
            # Get the last available closing price
            last_close_date = hist.index[-1].date()
            last_close_price = round(hist["Close"].iloc[-1], 2)
            
            # Set market close time (1:00 PM PST) as the timestamp
            market_close_time = datetime.combine(last_close_date, time(13, 0), tzinfo=pacific)

            # Insert only if the price for this date does not already exist
            if not db.check_today_entry_exists(ticker_symbol, last_close_date):
                db.insert_or_update_price(ticker_symbol, last_close_price, market_close_time)
        else:
            print(f"No data available from Yahoo Finance for {ticker_symbol}.")

    except Exception as e:
        print(f"Error fetching data for {ticker_symbol}: {e}")

# fetch S&P 500 company list from the existing database
sp500_tickers = db.fetch_sp500_tickers()

# ensure the full result set is fetched to avoid unread results
sp500_tickers = list(sp500_tickers)  # Fully fetch all results into memory

# process each stock to fetch the last available closing price, with a progress bar
for (ticker_symbol,) in tqdm(sp500_tickers, desc="Processing S&P 500 stocks for latest prices"):
    fetch_and_insert_latest_closing_price(ticker_symbol)

# close the database connection
db.close()