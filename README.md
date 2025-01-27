# Mock the Stock -  A Professional & Reliable Stock Trading Environment

## Motivation

To evaluate the trading strategies/portfolio stocks in a real-world environment without risking real money. By utilizing mock trading, users can test their investment strategies and analyze stock performance using real market data, helping them to gain experience and confidence without financial risk. This approach allows for refining trading decisions, assessing portfolio diversification, and experimenting with different market conditions. Additionally, the platform provides comprehensive research tools for market trends and specific companies, enabling informed decision-making and enhancing users' understanding of stock behavior while maintaining a controlled, risk-free environment.

## Solution

<p>YFinance API provides real-time data and news about the stock market. This data is fetched into the db every t seconds. Data is available upon the user’s request directly from the DB, without YFinance API.</p>

<p>To simulate a real-world trading experience, the application utilizes the YFinance API for accurate, real-time stock data, including stock prices, performance metrics, and relevant news. The data is fetched constantly and stored in a local database for agile and reliable access.</p>

<p>From monk trading, users will have an initial balance, which they can use to purchase and sell stocks based on the real-time data. Their transaction history and account balance will be updated dynamically which allows them to track on their performance over time. Additional features will be implemented.</p>

<p>Overall, the application provides tools and an environment for its users to refine their strategies and become more informed and data-driven traders.</p>

## Architecture

The architecture of the system consists of several key components designed for optimal performance and user experience. The **frontend** is built using **React**, which allows for a dynamic and responsive user interface. On the **backend**, a **Flask API** is utilized to manage data requests and operations efficiently. The **database** is implemented with **MySQL**, featuring a **BCNF-normalized schema** to ensure data integrity and reduce redundancy. The overall workflow involves users interacting through the React-based UI, while backend operations are handled via Flask APIs that fetch data from the MySQL database. To facilitate stock information, a mock **S&P 500 dataset** is employed, providing users with relevant financial data.

![architecture - system design](https://github.com/user-attachments/assets/2c9ff1ce-dcb4-45ca-b6de-665138088e54)

### Landing Page and News Page

When users launch our program, they are welcomed by a landing page that showcases the latest business news headlines and a chart displaying the Dow Jones Industrial Average over the past six months. Users can customize the chart to view data for the NASDAQ, S&P 500, and Apple, with options to adjust the time frame for up to one year. Notably, users do not need to log in to access the news tab, allowing them to explore significant headlines related to their stock interests, as well as updates in pop culture, science, healthcare, and technology. They can preview articles from a list on the left and click the "Read More" button for full access. Additionally, a search bar is available for users to find headlines related to specific companies. 

![landing page](https://github.com/user-attachments/assets/61623256-2c1a-4eb5-ace0-b2a2c8686db6) ![news page](https://github.com/user-attachments/assets/20e3d67d-a9fd-4a3b-888c-8fd9a52971c4)

### Logging In and Signing Up

In order to use most of the features the user needs to register an account with us. They use can use the Sign Up button, or if they already have an account they can Login. All they need to Signup is an Email, Password and their name. We also have a connection with Google’s Firebase API which allows the user to sign up / login with their Google Account.

<img width="1007" alt="Screenshot 2025-01-27 at 11 57 26 AM" src="https://github.com/user-attachments/assets/02dae992-9f79-4484-bb9c-c0d7dd12b698" />

### Handling Transactions

The Deposit and Withdrawal functions allow users to manage their account funds effortlessly. When a user logs in, they can quickly access the Buy, Sell, Deposite and Withdraw Buttons. Upon clicking either the deposit or withdrawal button, the corresponding amount is instantly processed and sent to the database through our routers, ensuring seamless data management. Users can immediately see an update in their Portfolio Value and Cash Value that reflects the recent transaction, providing them with real-time insights into their financial standing.

#### Buying a Stock

Once users have sufficient funds in their accounts, they can navigate to the Buy Stock page to purchase stocks. Currently, users can only buy full shares of equities, with no support for fractional shares due to storage limitations in our database. The page allows users to search for stocks by Ticker Symbol or Company Name, and they can also filter stocks by sector. This functionality is powered by our quick_fetch feature, which retrieves the latest stock prices for S&P 500 companies. An example of the User Buy page is shown in Figure 9 below.

![buy stock](https://github.com/user-attachments/assets/3f0e6844-9a9d-4378-adfe-86af11c81317)

### Dynamic Chart Data

After a successful purchase, the stock information is instantly sent to our database via the stock manipulation router, processing the transaction as a Market Order and updating the user's cash balance accordingly. Returning to the User Dashboard, the Holdings Table reflects the newly purchased stock, displaying all market orders. Each entry in the table is clickable, revealing a detailed chart of the stock's 1-year price history, which aids users in making informed decisions about their investments. The Holdings Table also provides users with metrics like Percent Change and Dollar Change, allowing for easy tracking of profits and potential losses.

https://github.com/user-attachments/assets/1663c259-973e-42b4-90f7-5cb7e0087279

#### Selling a Stock

When the user Sells a Stock from their holdings table their cash Balance is updated as well as the holdings table with the appropriate number of shares remaining from their Sale. Each time the user buys or sells a stock the Trading History is updated with information about each stock purchase or sale with the number of shares, the ticker symbol and the cost / sale value of each transaction.

![sell stock](https://github.com/user-attachments/assets/169ddf11-8bde-4e8f-b0c7-bbc0b5d27d61)

## Check out the App Demo

https://youtu.be/xWGt5QM9U0g?si=1HItIJAXWWQ2689y

## Meet our Team

Ryan and Sean handled the front-end development, focusing on the functional components and integration. Ashkan took charge of the backend, working on the logging system, user login functionality, and the admin dashboard. Max was responsible for the SQL schema design, data normalization, and data insertion/retrieval functions in the middle layer. Varun worked on data fetching, implementing the API integrations, and ensuring efficient data retrieval.

<img width="1631" alt="meet the team" src="https://github.com/user-attachments/assets/16ae983a-59e2-448b-a45d-55173b2193ae" />

