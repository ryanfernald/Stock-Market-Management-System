import logo from './logo.svg';
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
        </Routes>
      </Router>
    </div>
  );
}

export default App;

