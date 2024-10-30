import UserNavbar from "./UserNavBar";
import UserTransaction from "./UserTransaction";
import "./styling/UserDashboard.css";
import React, { useState, useEffect } from "react";
import UserPaymentOption from "./UserPaymentOption";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const UserDashboard = () => {
   const [accountBalance, setAccountBalance] = useState(0);
   const [loading, setLoading] = useState(true);
   const [selectedAccountType, setSelectedAccountType] = useState("checking");
   const [accountTypes, setAccountTypes] = useState([]);

   const handleAccountTypeChange = (event) => {
      setSelectedAccountType(event.target.value);
   };

   useEffect(() => {
      // Fetch account types and balance logic
   }, [selectedAccountType]);

   // Hard-coded data for line chart
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

   return (
      <>
         <UserNavbar />
         <div className="dashboard">
            <div className="dashboard-header">
               <h3>user_name Welcome Back!</h3>

            </div>

            <div className="dashboard-content">
               <div className="action-card">
                  <h3>Quick Actions</h3>
                  <div className="action-buttons">
                     <UserPaymentOption title="Buy" action={() => (window.location.href = "/userpayment")} />
                     <UserPaymentOption title="Sell" />
                     <UserPaymentOption title="Deposit" />
                     <UserPaymentOption title="Withdraw" />
                  </div>
               </div>
               <div className="summary-card">
                  <h3>Balance Available</h3>
                  <p>{loading ? "Loading..." : `$${accountBalance}`}</p>
                  <button onClick={() => (window.location.href = "/userstatement")}>
                     View Details
                  </button>
               </div>

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
               <div className="transaction-card">
                  <h3>Transaction History</h3>
                  <UserTransaction id="001" amount="100" />
                  <UserTransaction id="002" amount="-230" />
                  <button onClick={() => (window.location.href = "/usertransactions")}>Details</button>
               </div>


            </div>
            <div>
               <div className="activity-card">
                  <h3>Watch List</h3>

               </div>

            </div>
            <div className="activity-card">
               <h3>Watch List</h3>
            </div>
         </div>
      </>
   );
};

export default UserDashboard;
