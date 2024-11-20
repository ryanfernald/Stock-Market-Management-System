import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate instead of useHistory
import UserNavbar from "./UserNavBar";
import UserTransaction from "./UserTransaction";
import UserPaymentOption from "./UserPaymentOption";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

import appleHistory from "./holding test data/appl_history.json";
import msftHistory from "./holding test data/msft_history.json";
import googHistory from "./holding test data/goog_history.json";
import stockList from "./holding test data/stock_list.json";
import watchList from "./holding test data/watch_list.json";

import "./styling/UserDashboard.css";

const UserDashboard = () => {
   const [expandedRow, setExpandedRow] = useState(null);
   const calculateTotalValue = (quantity, currentPrice) => {
      return (quantity * currentPrice).toFixed(2);
   };
   const calculatePercentChange = (purchasePrice, currentPrice) => {
      return (((currentPrice - purchasePrice) / purchasePrice) * 100).toFixed(2);
   };
   const calculateDollarChange = (purchasePrice, currentPrice) => {
      return (currentPrice - purchasePrice).toFixed(2);
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

   const [balanceDetails, setBalanceDetails] = useState([{
      net_balance: 0,
      net_market_orders: 0,
      total_deposit: 0,
      total_withdraw: 0,
   }]);
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
            const response = await fetch(`http://127.0.0.1:5000/user_b/balance/${userId}`);
            if (!response.ok) {
               throw new Error(`Error fetching balance: ${response.statusText}`);
            }
            const balance = await response.json();
            setBalanceDetails(balance); // Update state with fetched data
            setLoading(false);
         } catch (error) {
            console.error("Failed to fetch user balance:", error);
            setLoading(false);
         }
      };


      fetchUserBalance();
   }, []);

   return (
      <>
         <UserNavbar />
         <div className="dashboard">
            <div className="dashboard-header">
               <h3>Welcome Back!</h3>
            </div>

            <div className="dashboard-content">
               {/* Balance Details */}
               <div className="summary-card">
                  <h3>Balance Details</h3>
                  {loading ? (
                     <p>Loading...</p>
                  ) : (
                     <div id="balance-details">
                        <p>Net Balance: ${balanceDetails.net_balance.toFixed(2)}</p>
                        <p>Total Deposits: ${balanceDetails.total_deposit.toFixed(2)}</p>
                        <p>Total Withdrawals: ${balanceDetails.total_withdraw.toFixed(2)}</p>
                        <p>Net Market Orders: ${balanceDetails.net_market_orders.toFixed(2)}</p>
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
                  <h3>Transaction History</h3>
                  <UserTransaction id="001" amount="100" />
                  <UserTransaction id="002" amount="-230" />
                  <button onClick={() => (window.location.href = "/usertransactions")}>Details</button>
               </div>

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
                        {stockList.map((row, index) => (
                           <React.Fragment key={index}>
                              <tr onClick={() => toggleRow(index)} style={{ cursor: "pointer" }}>
                                 <td>{row.Stock}</td>
                                 <td>{row["Quantity Shares"]}</td>
                                 <td>${row["Purchase Price"].toFixed(2)}</td>
                                 <td>${row["Current Price"].toFixed(2)}</td>
                                 <td>${calculateTotalValue(row["Quantity Shares"], row["Current Price"])}</td>
                                 <td className={calculatePercentChange(row["Purchase Price"], row["Current Price"]) >= 0 ? "text-positive" : "text-negative"}>
                                    {calculatePercentChange(row["Purchase Price"], row["Current Price"])}%
                                 </td>
                                 <td className={calculateDollarChange(row["Purchase Price"], row["Current Price"]) >= 0 ? "text-positive" : "text-negative"}>
                                    ${calculateDollarChange(row["Purchase Price"], row["Current Price"])}
                                 </td>
                              </tr>
                              {expandedRow === index && (
                                 <tr>
                                    <td colSpan="7" className="expanded-chart-container">
                                       <ResponsiveContainer width="100%" height={300}>
                                          <LineChart data={historyDataMap[row.Stock]} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                             <CartesianGrid strokeDasharray="3 3" />
                                             <XAxis dataKey="date" tickFormatter={formatTick} />
                                             <YAxis dataKey="Price" domain={[(dataMin) => Math.floor(dataMin * 0.99), 'auto']} />
                                             <Tooltip />
                                             <Line type="monotone" dataKey="Price" stroke="#8884d8" />
                                          </LineChart>
                                       </ResponsiveContainer>
                                    </td>
                                 </tr>
                              )}
                           </React.Fragment>
                        ))}
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
                              <td>${parseFloat(item.Price).toFixed(2)}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>

            </div>
         </div>




      </>
   );
};

export default UserDashboard;
