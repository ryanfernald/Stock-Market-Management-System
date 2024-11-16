
import './App.css';

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from './common_component/LandingPage';
import SignUp from './common_component/SignUp';
import Login from './common_component/Login';
import QandA from './common_component/QandA';
import AboutUs from './common_component/AboutUs';
import Contact from './common_component/Contact';
import News from './common_component/News';
import UserDashboard from './user_component/UserDashboard';
import NewsLoggedIn from './user_component/NewsLoggedIn';
import ServiceRequest from './user_component/ServiceRequest.js'
import DatabaseMonitor from './admin_coponent/DatabaseMonitor.js';
import AdminDashboard from './admin_coponent/AdminDashboard.js';
import UserBuy from './user_component/UserBuy.js';
import UserSell from './user_component/UserSell.js';
import AdminInsert from './admin_coponent/AdminTableManip.js';
import UserMoveMoney from './user_component/UserMoveMoney.js';
function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path='/' element={<LandingPage />} />
          <Route path='/signup' element={<SignUp />} />
          <Route path='/login' element={<Login />} />
          <Route path='/q&a' element={<QandA />} />
          <Route path='/about' element={<AboutUs />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/news' element={<News />} />


          {/* Need to be secured with login function*/}
          <Route path='/dashboard' element={<UserDashboard />} />
          <Route path='/news-logged-in' element={<NewsLoggedIn />} />
          <Route path='/service-request' element={<ServiceRequest />} />
          <Route path='/AdminDashboard' element={<AdminDashboard />} />
          <Route path='/DatabaseMonitor' element={<DatabaseMonitor />} />
          <Route path='/TableManip' element={<AdminInsert />} />
          <Route path='/userbuy' element={<UserBuy />} />
          <Route path='/usersell' element={<UserSell />} />
          <Route path='/usermovemoney' element={<UserMoveMoney />} />


        </Routes>
      </Router>
    </div>
  );
}

export default App;