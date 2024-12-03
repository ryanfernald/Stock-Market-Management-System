import UserNavbar from "./UserNavBar";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import "./styling/UserSell.css";

import stockList from "./historical_data/stock_list.json";

const UserSell = () => {
    const navigate = useNavigate();
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

    const calculateTotalValue = (stock) => {
        return (stock["Quantity Shares"] * stock["Current Price"]).toFixed(2);
    };

    const calculatePercentChange = (stock) => {
        const percentChange = ((stock["Current Price"] - stock["Purchase Price"]) / stock["Purchase Price"]) * 100;
        return percentChange.toFixed(2);
    };

    const calculateDollarChange = (stock) => {
        const dollarChange = (stock["Current Price"] - stock["Purchase Price"]) * stock["Quantity Shares"];
        return dollarChange.toFixed(2);
    };

    const calculateSaleValue = () => {
        if (selectedStock) {
            return (selectedStock["Current Price"] * quantityToSell).toFixed(2);
        }
        return 0;
    };

    const handleSellStock = () => {
        if (quantityToSell > 0 && quantityToSell <= selectedStock["Quantity Shares"]) {
            const saleValue = calculateSaleValue();
            // Display a pop-up message
            alert(`${quantityToSell} Shares of ${selectedStock["Stock"]} Sold for $${saleValue} Cash`);
            
            // Optionally, update the state to reflect the new stock quantity or navigate away
            // Example: selectedStock["Quantity Shares"] -= quantityToSell;
        } else {
            alert("Please enter a valid quantity to sell.");
        }
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
                            {stockList.map((stock) => (
                                <tr key={stock.Symbol} onClick={() => handleSelectStock(stock)}>
                                    <td>{stock.Symbol}</td>
                                    <td>{stock["Quantity Shares"]}</td>
                                    <td>{stock["Purchase Price"]}</td>
                                    <td>{stock["Current Price"]}</td>
                                    <td>{calculateTotalValue(stock)}</td>
                                    <td className={calculatePercentChange(stock) >= 0 ? "positive" : "negative"}>
                                        {calculatePercentChange(stock)}%
                                    </td>
                                    <td className={calculateDollarChange(stock) >= 0 ? "positive" : "negative"}>
                                        ${calculateDollarChange(stock)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Right Side: Sell Stock Form */}
                <div className="right-panel">
                    {selectedStock && (
                        <div className="stock-info">
                            <h2>{selectedStock.Stock}</h2>
                            <p>Current Price: ${selectedStock["Current Price"]}</p>
                            <p>Shares Owned: {selectedStock["Quantity Shares"]}</p>
                            <p>Total Value: ${calculateTotalValue(selectedStock)}</p>
                            <input
                                type="number"
                                min="1"
                                max={selectedStock["Quantity Shares"]}
                                value={quantityToSell}
                                onChange={handleQuantityChange}
                                className={`quantity-input ${!isQuantityValid ? "invalid" : ""}`}
                                placeholder="Quantity to Sell"
                            />
                            <p>Remaining Shares: {selectedStock["Quantity Shares"] - quantityToSell}</p>
                            <p>Total Sale Value: ${calculateSaleValue()}</p>
                            <button className="sell-button" onClick={handleSellStock}>Sell Stock</button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default UserSell;