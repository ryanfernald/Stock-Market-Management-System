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
START_DATE = (datetime.today() - timedelta(days=365)).strftime('%Y-%m-%d')
END_DATE = datetime.today().strftime('%Y-%m-%d')

# define Pacific Time Zone
pacific = pytz.timezone("America/Los_Angeles")

# fetch historical data from Finnhub as a backup
def fetch_historical_data_finnhub(ticker_symbol):
    try:
        start_timestamp = int(datetime.strptime(START_DATE, "%Y-%m-%d").timestamp())
        end_timestamp = int(datetime.strptime(END_DATE, "%Y-%m-%d").timestamp())
        url = f"https://finnhub.io/api/v1/stock/candle?symbol={ticker_symbol}&resolution=D&from={start_timestamp}&to={end_timestamp}&token={FINNHUB_API_KEY}"
        response = requests.get(url)
        data = response.json()

        if data.get("s") == "ok":
            for i, price in enumerate(data["c"]):
                closing_date = datetime.fromtimestamp(data["t"][i]).date()
                closing_price = round(price, 2)
                market_close_time = datetime.combine(closing_date, time(13, 0))
                market_close_time = pacific.localize(market_close_time)

                # insert historical data into the database
                db.insert_or_update_price(ticker_symbol, closing_price, market_close_time)
        else:
            print(f"Finnhub returned no data for {ticker_symbol}.")
    except Exception as e:
        print(f"Error fetching historical data for {ticker_symbol} from Finnhub: {e}")

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
        else:
            print(f"No data from Yahoo Finance for {ticker_symbol}, trying Finnhub...")
            fetch_historical_data_finnhub(ticker_symbol)
    except Exception as e:
        print(f"Error fetching historical data for {ticker_symbol} from Yahoo Finance: {e}")
        fetch_historical_data_finnhub(ticker_symbol)

# fetch S&P 500 company list from Wikipedia
url = "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies"
sp500_df = pd.read_html(io.StringIO(requests.get(url).text))[0]
sp500_tickers = sp500_df[['Symbol', 'GICS Sector']].assign(Symbol=lambda df: df['Symbol'].str.replace('.', '-'))

# process each stock to fetch all historical data
for _, row in tqdm(sp500_tickers.iterrows(), total=len(sp500_tickers), desc="Processing S&P 500 stocks"):
    """
    Loop through S&P 500 stocks, inserting sector data and fetching historical prices.
    """
    ticker_symbol = row['Symbol']
    sector_name = row['GICS Sector']

    # insert or replace the stock into the database
    db.insert_or_replace_stock(ticker_symbol, sector_name)

    # fetch and insert all historical data
    fetch_and_insert_historical_data(ticker_symbol)

# close the database connection
db.close()