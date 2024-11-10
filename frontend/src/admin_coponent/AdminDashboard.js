import React, { useEffect, useState } from 'react';
import { database } from '../firbaseconfig.js';
import { ref, onValue } from "firebase/database";
import DatabaseMonitor from './DatabaseMonitor'; // Import DatabaseMonitor
import AdminNavbar from './admin_nav.js'; // Import Admin Navbar
import './styling/AdminDashboard.css'; // Import the new CSS file

const AdminDashboard = () => {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [searchOption, setSearchOption] = useState("user"); // Dropdown option
  const [searchQuery, setSearchQuery] = useState(""); // Search bar input

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

  // Handle dropdown selection change
  const handleOptionChange = (e) => {
    setSearchOption(e.target.value);
  };

  // Handle search input change
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Submit search
  const handleSearchSubmit = () => {
    if (searchOption === "user") {
      // Send request to backend to look up user-related information
      console.log("User search query:", searchQuery);
      // Add user search backend request here
    } else if (searchOption === "table") {
      // Send request to backend to look up table-related information
      console.log("Table search query:", searchQuery);
      // Add table search backend request here
    }
  };

  return (
    <div className="admin-dashboard">
      <AdminNavbar /> {/* Navbar at the top */}
      
      <div className="dashboard-header">
        <div className="dashboard-title">Admin Dashboard</div>
        
        {/* Search Bar and Dropdown */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchInputChange}
          />
          <select value={searchOption} onChange={handleOptionChange}>
            <option value="user">User</option>
            <option value="table">Table</option>
          </select>
          <button onClick={handleSearchSubmit}>Search</button>
        </div>
      </div>

      <div className="dashboard-content">
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
