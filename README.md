# Mock the Stock -  A Professional & Reliable Stock Trading Environment


For the Stonks-Market project, responsibilities were divided as follows: Ryan and Sean handled the front-end development, focusing on the functional components and integration. Ashkan took charge of the backend, working on the logging system, user login functionality, and the admin dashboard. Max was responsible for the SQL schema design, data normalization, and data insertion/retrieval functions in the middle layer. Varun worked on data fetching, implementing the API integrations, and ensuring efficient data retrieval. 

## Installation 

Run the commad to clone this repository: 
    
    git clone https://github.com/ryanfernald/Stock-Market-Management-System

Before we get started, we will need both the front end react app and the back end Flask server to be running in order to connect with our database. We've also included the instructions to setup the database.

Lets get started with the Frontend. 

## Frontend 

We built our front end using a React application so in order to have this install properly we need to make sure we have npm installer and Node.js

### Step 1
The can be installed online here: `https://nodejs.org/en/download/package-manager/current` or if you prefer homebrew we can use these commands: 

    brew install node
    
To verify that you have both properly installed you can run the following commands: 

    node -v
    npm -v

Checking the versions these should be the 10.9.0 for npm and 23.3.0 for node.

Now we're ready to move on to the next step to verify the front end packages are installed properly.

### Step 2

First we can open the terminal to change our current working directory to: 

    STOCK-MARKET-MANAGEMENT-SYSTEM/frontend

To make sure we have all the packages installed properly we can run: 

    npm install

    or 

    npm i

It may take a while for all the packages to be installed, but don't worry it's working.

Once all the packages are installed we can move on to the next step to get the front end running properly with all of our custom api keys. These are important to ensure the Firebase is working for the Google login credentials, the News API which is for our user's research, and to help verify the Frontend is able to connect to the server which is on port 5000.

### Step 3
Under `STOCK-MARKET-MANAGEMENT-SYSTEM/frontend` 
create an .env file
and include these credentials 

    REACT_APP_FIREBASE_API_KEY=AIzaSyCVTm9TAtBFuOTTH8lUTvXsYO3KlnsM35Y
    REACT_APP_FIREBASE_AUTH_DOMAIN=yhuser-a2337.firebaseapp.com
    REACT_APP_FIREBASE_PROJECT_ID=yhuser-a2337
    REACT_APP_FIREBASE_STORAGE_BUCKET=yhuser-a2337.appspot.com
    REACT_APP_FIREBASE_MESSAGING_SENDER_ID=630350953898
    REACT_APP_FIREBASE_APP_ID=1:630350953898:web:13899a592c14275743bfd3
    REACT_APP_FIREBASE_MEASUREMENT_ID=G-887YEK784C
    REACT_APP_NEWS_API_KEY=34bf762c08c4477a8454f3b07beacf26
    REACT_APP_API_BASE_URL=http://127.0.0.1:5000
    FB_Name = 'https://YHUser.firebaseio.com'
    DATABASE_USER ='root'
    DATABASE_PASSWORD ='{YOUR_DB_PW}'
    DATABASE_HOST ='localhost'
    DATABASE_PORT =3306
    DATABASE_NAME = 'YHFinance'

Replace `{YOUR_DB_PW}` with your database password, DATABASE_NAME we use YHFinance, but you can use a different name which we describe later in the database section. 

### Step 5 

Sync firebase Users with SQL users.
```bash
    cd frontend/src
    node fbSync
```

Set openssl to the legacy provider.

For Mac / Linux

    export NODE_OPTIONS=--openssl-legacy-provider

For Windows 

    set NODE_OPTIONS=--openssl-legacy-provider
Run the command to start frontend application

    npm start

### Step 6
Go to a browser of your choice and visit `http://localhost:3000/` to visit the web page

Now that the front end is running, we need to get the Database working properly. Lets get started.

## Database Setup 

### Step 1

First thing we should check is that your mySQL server is running locally. Be sure to have it running before proceeding.

### Step 2

Using mySQL Workbench we can click `create a new schema in the selected server` button and title it whatever you want (lets name it YHFinance) and hit Apply.

On the left side of the screen you can see the Schema in the schema list. But if you check the tables they are not yet populated with our tables. Lets get that working. 

Locate `STOCK-MARKET-MANAGEMENT-SYSTEM/sql/create_db.sql` we're going to use this script to help create tables. Add this to mySQL Workbench.

If you named the Schema Something different than YHFinance you will need to change the name of at the top of the `create_db.sql` script "use *[Name]*" 

You can run the script by clicking the lightning bolt button, or use the bind `Command / CTRL + Return`

Now you can verify the schema has been populated with our tables. Refresh the tables on the left side of the screen to verify that the tables are updated. You can see the full list of tables by clicking the drop down menu on *Tables*.

Now we've finished setting up the database. Lets get started on the backend Flask server. 

## Backend 

This Flask server will allow us to handle API requests from the frontend, to connect to the database, pass data back and forth from from the front end to our database.

### Step 1: Install Dependencies

First, navigate to the middle layer directory by running:

```bash
brew install pkg-config
cd STOCK-MARKET-MANAGEMENT-SYSTEM/middle_layer
pip install -r requirements.txt
```


### Step 2
Create an .env file that is under `STOCK-MARKET-MANAGEMENT-SYSTEM/middle_layer` that has these credentials.

    DATABASE_HOST=localhost
    DATABASE_USER=root
    DATABASE_PASSWORD={YOUR_DB_PW}
    DATABASE_NAME={YOUR_DB_NAME}
    FINNHUB_API_KEY=csv270hr01qvib70gspgcsv270hr01qvib70gsq0

Replace `{YOUR_DB_PW}` with your database password and `{YOUR_DB_NAME}` with the name of your database (e.g., YHFinance if you followed the earlier instructions).

### Step 3
Run main_fetch.py to populate db with historical stock prices.
```bash
python src/main_fetch.py
```

### Step 4
With everything set up, it’s time to get the backend running. Run the following command:

```bash
python src/app.py
```
## End of Setup

If you happen to run into any issues with the server or the react app you should try refreshing the page or using `Command / CTRL + R`. If refreshing isn't working, verify the server is still running; if it's crashed, restart the Flask server with `python src/app.py`.


These operations should only be performed by professionals, please don't attempt at home.
Good luck and have fun!

## Important note
Make sure to sign up before trying to log in with google. Log in without sign up will result in abnormal application behaviours.

## Motivation

To evaluate the trading strategies/portfolio stocks in a real-world environment without risking real money. By utilizing mock trading, users can test their investment strategies and analyze stock performance using real market data, helping them to gain experience and confidence without financial risk. This approach allows for refining trading decisions, assessing portfolio diversification, and experimenting with different market conditions. Additionally, the platform provides comprehensive research tools for market trends and specific companies, enabling informed decision-making and enhancing users' understanding of stock behavior while maintaining a controlled, risk-free environment.

## Solution

<p>YFinance API provides real-time data and news about the stock market. This data is fetched into the db every t seconds. Data is available upon the user’s request directly from the DB, without YFinance API.</p>

<p>To simulate a real-world trading experience, the application utilizes the YFinance API for accurate, real-time stock data, including stock prices, performance metrics, and relevant news. The data is fetched constantly and stored in a local database for agile and reliable access.</p>

<p>From monk trading, users will have an initial balance, which they can use to purchase and sell stocks based on the real-time data. Their transaction history and account balance will be updated dynamically which allows them to track on their performance over time. Additional features will be implemented.</p>

<p>Overall, the application provides tools and an environment for its users to refine their strategies and become more informed and data-driven traders.</p>


