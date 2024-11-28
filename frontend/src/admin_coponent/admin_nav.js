import React, { useState } from 'react';
import icon from "../assets/icon.png";
import { Link } from "react-router-dom";
import "./styling/admin_nav.css";

const AdminNavbar = () => {
   return (
      <div className="admin-navbar">
         <div className="admin-navbar-left">
            <div className="admin-navbar-logo">
               <img src={icon} alt="Logo" />
            </div>
            <h3>Stonks Market Admin Dashboard</h3>
         </div>

         <div className="admin-navbar-center">
         </div>

         
         <div className="admin-navbar-option">
            <Link to="/TableManip">Insert/Delete Tables</Link>
         </div>
         <div className="admin-navbar-option">
            <Link to="'/DBLogs'">DPLogs</Link>
         </div>
         
      </div>
   );
};

export default AdminNavbar;