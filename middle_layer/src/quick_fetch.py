from dotenv import load_dotenv
import os
import yfinance as yf
import requests
from datetime import datetime, time
import pytz
from tqdm import tqdm
from db_config import db

def qf():
    # load environment variables
    load_dotenv()
    FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY")
    if not FINNHUB_API_KEY:
        raise ValueError("API key for Finnhub not found.")

    # define Pacific Time Zone
    pacific = pytz.timezone("America/Los_Angeles")

    # fetch the latest available closing price from Finnhub as a backup
    def fetch_latest_closing_price_finnhub(ticker_symbol):
        """
        Fetch the latest available closing price for a ticker from Finnhub and insert it if not already in the database.
        """
        try:
            url = f"https://finnhub.io/api/v1/quote?symbol={ticker_symbol}&token={FINNHUB_API_KEY}"
            response = requests.get(url).json()

            if "c" in response:
                last_close_price = round(response["c"], 2)
                last_close_date = datetime.now(pacific).date()
                market_close_time = datetime.combine(last_close_date, time(13, 0))
                market_close_time = pacific.localize(market_close_time)

                if not db.check_today_entry_exists(ticker_symbol, last_close_date):
                    db.insert_or_update_price(ticker_symbol, last_close_price, market_close_time)
        except Exception as e:
            print(f"Error fetching data for {ticker_symbol} from Finnhub: {e}")

    # fetch the last available closing price from Yahoo Finance
    def fetch_and_insert_latest_closing_price(ticker_symbol):
        """
        Fetch the most recent closing price for a ticker from Yahoo Finance. Use Finnhub as a fallback if Yahoo fails.
        """
        try:
            stock = yf.Ticker(ticker_symbol)
            hist = stock.history(period="5d")  # fetch last 5 days of data

            if not hist.empty:
                last_close_date = hist.index[-1].date()
                last_close_price = round(hist["Close"].iloc[-1], 2)
                market_close_time = datetime.combine(last_close_date, time(13, 0))
                market_close_time = pacific.localize(market_close_time)

                # insert the closing price only if not already in the database
                if not db.check_today_entry_exists(ticker_symbol, last_close_date):
                    db.insert_or_update_price(ticker_symbol, last_close_price, market_close_time)
            else:
                fetch_latest_closing_price_finnhub(ticker_symbol)
        except Exception as e:
            fetch_latest_closing_price_finnhub(ticker_symbol)

    # fetch S&P 500 company list from the existing database
    sp500_tickers = db.fetch_sp500_tickers()

    # ensure the full result set is fetched to avoid unread results
    sp500_tickers = list(sp500_tickers)  # fully fetch all results into memory

    # process each stock to fetch the last available closing price
    for (ticker_symbol,) in tqdm(sp500_tickers, desc="Processing S&P 500 stocks for latest prices"):
        """
        Iterate over all S&P 500 stocks and fetch the most recent closing prices from Yahoo or Finnhub.
        """
        fetch_and_insert_latest_closing_price(ticker_symbol)
    

if __name__ == "__main__":
    qf()
    db.close()