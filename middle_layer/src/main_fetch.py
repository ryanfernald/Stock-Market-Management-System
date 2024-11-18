from dotenv import load_dotenv
import os
import yfinance as yf
import pandas as pd
import requests
import io
from datetime import datetime, timedelta, time
import pytz
from tqdm import tqdm
from db_config import db

# load environment variables and set date range
load_dotenv()
FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY")
if not FINNHUB_API_KEY:
    raise ValueError("API key for Finnhub not found.")
START_DATE = "2010-01-01"
END_DATE = (datetime.today() - timedelta(days=1)).strftime('%Y-%m-%d')

# define Pacific Time Zone
pacific = pytz.timezone("America/Los_Angeles")

# fetch and insert all historical data for a given ticker
def fetch_and_insert_historical_data(ticker_symbol):
    try:
        stock = yf.Ticker(ticker_symbol)
        hist = stock.history(start=START_DATE, end=END_DATE)
        if not hist.empty:
            for date, row in hist.iterrows():
                closing_price = round(row['Close'], 2)
                market_close_time = datetime.combine(date.date(), time(13, 0))
                market_close_time = pacific.localize(market_close_time)

                # insert historical data into the database
                db.insert_or_update_price(ticker_symbol, closing_price, market_close_time)
    except Exception as e:
        print(f"Error fetching historical data for {ticker_symbol} from Yahoo Finance: {e}")

# fetch S&P 500 company list from Wikipedia
url = "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies"
sp500_df = pd.read_html(io.StringIO(requests.get(url).text))[0]
sp500_tickers = sp500_df[['Symbol', 'GICS Sector']].assign(Symbol=lambda df: df['Symbol'].str.replace('.', '-'))

# process each stock to fetch all historical data
for _, row in tqdm(sp500_tickers.iterrows(), total=len(sp500_tickers), desc="Processing S&P 500 stocks"):
    ticker_symbol = row['Symbol']
    sector_name = row['GICS Sector']

    # insert or replace the stock into the database
    db.insert_or_replace_stock(ticker_symbol, sector_name)

    # fetch and insert all historical data
    fetch_and_insert_historical_data(ticker_symbol)

# close the database connection
db.close()