import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firbaseconfig.js';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import Lottie from 'lottie-react';
import animation from "../assets/upload_cloud.json";
import Navbar from './Navbar';
import './styling/SignUp.css';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  // Sign-up handler function
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    

    try {
      // Firebase authentication (create user)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Insert user into SQL database
      await insertUserIntoDatabase(user.uid, email, firstName, lastName);

      // Navigate to the user dashboard on success
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    }
  };

  // Google Sign-in handler function
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Insert Google user into SQL database
      await insertUserIntoDatabase(user.uid, user.email, 'First', 'Last'); // default names for Google sign-in

      // Navigate to the user dashboard on success
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    }
  };

  // Function to call the backend API for inserting user into SQL database
  const insertUserIntoDatabase = async (uid, email, firstName, lastName) => {
    try {
      // Setup the request options
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: uid,  // Firebase UID
          email: email,
          first_name: firstName,
          last_name: lastName,
        }),
      };

      // Fetch call to the backend API
      const response = await fetch(process.env.REACT_APP_API_BASE_URL+"/user_m/insertUser", requestOptions);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Error inserting user into database');
      }

    } catch (error) {
      // Handle any errors that occur during the API request
      setError('Failed to sync with the database: ' + error.message);
      throw error;  // Re-throw error so the UI shows the message
    }
  };

  return (
    <div>
      <Navbar />
      <div className="main-content">
        <div className="signup-box">
          <Lottie animationData={animation} className="signup-animation" />
          <h2>Create your account</h2>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleSignUp}>
            <div className="form-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {/* First Name and Last Name inputs */}
            <div className="form-group">
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="signup-button">Sign Up</button>
          </form>
          <button onClick={handleGoogleSignIn} className="google-button">
            <img src="https://img.icons8.com/color/16/000000/google-logo.png" alt="Google icon" />
            Sign up with Google
          </button>
          <p> Already have an account? </p>
          <button className="login-link" onClick={handleLogin}> Login </button>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
