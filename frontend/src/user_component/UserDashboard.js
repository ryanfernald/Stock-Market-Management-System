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
            </div>
         </div>
      </>
   );
};

export default UserDashboard;
