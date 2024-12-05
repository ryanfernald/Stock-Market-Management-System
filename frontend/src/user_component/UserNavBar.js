import React, { useState } from 'react';
import icon from "../assets/icon.png";
import { Link } from "react-router-dom";
import "./styling/UserNavBar.css";

const UserNavbar = () => {
   return (
      <div className="user-navbar">
         <div className="user-navbar-left">
            <div className="user-navbar-logo">
               <img src={icon} alt="Logo" />
            </div>
            <h3>Stonks Market</h3>
         </div>

         <div className="user-navbar-center">
         </div>

         <Link className="user-navbar-option" to="/dashboard">Dashboard</Link>
         
         <Link className="user-navbar-option" to="/news-logged-in">News</Link>

         <Link className="user-navbar-option" to="/settings">Settings</Link>
         
         <Link className="user-navbar-option" to="/service-request">Help</Link>
         
         <Link className="user-navbar-option" to="/">Logout</Link>
         
      </div>
   );
};

export default UserNavbar;