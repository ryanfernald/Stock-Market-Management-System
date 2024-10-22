import yfinance as yf
import pandas as pd
import requests
import io

# get the S&P 500 company list from wikipedia
url = 'https://en.wikipedia.org/wiki/List_of_S%26P_500_companies'

# use requests to fetch the webpage
response = requests.get(url)

# wrap the response text in a StringIO object
html_content = io.StringIO(response.text)

# use pandas to read the tables from the webpage
sp500_table = pd.read_html(html_content)

# the first table is the one we want (S&P 500 company list)
sp500_df = sp500_table[0]

# extract relevant columns (ticker symbol and sector)
sp500_tickers = sp500_df[['Symbol', 'GICS Sector']].copy()

def fetch():
    # function to handle tickers with periods
    def format_ticker(ticker):
        return ticker.replace('.', '-')

    # function to fetch price for a given ticker
    def fetch_stock_data(ticker):
        try:
            # format ticker if necessary
            formatted_ticker = format_ticker(ticker)
            
            # fetch the stock data from Yahoo Finance
            stock = yf.Ticker(formatted_ticker)
            hist = stock.history(period="1d")
            if not hist.empty:
                price = hist['Close'].iloc[0]  # use .iloc for positional access
                return round(price, 2)
            else:
                return None
        except Exception as e:
            print(f"Error fetching data for {ticker}: {e}")
            return None

    # loop over each ticker in the S&P 500 and fetch the price
    stock_data_list = []

    for index, row in sp500_tickers.iterrows():
        ticker = row['Symbol']
        sector = row['GICS Sector']
        price = fetch_stock_data(ticker)
        stock_data_list.append((ticker, price, sector))

    # convert the result to a DataFrame and display it
    stock_data_df = pd.DataFrame(stock_data_list, columns=['Ticker', 'Price', 'Sector'])

    return stock_data_df

# display the first 10 rows
d = fetch()
print(d.head(10))

# could also save the result to a CSV file for insertion purposes (if you want to do it separately from a .sql file)
# stock_data_df.to_csv('sp500_stock_data.csv', index=False)
