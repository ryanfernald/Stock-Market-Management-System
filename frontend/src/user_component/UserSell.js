import UserNavbar from "./UserNavBar";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import "./styling/UserSell.css";

import stockDetails from "./stock_details.json";

const UserSell = () => {
    const navigate = useNavigate();
    const [expandedRow, setExpandedRow] = useState(null);
    const [selectedStock, setSelectedStock] = useState(null);
    const [quantityToSell, setQuantityToSell] = useState(0);

    const handleSelectStock = (stock) => {
        setSelectedStock(stock);
        setQuantityToSell(0); // Reset the quantity to sell
    };

    const [isQuantityValid, setIsQuantityValid] = useState(true);

    const handleQuantityChange = (e) => {
        const quantity = parseInt(e.target.value, 10);
        setQuantityToSell(quantity);

        // Check if the quantity is within valid range
        if (quantity < 0 || quantity > selectedStock["Quantity Shares"]) {
            setIsQuantityValid(false);
        } else {
            setIsQuantityValid(true);
        }
    };

    const calculateTotalValue = (quantity, currentPrice) => {
        return (quantity * currentPrice).toFixed(2);
    };

    const calculatePercentChange = (price_purchased, current_price) => {
        const percentChange = ((current_price - price_purchased) / price_purchased) * 100;
        return percentChange.toFixed(2);
    };

    const calculateDollarChange = (price_purchased, current_price, quantity) => {
        const dollarChange = (current_price - price_purchased) * quantity;
        return dollarChange.toFixed(2);
    };

    const calculateSaleValue = () => {
        if (selectedStock) {
            return (selectedStock.currentPrice * quantityToSell).toFixed(2);
        }
        return 0;
    };
    const getCurrentPrice = (symbol, stockDetails) => {
        const stock = stockDetails.find((stock) => stock.Symbol === symbol);
        return stock ? parseFloat(stock.Price) : 0; // Return price or 0 if not found
    };

    const handleSellStock = async () => {
        if (quantityToSell > 0 && quantityToSell <= selectedStock.quantity) {
            const saleValue = quantityToSell * getCurrentPrice(selectedStock.ticker_symbol, stockDetails);
            
            // Display a pop-up message (optional)
            // alert(`${quantityToSell} Shares of ${selectedStock.ticker_symbol} Sold for $${saleValue} Cash`);
    
            const userId = localStorage.getItem("uid");
            if (!userId) {
                console.error("User ID not found in local storage.");
                return;
            }
    
            try {
                // Create the data to be sent in the POST request body
                const requestData = {
                    user_id: userId,
                    ticker: selectedStock.ticker_symbol,
                    quantity: quantityToSell,
                };
    
                // Make a POST request to the backend API
                const response = await fetch(`http://127.0.0.1:5000/stock_m/sell/${userId}/${selectedStock.ticker_symbol}/${quantityToSell}`, {
                    method: "POST", // Use POST method
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestData), // Send the request data in the body as a JSON object
                });
    
                if (!response.ok) {
                    throw new Error(`Error processing the sell request: ${response.statusText}`);
                }
    
                const t = await response.json(); // Assuming the response is in JSON format
                console.log(t);
                setTransactions(t); // Update the state with the response data
                navigate('/dashboard')
            } catch (error) {
                console.error("Failed to sell the stock:", error);
            }
        } else {
            alert("Please enter a valid quantity to sell.");
        }
    };
    

    const [transactions, setTransactions] = useState([]);
    useEffect(() => {
        const fetchUserH = async () => {
            const userId = localStorage.getItem("uid");
            if (!userId) {
                console.error("User ID not found in local storage.");
                return;
            }

            try {
                const response = await fetch(`http://127.0.0.1:5000/transaction_h/${userId}`);
                if (!response.ok) {
                throw new Error(`Error fetching balance: ${response.statusText}`);
                }
                const t = await response.json();
                console.log(t)
                setTransactions(t); // Update state with fetched data
                console.log(transactions)
                // setLoading(false);
            } catch (error) {
                console.error("Failed to fetch user balance:", error);
                // setLoading(false);
            }
        };
        fetchUserH();
    }, []);

   

    const toggleRow = (index) => {
        setExpandedRow(expandedRow === index ? null : index);
     };

    return (
        <>
            <UserNavbar />
            <div className="user-sell-container">
                {/* Left Side: Holdings Table */}
                <div className="left-panel">
                    <table className="holdings-table">
                        <thead>
                            <tr>
                                <th>Symbol</th>
                                <th>Quantity</th>
                                <th>Purchase Price</th>
                                <th>Current Price</th>
                                <th>Total Value</th>
                                <th>Percent Change</th>
                                <th>Dollar Change</th>
                            </tr>
                        </thead>
                        <tbody>
                        {Object.entries(
                            transactions.reduce((acc, transaction) => {
                                const { ticker_symbol, order_type, quantity, price_purchased } = transaction;

                                if (!acc[ticker_symbol]) {
                                    acc[ticker_symbol] = {
                                    quantity: 0,
                                    total_purchased: 0,
                                    price_purchased: 0, // Average purchase price
                                    };
                                }

                                if (order_type === "BUY") {
                                    acc[ticker_symbol].quantity += quantity;
                                    acc[ticker_symbol].total_purchased += quantity * price_purchased;
                                } else if (order_type === "SELL") {
                                    acc[ticker_symbol].quantity -= quantity;
                                }

                                acc[ticker_symbol].price_purchased =
                                    acc[ticker_symbol].quantity > 0
                                    ? acc[ticker_symbol].total_purchased / acc[ticker_symbol].quantity
                                    : 0;

                                return acc;
                            }, {})
                        )
                            .filter(([_, { quantity }]) => quantity > 0) // Only include stocks with remaining quantity
                            .map(([ticker_symbol, { quantity, price_purchased }], index) => {
                                const currentPrice = getCurrentPrice(ticker_symbol, stockDetails);

                                return (
                                    <React.Fragment key={index}>
                                    <tr onClick={() => handleSelectStock({ ticker_symbol, quantity, price_purchased })} style={{ cursor: "pointer" }}>
                                        <td>{ticker_symbol}</td>
                                        <td>{quantity}</td>
                                        <td>${price_purchased.toFixed(2)}</td>
                                        <td>${currentPrice.toFixed(2)}</td>
                                        <td>${calculateTotalValue(quantity, currentPrice)}</td>
                                        <td
                                            className={
                                                calculatePercentChange(price_purchased, currentPrice) >= 0
                                                ? "text-positive"
                                                : "text-negative"
                                            }
                                        >
                                            {calculatePercentChange(price_purchased, currentPrice)}%
                                        </td>
                                        <td
                                            className={
                                                calculateDollarChange(price_purchased, currentPrice, quantity) >= 0
                                                ? "text-positive"
                                                : "text-negative"
                                            }
                                        >
                                            ${calculateDollarChange(price_purchased, currentPrice, quantity)}
                                        </td>
                                    </tr>
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="right-panel">
                {selectedStock && (
                    <div className="stock-info">
                        <h2>{selectedStock.ticker_symbol}</h2>
                        <p>Current Price: ${getCurrentPrice(selectedStock.ticker_symbol, stockDetails)}</p>
                        <p>Shares Owned: {selectedStock.quantity}</p>
                        <p>Total Value: ${calculateTotalValue(selectedStock.quantity, selectedStock.price_purchased)}</p>
                        <input
                            type="number"
                            min="1"
                            max={selectedStock.quantity}
                            value={quantityToSell}
                            onChange={handleQuantityChange}
                            className={`quantity-input ${!isQuantityValid ? "invalid" : ""}`}
                            placeholder="Quantity to Sell"
                        />
                        <p>Remaining Shares: {selectedStock.quantity - quantityToSell}</p>
                        <p>Total Sale Value: ${calculateTotalValue(quantityToSell, getCurrentPrice(selectedStock.ticker_symbol, stockDetails))}</p>
                        <button className="sell-button" onClick={handleSellStock}>Sell Stock</button>
                    </div>
                )}
                </div>
            </div>
        </>
    );
};

export default UserSell;


