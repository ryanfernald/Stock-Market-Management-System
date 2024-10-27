import React, { useState } from 'react';
import { auth } from '../firbaseconfig.js';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Email/Password login handler
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('User logged in successfully');
    } catch (error) {
      console.error("Error logging in:", error);
      alert(error.message);
    }
  };

  // Google login handler
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      alert(`Logged in as ${user.email}`);
    } catch (error) {
      console.error("Error logging in with Google:", error);
      alert(error.message);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {/* Email/Password login */}
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

      {/* Google login */}
      <p>or</p>
      <button onClick={handleGoogleLogin}>
        <img src="https://img.icons8.com/color/16/000000/google-logo.png" alt="Google icon" />
        Log in with Google
      </button>
    </div>
  );
}

export default Login;