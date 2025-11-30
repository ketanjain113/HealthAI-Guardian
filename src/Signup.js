import React, { useState } from "react";
import "./Signup.css";
import Shield from "./assets/shield.png";

function Signup() {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    gender: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8080/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
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
        alert(data.message || 'Signup failed');
      }

    } catch (error) {
      console.log("Signup Error:", error);
      alert('Signup failed. Please try again.');
    }
  };

  return (
    <div className="signup-wrapper">

      <div className="left-section fade-in">
        <div className="signup-card slide-up">

          <h2>Create Account</h2>
          <p className="subtitle">Start your preventive health journey</p>

          <form onSubmit={handleSubmit}>

            <div className="input-group">
              <label>Name</label>
              <input type="text" name="name" placeholder="Enter your name"
                required onChange={handleChange} />
            </div>

            <div className="input-group">
              <label>Email</label>
              <input type="email" name="email" placeholder="Enter your email"
                required onChange={handleChange} />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input type="password" name="password" placeholder="Enter your password"
                required onChange={handleChange} />
            </div>

            <div className="input-group">
              <label>Age</label>
              <input type="number" name="age" placeholder="Enter your age"
                required onChange={handleChange} />
            </div>

            <div className="input-group">
              <label>Gender</label>
              <select name="gender" required onChange={handleChange}>
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <button className="signup-btn ripple" type="submit">
              Sign Up
            </button>

            <p className="signup-text">
              Already have an account?{" "}
              <span onClick={() => (window.location.href = "/login")}>Login</span>
            </p>

          </form>

        </div>
      </div>

      <div className="right-section">
        <div className="shield-glow"></div>
        <img src={Shield} alt="shield" className="shield-img float-anim" />
      </div>

    </div>
  );
}

export default Signup;
