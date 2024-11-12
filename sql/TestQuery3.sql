use YHFinance;
SELECT *
FROM StockPrice
WHERE ticker_symbol = 'AAPL' -- replace ticker with whatever you want to test out
ORDER BY time_posted ASC;