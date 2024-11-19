use YHFinance;
DELETE FROM StockPrice
WHERE ticker_symbol = 'AAPL'
    AND time_posted = (
        SELECT max_time_posted
        FROM (
                SELECT MAX(time_posted) AS max_time_posted
                FROM StockPrice
                WHERE ticker_symbol = 'AAPL'
            ) AS subquery
    );