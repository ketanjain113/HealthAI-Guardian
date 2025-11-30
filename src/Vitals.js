// src/Vitals.js
import React, { useEffect, useState, useRef } from "react";
import "./Vitals.css";

function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = null;
    const initial = 0;
    const diff = target - initial;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setValue(Math.round(initial + diff * progress));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

const Sparkline = ({ data = [], width = 500, height = 160, stroke = "#00cfe8" }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const len = data.length;
  const points = data.map((d, i) => {
    const x = (i / (len - 1)) * width;
    const y = height - ((d - min) / (max - min || 1)) * height;
    return `${x},${y}`;
  }).join(" ");

  const pathD = `M ${points.split(' ')[0]} ${points.split(' ').slice(1).map(p => 'L ' + p).join(' ')}`;
  // simple area path
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" preserveAspectRatio="none" className="sparkline">
      <defs>
        <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#00cfe8" stopOpacity="0.03" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#areaGrad)" />
      <path d={pathD} fill="none" stroke={stroke} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="sparkline-path" />
    </svg>
  );
};

export default function Vitals() {
  // mock wearable data (would be connected via web-sockets/api in real app)
  const [steps, setSteps] = useState(7882);
  const [hr, setHr] = useState(78);
  const [bp, setBp] = useState({ sys: 116, dia: 76 });
  const [weight, setWeight] = useState(164);
  // bluetooth pairing state
  const [btDeviceName, setBtDeviceName] = useState(null);
  const [btSyncing, setBtSyncing] = useState(false);
  const [btError, setBtError] = useState(null);

  // sample trend data for graph (last 30 days)
  const [trend] = useState(() => {
    const base = 60;
    return Array.from({ length: 30 }, (_, i) => Math.round(base + Math.sin(i / 3) * 8 + Math.random() * 6));
  });

  const stepsCount = useCountUp(steps, 1000);
  const hrCount = useCountUp(hr, 800);

  // animate small wearable updates to feel alive
  useEffect(() => {
    const t = setInterval(() => {
      setHr((h) => Math.max(56, Math.min(110, h + (Math.random() > 0.6 ? 1 : -1))));
      setSteps((s) => s + Math.round(Math.random() * 10));
    }, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="vitals-page">
      <header className="vitals-header">
        <div>
          <h1 style={{ marginLeft: "150px", marginRight: "-100px", fontSize:"80px"}}>Vitals</h1>
          <p className="subtitle" style={{marginLeft:"150px", marginRight: "-100px"}}>Live health metrics from your wearable — steps, heart rate, blood pressure, and trends.</p>
        </div>
        <div className="header-actions">
          <button
            className="ghost"
            onClick={async () => {
              if (btSyncing) return; // prevent double clicks
              setBtError(null);
              if (!navigator.bluetooth) {
                setBtError('Bluetooth not supported in this browser');
                return;
              }
              try {
                setBtSyncing(true);
                // Request any device (or filter for heart rate/battery services)
                const device = await navigator.bluetooth.requestDevice({
                  acceptAllDevices: true,
                  optionalServices: ['battery_service', 'heart_rate']
                });
                setBtDeviceName(device.name || 'Unnamed Device');
                // Attempt GATT connection to confirm pairing
                try {
                  const server = await device.gatt.connect();
                  // Optionally read battery or heart rate service if present
                  // (We keep lightweight to avoid permission issues)
                  server.disconnect();
                } catch (gattErr) {
                  // Non-critical; some devices require explicit service selection
                }
              } catch (err) {
                if (err && err.name === 'NotFoundError') {
                  setBtError('No device selected');
                } else if (err && err.name === 'SecurityError') {
                  setBtError('Requires secure context (HTTPS or localhost)');
                } else {
                  setBtError(err.message || 'Bluetooth pairing failed');
                }
              } finally {
                setBtSyncing(false);
              }
            }}
          >
            {btSyncing ? 'Connecting…' : btDeviceName ? `Synced: ${btDeviceName}` : 'Sync device'}
          </button>
          <button className="primary">Export</button>
        </div>
      </header>
      { (btError || btDeviceName) && (
        <div className="bt-status">
          {btDeviceName && !btError && <span className="bt-ok">Paired with: <strong>{btDeviceName}</strong></span>}
          {btError && <span className="bt-err">{btError}</span>}
        </div>
      ) }

      <div className="vitals-container">
        <main className="vitals-main">
        <section className="left-col">
          <div className="cards-grid">
            <div className="card steps-card">
              <div className="card-head">Steps taken</div>
              <div className="card-body">
                <div className="steps-visual">
                  <svg className="steps-ring" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="48" className="ring-bg" />
                    <circle cx="60" cy="60" r="48" className="ring-fg" style={{ strokeDasharray: `${Math.min(1, steps / 10000) * 302} 302` }} />
                    <text x="50%" y="54%" textAnchor="middle" className="ring-text">{stepsCount}</text>
                  </svg>
                </div>
                <div className="card-meta">Goal: 10,000 • Active 7,882 steps today</div>
              </div>
            </div>

            <div className="card hr-card">
              <div className="card-head">Heart rate</div>
              <div className="card-body">
                <div className="big-value">{hrCount} <span className="muted">bpm</span></div>
                <div className="mini-note">Resting: 64 bpm • Variability normal</div>
              </div>
            </div>

            <div className="card bp-card">
              <div className="card-head">Blood pressure</div>
              <div className="card-body">
                <div className="bp-values"><strong>{bp.sys}</strong>/<span>{bp.dia}</span> <span className="muted">mmHg</span></div>
                <div className="mini-note">Last sync: 2h ago</div>
              </div>
            </div>

            <div className="card weight-card">
              <div className="card-head">Weight</div>
              <div className="card-body">
                <div className="big-value">{weight} <span className="muted">lbs</span></div>
                <div className="mini-note">Trend: stable</div>
              </div>
            </div>
          </div>
        </section>

        <section className="right-col">
          <div className="chart-card">
            <div className="chart-head">
              <div>
                <div className="chart-title">Heart rate — last 30 days</div>
                <div className="chart-sub">Daily average (bpm)</div>
              </div>
              <div className="chart-actions">
                <button className="ghost">7d</button>
                <button className="ghost active">30d</button>
                <button className="ghost">90d</button>
              </div>
            </div>
            <div className="chart-body">
              <Sparkline data={trend} width={820} height={220} />
            </div>
          </div>

          <div className="insights-row">
            <div className="insight-card">
              <div className="insight-title">Activity</div>
              <div className="insight-body">You were most active on Tuesday. Keep up the momentum — aim for two brisk walks this week.</div>
            </div>
            <div className="insight-card">
              <div className="insight-title">Tips</div>
              <div className="insight-body">Maintain hydration and rest — sudden HR spikes may be caused by caffeine or stress.</div>
            </div>
          </div>
        </section>
        </main>
      </div>
    </div>
  );
}
