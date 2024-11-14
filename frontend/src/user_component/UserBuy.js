import React, { useState, useEffect } from "react";
import UserNavbar from "./UserNavBar";
import { useNavigate } from "react-router-dom"; 
import "./styling/UserBuy.css";

import stockData from "./holding test data/snp500.json"; 

const UserBuy = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [filteredStocks, setFilteredStocks] = useState(stockData);
    const [selectedStock, setSelectedStock] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [cashBalance, setCashBalance] = useState(10000); // Placeholder for user balance
    
    useEffect(() => {
        const lowercasedQuery = query.toLowerCase();
        setFilteredStocks(stockData.filter(stock =>
            stock.Symbol.toLowerCase().includes(lowercasedQuery) ||
            stock.Name.toLowerCase().includes(lowercasedQuery)
        ));
    }, [query]);

    const handleSelectStock = (stock) => {
        setSelectedStock(stock);
    };

    const [isQuantityValid, setIsQuantityValid] = useState(true);

    const handleQuantityChange = (e) => {
        const quantity = parseInt(e.target.value, 10);
        setQuantity(quantity);

        // Calculate total cost
        const totalCost = quantity * selectedStock.Price;

        // Validate against cash balance
        if (totalCost > cashBalance) {
            setIsQuantityValid(false);
        } else {
            setIsQuantityValid(true);
        }
    };

    const calculateTotalCost = () => {
        return selectedStock ? (selectedStock.Price * quantity).toFixed(2) : 0;
    };

    const handlePurchaseStock = () => {
        if (quantity > 0 && isQuantityValid) {
            const totalCost = (quantity * selectedStock.Price).toFixed(2);
            alert(`${quantity} Shares of ${selectedStock["Stock"]} Purchased for $${totalCost} Cash`);
            
            // Optionally, update the user's cash balance or navigate
            // Example: userCashBalance -= totalCost;
        } else {
            alert("Please enter a valid quantity within your Cash Balance.");
        }
    };

    return (
        <>
            <UserNavbar />
            <div className="user-buy-container">
                {/* Left Side: Stock Search & Table */}
                <div className="left-panel">
                    <input
                        type="text"
                        placeholder="Search for a stock..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="stock-search-bar"
                    />
                    <table className="stock-table">
                        <thead>
                            <tr>
                                <th>Symbol</th>
                                <th>Name</th>
                                <th>Sector</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStocks.map((stock) => (
                                <tr key={stock.Symbol} onClick={() => handleSelectStock(stock)}>
                                    <td>{stock.Symbol}</td>
                                    <td>{stock.Name}</td>
                                    <td>{stock.Sector}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Right Side: Stock Information & Purchase Form */}
                <div className="right-panel">
                    <div className="cash-balance">Cash Balance: ${cashBalance.toFixed(2)}</div>
                    {selectedStock && (
                        <div className="stock-info">
                            <h2>{selectedStock.Name} ({selectedStock.Symbol})</h2>
                            <p>Price per Share: ${selectedStock.Price}</p>
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={handleQuantityChange}
                                className={`quantity-input ${!isQuantityValid ? "invalid" : ""}`}
                                placeholder="Quantity to Buy"
                            />
                            <div className="transaction-summary">
                                <p>Stock Symbol: {selectedStock.Symbol}</p>
                                <p>Price per Share: ${selectedStock.Price}</p>
                                <p>Quantity: {quantity}</p>
                                <p>Total Cost: ${calculateTotalCost()}</p>
                            </div>
                            <button className="purchase-button" onClick={handlePurchaseStock}>Purchase Stock</button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default UserBuy;