// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Home from "./Home";
import SymptomChecker from "./SymptomChecker";
import Vitals from "./Vitals";          
import Dashboard from "./Predictions";
import EarlyDetection from "./EarlyDetection2";
import DoctorPanel from "./DoctorPanel";
import Login from "./Login";
import Signup from "./Signup";
import ChatBot from "./ChatBot";


export default function App() {
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const userName = typeof window !== 'undefined' ? localStorage.getItem('userName') : null;

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    window.location.href = '/';
  };

  return (
    <Router>
      {/* NAVBAR */}
      <nav style={styles.navbar}>
        <Link to="/" style={styles.logo}>HealthAI Guardian</Link>

        <div style={styles.navLinks}>
          <Link to="/" style={styles.link}>Home</Link>  
          <Link to="/symptom-checker" style={styles.link}>Symptom Checker</Link>
          <Link to="/vitals" style={styles.link}>Vitals</Link>
          <Link to="/dashboard" style={styles.link}>Dashboard</Link>
          <Link to="/early-detection" style={styles.link}>Early Detection</Link>
          <Link to="/doctor-panel" style={styles.link}>Doctor Panel</Link>
        </div>
        {userId ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: '#333', fontSize: 14 }}>Hi, {userName || 'User'}</span>
            <button onClick={handleLogout} style={styles.loginBtn}>Logout</button>
          </div>
        ) : (
          <Link to="/login" style={styles.loginBtn}>
            Login
          </Link>
        )}

      </nav>
      {/* ROUTES */}
      <Routes>
        <Route path="/" element={<Home />} />  {/* HOME = DASHBOARD */}
        <Route path="/symptom-checker" element={<SymptomChecker />} />
        <Route path="/vitals" element={<Vitals />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/early-detection/*" element={<EarlyDetection />} />
        <Route path="/doctor-panel" element={<DoctorPanel />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
      {/* Global ChatBot */}
      <ChatBot />
    </Router>
  );
}


/* -------- NAVBAR INLINE STYLES -------- */
const styles = {
  navbar: {
    padding: "20px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#fff",
    position: "sticky",
    top: 0,
    zIndex: 50,
    boxShadow: "0 2px 10px rgba(0,0,0,0.07)"
  },
  logo: {
    fontSize: "22px",
    fontWeight: 700,
    textDecoration: "none",
    color: "#000"
  },
  navLinks: {
    display: "flex",
    gap: "25px"
  },
  link: {
    textDecoration: "none",
    fontSize: "16px",
    color: "#333",
    fontWeight: 500
  },
  loginBtn: {
    background: "#00cfe8",
    color: "white",
    padding: "10px 22px",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block"
  }
};
