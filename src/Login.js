import React, { useState } from "react";
import "./Login.css";
import Shield from "./assets/shield.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Store user data in localStorage
        if (data.userId) {
          localStorage.setItem('userId', data.userId);
        }
        if (data.name) {
          localStorage.setItem('userName', data.name);
        }
        // Redirect to home
        window.location.href = data.redirect || '/';
      } else {
        alert(data.message || 'Login failed');
      }

    } catch (error) {
      console.log("Login Error:", error);
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div className="login-wrapper">

      {/* LEFT SIDE */}
      <div className="left-section">
        <div className="login-card">
          <h2>Welcome Back</h2>
          <p className="subtitle">Log in to continue your health monitoring</p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email</label>
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input 
                type="password" 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button className="login-btn" type="submit">Login</button>

            <p className="login-text">
              Don’t have an account?{" "}
              <span onClick={() => (window.location.href = "/signup")}>
                Create one
              </span>
            </p>
          </form>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="right-section">
        <img src={Shield} alt="shield" className="shield-img" />
      </div>

    </div>
  );
}

export default Login;
