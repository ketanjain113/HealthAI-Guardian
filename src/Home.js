import React from "react";
import "./App.css";
import Stethoscope from "./assets/stethoscope.png";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="homepage">

      {/* HERO */}
      <section className="hero">
        <div className="hero-left">
          <h1 style={{ fontSize: "50px", paddingLeft: "30px" }}>
            AI-Powered <br /> Preventive Health Monitoring
          </h1>

          <p style={{ fontSize: "18px", paddingLeft: "30px" }}>
            Intelligent system helps you monitor your health, track vital signs,
            detect potential issues early, and receive personalized health
            advice.
          </p>

          <div className="hero-buttons" style={{ paddingLeft: "30px" }}>
            <Link to="/symptom-checker">
              <button className="primary-btn">Get Started</button>
            </Link>
          </div>
        </div>
        <div className="hero-right">
          <img src={Stethoscope} alt="stethoscope" className="hero-stethoscope" />
        </div>
      </section>

      {/* FEATURE CARDS */}
      <section className="features">
        <div className="feature-card">
          <div className="icon-circle">🩺</div>
          <h3>Symptom Checker</h3>
          <p>Assess your symptoms and get guidance.</p>
        </div>

        <div className="feature-card">
          <div className="icon-circle">💗</div>
          <h3>Vitals</h3>
          <p>Track your heart-rate, steps, and more.</p>
        </div>

        <div className="feature-card">
          <div className="icon-circle">📊</div>
          <h3>Predictions</h3>
          <p>Understand your health risks proactively.</p>
        </div>

        <div className="feature-card">
          <div className="icon-circle">🧩</div>
          <h3>Health Plan</h3>
          <p>Get a personalized plan for your well-being.</p>
        </div>
      </section>
    </div>
  );
}

export default Home;
