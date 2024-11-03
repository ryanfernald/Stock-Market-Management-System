import React, { useState } from 'react';
import { auth } from '../firbaseconfig.js';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

import './styling/Login.css';
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Navigation hook

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('User logged in successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error("Error logging in:", error);
      alert(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      alert(`Logged in as ${user.email}`);
      navigate('/dashboard');
    } catch (error) {
      console.error("Error logging in with Google:", error);
      alert(error.message);
    }
  };

  const handleSignUp = () => {
    navigate('/signup'); // Navigate to the sign-up page
  };

  return (
    <div>
      <Navbar />
      <div className="login-container">
        <div className="login-box">
          <h2>Login</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>Login</button>
          <button onClick={handleGoogleLogin}>
            <img src="https://img.icons8.com/color/16/000000/google-logo.png" alt="Google icon" />
            Log in with Google
          </button>

          {/* New Sign Up Section */}
          <p className="signup-text">Don't have an account?</p>
          <button className="signup-button" onClick={handleSignUp}>Sign Up</button>
        </div>
      </div>
    </div>
  );
}

export default Login;