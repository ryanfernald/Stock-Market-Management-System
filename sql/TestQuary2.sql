use YHFinance;
SELECT *
FROM Stock AS S
JOIN StockPrice AS SP ON S.ticker_symbol = SP.ticker_symbol;