import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate instead of useHistory
import UserNavbar from "./UserNavBar";
import UserTransaction from "./UserTransaction";
import UserPaymentOption from "./UserPaymentOption";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

import appleHistory from "./historical_data/appl_history.json";
import msftHistory from "./historical_data/msft_history.json";
import googHistory from "./historical_data/goog_history.json";

import watchList from "./historical_data/watch_list.json";

import stockDetails from "./stock_details.json";

import "./styling/UserDashboard.css";

const UserDashboard = () => {
   const [expandedRow, setExpandedRow] = useState(null);
   const calculateTotalValue = (quantity, currentPrice) => {
      return (quantity * currentPrice);
   };
   const calculatePercentChange = (purchasePrice, currentPrice) => {
      return (((currentPrice - purchasePrice) / purchasePrice) * 100);
   };
   const calculateDollarChange = (purchasePrice, currentPrice) => {
      return (currentPrice - purchasePrice);
   };
   // Map each stock symbol to its respective history data
   const historyDataMap = {
      "APPL": appleHistory,
      "MSFT": msftHistory,
      "GOOG": googHistory,
   };
   const formatTick = (dateString) => {
      return format(new Date(dateString), 'yyyy-MM');
   };
   // Toggle row expansion for Holdings table
   const toggleRow = (index) => {
      setExpandedRow(expandedRow === index ? null : index);
   };


   const activityData = [
      { month: "Jan", activity: 400 },
      { month: "Feb", activity: 300 },
      { month: "Mar", activity: 200 },
      { month: "Apr", activity: 278 },
      { month: "May", activity: 189 },
      { month: "Jun", activity: 239 },
      { month: "Jul", activity: 349 },
      { month: "Aug", activity: 200 },
      { month: "Sep", activity: 300 },
      { month: "Oct", activity: 400 },
      { month: "Nov", activity: 500 },
      { month: "Dec", activity: 600 },
   ];

   const [balanceDetails, setBalanceDetails] = useState(0);
   const [loading, setLoading] = useState(true);
   const navigate = useNavigate();

   const handleRowClick = (company) => {
      sessionStorage.setItem("newsSearchQuery", company);
      navigate("/news-logged-in");
   };

   useEffect(() => {
      const fetchUserBalance = async () => {
         const userId = localStorage.getItem("uid");
         if (!userId) {
            console.error("User ID not found in local storage.");
            return;
         }

         try {
            const response = await fetch(`http://127.0.0.1:5000/portfolio/value/${userId}`);
            if (!response.ok) {
               throw new Error(`Error fetching balance: ${response.statusText}`);
            }
            const balance = await response.json();
            console.log(balance)
            setBalanceDetails(balance); // Update state with fetched data
            setLoading(false);
         } catch (error) {
            console.error("Failed to fetch user balance:", error);
            setLoading(false);
         }
      };
      fetchUserBalance();
   }, []);
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
            setLoading(false);
         } catch (error) {
            console.error("Failed to fetch user balance:", error);
            setLoading(false);
         }
      };
      fetchUserH();
   }, []);

   const [cash, setCash] = useState([]);
   useEffect(() => {
      const fetchUserH = async () => {
         const userId = localStorage.getItem("uid");
         if (!userId) {
            console.error("User ID not found in local storage.");
            return;
         }

         try {
            const response = await fetch(`http://127.0.0.1:5000/user_b/balance/${userId}`);
            if (!response.ok) {
               throw new Error(`Error fetching balance: ${response.statusText}`);
            }
            const t = await response.json();
            console.log(t)
            setCash(t); // Update state with fetched data
            console.log("**********************", t)
            setLoading(false);
         } catch (error) {
            console.error("Failed to fetch user balance:", error);
            setLoading(false);
         }
      };
      fetchUserH();
   }, []);

   const getCurrentPrice = (symbol, stockDetails) => {
      const stock = stockDetails.find((stock) => stock.Symbol === symbol);
      return stock ? parseFloat(stock.Price) : 0; // Return price or 0 if not found
   };

   var temp = balanceDetails + cash.net_balance

   return (
      <>
         <UserNavbar />
         <div className="dashboard">
            <div className="dashboard-header">
               <h3>Welcome Back! {localStorage.getItem("email")}</h3>
            </div>

            <div className="dashboard-content">
               {/* Balance Details */}
               <div className="summary-card">
                  <h3>Portfolio Value</h3>
                  {loading ? (
                     <p>Loading...</p>
                  ) : (
                     <div id="balance-details">
                        <p>Portfolio Value: ${temp.toFixed(2)}</p>
                        <p>Cash Value: ${cash.net_balance.toFixed(2)}</p>

                     </div>
                  )}
                  <button onClick={() => (window.location.href = "/userstatement")}>View Details</button>
               </div>

               {/* Rest of your components */}
               <div className="action-card">
                  <h3>Quick Actions</h3>
                  <div className="action-buttons">
                     <UserPaymentOption title="Buy" action={() => (window.location.href = "/userbuy")} />
                     <UserPaymentOption title="Sell" action={() => (window.location.href = "/usersell")} />
                     <UserPaymentOption title="Deposit" action={() => (window.location.href = "/usermovemoney?tab=deposit")} />
                     <UserPaymentOption title="Withdraw" action={() => (window.location.href = "/usermovemoney?tab=withdraw")} />
                  </div>
               </div>

               {/* Monthly Report and Other Components */}
               <div className="activity-card">
                  <h3>Monthly Report</h3>
                  <ResponsiveContainer width="95%" height={300}>
                     <LineChart data={activityData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="activity" stroke="#8884d8" strokeWidth={2} />
                     </LineChart>
                  </ResponsiveContainer>
               </div>

               {/* Transaction History */}
               <div className="transaction-card">
                  <h3>Trading History</h3>
                  {transactions.slice(-5).reverse().map((transaction) => { // Get the last 5 transactions and reverse the order
                     const amount = transaction.order_type === 'BUY'
                        ? -transaction.quantity * transaction.price_purchased
                        : transaction.quantity * transaction.price_purchased;
                     const textColor = amount >= 0 ? 'green' : 'red';
                     return (
                        <div key={transaction.order_id} style={{ color: textColor }}>
                           <UserTransaction
                              id={transaction.order_id}
                              amount={amount}
                              ticker_symbol={transaction.ticker_symbol}
                              quantity={transaction.quantity}
                           />
                        </div>
                     );
                  })}
               </div>
            </div>
            {/* Transaction History */}
            <div className="activity-card holdings">
               <h3>Holdings</h3>
               <table>
                  <thead>
                     <tr>
                        <th>Stock</th>
                        <th>Quantity Shares</th>
                        <th>Purchase Price</th>
                        <th>Current Price</th>
                        <th>Total Value</th>
                        <th>Percent Change</th>
                        <th>Dollar Change</th>
                     </tr>
                  </thead>
                  <tbody>
                     {/* Compute net holdings */}
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
                                 <tr onClick={() => toggleRow(index)} style={{ cursor: "pointer" }}>
                                    <td>{ticker_symbol}</td>
                                    <td>{quantity}</td>
                                    <td>${price_purchased.toFixed(2)}</td>
                                    <td>${currentPrice.toFixed(2)}</td>
                                    <td>${calculateTotalValue(quantity, currentPrice).toFixed(2)}</td>
                                    <td
                                       className={
                                          calculatePercentChange(price_purchased, currentPrice) >= 0
                                             ? "text-positive"
                                             : "text-negative"
                                       }
                                    >
                                       {calculatePercentChange(price_purchased, currentPrice).toFixed(2)}%
                                    </td>
                                    <td
                                       className={
                                          calculateDollarChange(price_purchased, currentPrice) >= 0
                                             ? "text-positive"
                                             : "text-negative"
                                       }
                                    >
                                       ${calculateDollarChange(price_purchased, currentPrice).toFixed(2)}
                                    </td>
                                 </tr>
                              </React.Fragment>
                           );
                        })}
                  </tbody>
               </table>
            </div>
            <div className="activity-card watch-list">
               <h3>Watch List</h3>
               <table className="watch-list-table">
                  <thead>
                     <tr>
                        <th>Stock</th>
                        <th>Company</th>
                        <th>Current Price</th>
                     </tr>
                  </thead>
                  <tbody>
                     {watchList.map((item, index) => (
                        <tr
                           key={index}
                           onClick={() => handleRowClick(item.Company)} // Make sure this triggers the handleRowClick method
                           style={{ cursor: "pointer" }}
                        >
                           <td>{item.Stock}</td>
                           <td>{item.Company}</td>
                           <td>${parseFloat(item.Price)}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>

         </div>
      </>
   );
};

export default UserDashboard;
