from dotenv import load_dotenv
import os
import yfinance as yf
import pandas as pd
import requests
import io
from tqdm import tqdm
from datetime import datetime, timedelta, time
import pytz  # for timezone handling
from db_config import db

# load environment variables and set date range
load_dotenv()
START_DATE = datetime.strptime("2020-01-01", "%Y-%m-%d").date()
END_DATE = (datetime.today() - timedelta(days=1)).date()
FINNHUB_API_KEY = os.getenv('FINNHUB_API_KEY')

if not FINNHUB_API_KEY: raise ValueError("API key for Finnhub not found.")
  
  
DB_HOST = os.getenv('DB_HOST')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_NAME = os.getenv('DB_NAME')

# connect to MySQL database
try:
    connection = mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME
    )
    cursor = connection.cursor()
    print("Successfully connected to the database")
except Error as e:
    print(f"Error connecting to the database: {e}")
    

cursor = db.get_courser()

# define Pacific Time Zone
pacific = pytz.timezone("America/Los_Angeles")

# function to get stock market close time in PST for a specific date
def get_market_close_pst(date):
    local_close_time = datetime.combine(date, time(13, 0))
    return pacific.localize(local_close_time)

# function to clear StockPrice table
def clear_stockprice_table():
    cursor.execute("TRUNCATE TABLE StockPrice")
    db.connection.commit()

# function to get or create sector
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
        connection.commit()
        return new_sector_id  # return new sector_id

# function to insert or replace stock data (symbol and sector)
def insert_or_replace_stock(ticker_symbol, sector_id):
    cursor.execute(
        "REPLACE INTO Stock (ticker_symbol, sector_id) VALUES (%s, %s)", 
        (ticker_symbol, sector_id)
    )
    connection.commit()
    if result: return result[0]
    cursor.execute("INSERT INTO Sector (sector_id, sector_name) VALUES (COALESCE((SELECT MAX(sector_id) + 1 FROM Sector), 1), %s)", (sector_name,))
    db.connection.commit()
    return cursor.lastrowid

# insert or replace stock data
def insert_stock(ticker_symbol, sector_id):
    cursor.execute("REPLACE INTO Stock (ticker_symbol, sector_id) VALUES (%s, %s)", (ticker_symbol, sector_id))
    db.connection.commit()

# insert stock price data
def insert_stock_price(ticker_symbol, price, timestamp):
    cursor.execute(
        "INSERT INTO StockPrice (ticker_symbol, price) VALUES (%s, %s) "
        "ON DUPLICATE KEY UPDATE price = VALUES(price), time_posted = CURRENT_TIMESTAMP",
        (ticker_symbol, price)
    )
    connection.commit()
        "INSERT INTO StockPrice (ticker_symbol, price, time_posted) VALUES (%s, %s, %s)",
        (ticker_symbol, float(price), timestamp)
    )
    db.connection.commit()

# combined function to fetch and insert all historical and current data
def fetch_and_insert_all_data(ticker_symbol):
    try:
        stock = yf.Ticker(ticker_symbol)
        hist = stock.history(start=START_DATE.strftime('%Y-%m-%d'), end=(END_DATE + timedelta(days=1)).strftime('%Y-%m-%d'))  # +1 day to include END_DATE
        if hist.empty:
            raise Exception("No data from Yahoo")
        
        # insert each available historical price with PST market close time
        for date, row in hist.iterrows():
            insert_stock_price(ticker_symbol, round(row['Close'], 2), get_market_close_pst(date.date()))

        # insert current day's price with exact fetch time in PST
        today = datetime.today().date()
        current_data = stock.history(period="1d")
        if not current_data.empty:
            current_price = round(current_data['Close'].iloc[0], 2)
            current_timestamp = datetime.now(pacific)
            insert_stock_price(ticker_symbol, current_price, current_timestamp)

    except Exception as e:
        print(f"Yahoo Finance error for {ticker_symbol}: {e}")
        fetch_and_insert_all_data_finnhub(ticker_symbol)

# fallback to fetch all data from Finnhub
def fetch_and_insert_all_data_finnhub(ticker_symbol):
    start, end = int(datetime.combine(START_DATE, datetime.min.time()).timestamp()), int(datetime.combine(END_DATE, datetime.max.time()).timestamp())
    url = f'https://finnhub.io/api/v1/stock/candle?symbol={ticker_symbol}&resolution=D&from={start}&to={end}&token={FINNHUB_API_KEY}'
    try:
        data = requests.get(url).json()
        if data.get("s") == "ok":
            for i, price in enumerate(data['c']):
                date = datetime.fromtimestamp(data['t'][i]).date()
                insert_stock_price(ticker_symbol, round(price, 2), get_market_close_pst(date))
        
        # insert current price with current timestamp in PST if not in fetched data
        today = datetime.today().date()
        if today not in [datetime.fromtimestamp(ts).date() for ts in data['t']]:
            current_url = f'https://finnhub.io/api/v1/quote?symbol={ticker_symbol}&token={FINNHUB_API_KEY}'
            current_data = requests.get(current_url).json()
            if "c" in current_data:
                current_price = round(current_data["c"], 2)
                current_timestamp = datetime.now(pacific)  # use the current PST time for insertion
                insert_stock_price(ticker_symbol, current_price, current_timestamp)

    except Exception as e:
        print(f"Finnhub error for {ticker_symbol}: {e}")

# clear the StockPrice table at the start of each run
clear_stockprice_table()

# fetch S&P 500 company list from Wikipedia
url = 'https://en.wikipedia.org/wiki/List_of_S%26P_500_companies'
sp500_df = pd.read_html(io.StringIO(requests.get(url).text))[0]
sp500_tickers = sp500_df[['Symbol', 'GICS Sector']].assign(Symbol=lambda df: df['Symbol'].str.replace('.', '-'))

# process each stock and fill in all available data
for _, row in tqdm(sp500_tickers.iterrows(), total=len(sp500_tickers), desc="Processing S&P 500 stocks"):
    ticker_symbol, sector_name = row['Symbol'], row['GICS Sector']
    sector_id = get_or_create_sector(sector_name)
    insert_stock(ticker_symbol, sector_id)
    fetch_and_insert_all_data(ticker_symbol)  # fetch all historical and current data

# close the database connection
if db.connection.is_connected():
    cursor.close()
    db.connection.close()
    print("Database connection closed")