import React, { useEffect, useState } from 'react';
import { database } from '../firbaseconfig.js';
import { ref, onValue } from "firebase/database";
import DatabaseMonitor from './DatabaseMonitor'; // Import DatabaseMonitor
import './styling/AdminDashboard.css'; // Import the new CSS file

const AdminDashboard = () => {
  const [serviceRequests, setServiceRequests] = useState([]);

  useEffect(() => {
    const serviceRef = ref(database, '/ServeReq/');
    onValue(serviceRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const requestsArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setServiceRequests(requestsArray);
      }
    });
  }, []);

  // Placeholder functions for each button action
  const handleInsertDelete = () => {
    console.log("Insert/Delete action");
    // Insert/Delete logic here
  };

  const handleCustomQuery = () => {
    console.log("Send Custom Query action");
    // Custom query logic here
  };

  const handleViewTableContent = () => {
    console.log("View Table Content action");
    // View table content logic here
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-title">Admin Dashboard</div>

      <div className="dashboard-content">
        {/* Side Panel with Buttons */}
        <div className="side-panel">
          <button onClick={handleInsertDelete}>Insert/Delete from Table</button>
          <button onClick={handleCustomQuery}>Send Custom Query</button>
          <button onClick={handleViewTableContent}>View Table Content</button>
        </div>

        {/* Left Side - Service Requests */}
        <div className="left-side">
          <div className="service-requests">
            <h2>Service Requests</h2>
            <ul>
              {serviceRequests.map(request => (
                <li key={request.id}>
                  <h3>{request.title}</h3>
                  <p><strong>Date:</strong> {request.date}</p>
                  <p><strong>Description:</strong> {request.desc}</p>
                  <p><strong>User ID:</strong> {request.userId}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Side - Database Performance */}
        <div className="right-side">
          <div className="database-performance">
            <DatabaseMonitor />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
