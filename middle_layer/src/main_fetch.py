from dotenv import load_dotenv
import os
import yfinance as yf
import pandas as pd
import requests
import io

# load environment variables from .env file
load_dotenv()

# access the API key from environment variables
FINNHUB_API_KEY = os.getenv('FINNHUB_API_KEY')

# check if the API key is loaded
if FINNHUB_API_KEY is None:
    raise ValueError("API key for Finnhub not found. Please set FINNHUB_API_KEY in your .env file.")

# get S&P 500 company list
url = 'https://en.wikipedia.org/wiki/List_of_S%26P_500_companies'

# use requests to fetch webpage
response = requests.get(url)

# wrap response text in a StringIO object
html_content = io.StringIO(response.text)

# use pandas to read the tables from the webpage
sp500_table = pd.read_html(html_content)

# the first table is the one we want (S&P 500 company list)
sp500_df = sp500_table[0]

#extract relevant columns (Ticker symbol and Sector)
sp500_tickers = sp500_df[['Symbol', 'GICS Sector']].copy()

# function to handle tickers with periods
def format_ticker(ticker):
    return ticker.replace('.', '-')

# backup function to fetch stock price from Finnhub
def backup_fetch(ticker):
    try:
        url = f'https://finnhub.io/api/v1/quote?symbol={ticker}&token={FINNHUB_API_KEY}'
        response = requests.get(url)
        data = response.json()

        # check if data is present
        if "c" in data:  # "c" is the current price in Finnhub response
            return round(data["c"], 2)
        else:
            print(f"No data found for {ticker} on Finnhub.")
            return None
    except Exception as e:
        print(f"Finnhub error for {ticker}: {e}")
        return None

# function to fetch stock data using Yahoo Finance with Finnhub as a backup
def fetch_stock_data(ticker):
    # try Yahoo Finance first
    try:
        formatted_ticker = format_ticker(ticker)
        stock = yf.Ticker(formatted_ticker)
        hist = stock.history(period="1d")
        
        if not hist.empty:
            price = round(hist['Close'].iloc[0], 2)
            return price
        else:
            print(f"No data from Yahoo Finance for {ticker}, trying Finnhub...")
    except Exception as e:
        print(f"Yahoo Finance error for {ticker}: {e}")

    # fallback to Finnhub if Yahoo Finance fails
    return backup_fetch(ticker)

# loop over each ticker in the S&P 500 and fetch the price
stock_data_list = []

for index, row in sp500_tickers.iterrows():
    ticker = row['Symbol']
    sector = row['GICS Sector']
    price = fetch_stock_data(ticker)
    stock_data_list.append((ticker, price, sector))

# convert the result to a DataFrame and print it
stock_data_df = pd.DataFrame(stock_data_list, columns=['Ticker', 'Price', 'Sector'])
print(stock_data_df.to_string(index=False))

# could also save the result to a CSV file
# stock_data_df.to_csv('sp500_stock_data.csv', index=False)
