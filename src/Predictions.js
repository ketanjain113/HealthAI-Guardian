import React, { useState, useEffect } from 'react';
import './Predictions.css';

// small sparkline
const TrendChart = ({ data = [], stroke = '#00cfe8', width = 220, height = 48 }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d - min) / (max - min || 1)) * height;
    return `${x},${y}`;
  }).join(' ');
  const first = points.split(' ')[0];
  const rest = points.split(' ').slice(1).map(p => 'L ' + p).join(' ');
  const pathD = `M ${first} ${rest}`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="timeline-chart" preserveAspectRatio="none">
      <path d={pathD} stroke={stroke} strokeWidth="2" fill="none" className="trend-path" strokeLinecap="round" />
    </svg>
  );
};

function Dashboard(){
  const [user, setUser] = useState({
    name: 'User',
    gender: 'Not specified',
    age: 0,
    bloodGroup: 'Unknown',
    height: 0,
    weight: 0,
    roll: 'N/A',
    department: 'N/A',
    emergency: 'N/A',
    avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
    vitals: { hr: 75, spo2: 98, temp: 98.6 },
    lastScan: { name: 'No scans', status: 'N/A', date: new Date().toISOString() },
    testResults: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profileDraft, setProfileDraft] = useState({ weight: 0, height: 0, bloodGroup: '', emergency: '' });

  const userId = localStorage.getItem('userId') || '674a22e8c5f84d001d123456';

  useEffect(() => {
    // Defer to next tick to ensure functions are initialized
    setTimeout(() => { fetchDashboardData(); }, 0);
  }, []);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your health dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="dashboard-page">
        <div className="error-state">
          <p>Failed to load dashboard data</p>
          <button onClick={fetchDashboardData} className="primary">Retry</button>
        </div>
      </div>
    );
  }

  async function fetchDashboardData() {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/dashboard/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      const data = await response.json();
      const userData = {
        ...data,
        vitals: data.vitals || { hr: 75, spo2: 98, temp: 98.6 },
        conditions: data.conditions?.length > 0 ? data.conditions : [{ label: 'No conditions', severity: 'None' }],
        medicalHistory: data.medicalHistory?.length > 0 ? data.medicalHistory : ['No medical history recorded'],
        medications: data.medications?.length > 0 ? data.medications : [{ name: 'No medications', note: 'N/A' }],
        timeline: data.timeline || { hr: [], spo2: [], sleep: [], allergy: [] },
        lastScan: data.lastScan || { name: 'No scans', status: 'N/A', date: new Date().toISOString() },
        doctor: data.doctor || { name: 'Not assigned' },
        testResults: data.testResults || [],
        ai: data.ai || {}
      };
      setUser(userData);
      setProfileDraft({
        weight: userData.weight || 0,
        height: userData.height || 0,
        bloodGroup: userData.bloodGroup || 'Unknown',
        emergency: userData.emergency || ''
      });
      setError(null);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveProfileEdits() {
    try {
      const uid = localStorage.getItem('userId');
      if (!uid) { alert('Please login to edit profile.'); return; }
      const res = await fetch(`http://localhost:8080/api/dashboard/user/${uid}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileDraft)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to update profile');
      setEditing(false);
      await fetchDashboardData();
      alert('Profile updated.');
    } catch (e) {
      console.error('Profile update error:', e);
      alert(e.message || 'Unable to update profile');
    }
  }

  const saveLastScanToProfile = async () => {
    try {
      const uid = localStorage.getItem('userId');
      if (!uid) { alert('Please login to save scan results.'); return; }
      if (!user?.lastScan || !user.lastScan.name || !user.lastScan.status) { alert('No recent scan to save.'); return; }
      setSaving(true);
      const payload = {
        testType: user.lastScan.name,
        result: user.lastScan.status,
        confidence: 90,
        severity: /high|severe/i.test(user.lastScan.status) ? 'High' : (/moderate|medium/i.test(user.lastScan.status) ? 'Moderate' : 'Low'),
        details: { source: 'dashboard', savedAt: new Date().toISOString() }
      };
      const res = await fetch(`http://localhost:8080/api/dashboard/user/${uid}/test-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to save test result');
      await fetchDashboardData();
      alert('Scan saved to your profile.');
    } catch (e) {
      console.error('Save scan error:', e);
      alert(e.message || 'Unable to save scan');
    } finally {
      setSaving(false);
    }
  };

  return (
      <div className="dashboard-page">
        <div className="dashboard-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          {/* Profile */}
          <div className="card profile-card">
            <div className="profile-top">
              <img src={user.avatar} alt="avatar" className="profile-avatar" />
              <div className="profile-meta">
                <h2>{user.name}</h2>
                <div className="muted">{user.gender} • {user.age} yrs</div>
                {!editing ? (
                  <>
                    <div className="muted">Blood Group: <strong>{user.bloodGroup}</strong></div>
                    <div className="muted">{user.height} cm / {user.weight} kg</div>
                    <div className="muted">Roll No: {user.roll} • Dept: {user.department}</div>
                    <div className="muted">Emergency: {user.emergency}</div>
                  </>
                ) : (
                  <div className="edit-grid" style={{ display:'grid', gridTemplateColumns:'repeat(2, minmax(160px, 1fr))', gap:12, marginTop:8 }}>
                    <label style={{display:'grid', gap:6}}>
                      <span className="muted">Weight (kg)</span>
                      <input type="number" value={profileDraft.weight}
                        onChange={e=>setProfileDraft(p=>({...p, weight: Number(e.target.value)}))} />
                    </label>
                    <label style={{display:'grid', gap:6}}>
                      <span className="muted">Height (cm)</span>
                      <input type="number" value={profileDraft.height}
                        onChange={e=>setProfileDraft(p=>({...p, height: Number(e.target.value)}))} />
                    </label>
                    <label style={{display:'grid', gap:6}}>
                      <span className="muted">Blood Group</span>
                      <input type="text" value={profileDraft.bloodGroup}
                        onChange={e=>setProfileDraft(p=>({...p, bloodGroup: e.target.value}))} />
                    </label>
                    <label style={{display:'grid', gap:6}}>
                      <span className="muted">Emergency Contact</span>
                      <input type="text" value={profileDraft.emergency}
                        onChange={e=>setProfileDraft(p=>({...p, emergency: e.target.value}))} />
                    </label>
                  </div>
                )}
              </div>
            </div>
            <div className="profile-actions" style={{ marginTop: 10 }}>
              {!editing ? (
                <button className="primary" onClick={()=>setEditing(true)}>Edit Profile</button>
              ) : (
                <div style={{ display:'flex', gap:10 }}>
                  <button className="primary" onClick={saveProfileEdits}>Save</button>
                  <button className="ghost" onClick={()=>{ setEditing(false); setProfileDraft({
                    weight: user.weight || 0,
                    height: user.height || 0,
                    bloodGroup: user.bloodGroup || 'Unknown',
                    emergency: user.emergency || ''
                  }); }}>Cancel</button>
                </div>
              )}
            </div>
          </div>

          {/* Last Prediction */}
          <div className="card">
            <h3>Last Prediction</h3>
            <div className="last-scan">Disease: <strong>{user.lastScan?.name || 'N/A'}</strong></div>
            <div className="last-scan">Result: {user.lastScan?.status || 'N/A'}</div>
            <div className="last-scan">Date: {user.lastScan?.date ? (typeof user.lastScan.date === 'string' ? user.lastScan.date : new Date(user.lastScan.date).toLocaleString()) : 'N/A'}</div>
            <div className="card-actions" style={{ marginTop: 10 }}>
              <button className="primary" onClick={saveLastScanToProfile} disabled={saving}>
                {saving ? 'Saving…' : 'Save Last Scan to Profile'}
              </button>
            </div>
          </div>

          {/* Recent Test Results (latest 5) */}
          {user.testResults && user.testResults.length > 0 && (
            <div className="card">
              <h3>Recent Test Results</h3>
              <div className="test-list" style={{ display:'grid', gridTemplateColumns:'1fr', gap:10 }}>
                {user.testResults.slice(-3).reverse().map((test, i) => (
                  <div key={i} className="test-item" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, padding:'12px 14px', border:'1px solid #e5e7eb', borderRadius:10, background:'#fafbfc' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, flex:1 }}>
                      <span className="pill" style={{ background:'#f5f7ff', padding:'6px 12px', borderRadius:999, fontSize:12, fontWeight:600, color:'#3b5bfd' }}>{test.testType.toUpperCase()}</span>
                      <div className="test-result" style={{ fontSize:14, fontWeight:600, color:'#1f2937' }}>{test.result}</div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      {test.confidence !== undefined && (
                        <div className="test-confidence muted" style={{ fontSize:12 }}>{Number(test.confidence).toFixed(1)}%</div>
                      )}
                      <span className={`severity-badge ${test.severity?.toLowerCase()}`} style={{ fontSize:11, padding:'4px 8px', borderRadius:6 }}>{test.severity || 'N/A'}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="card-actions" style={{ marginTop: 10 }}>
                <button className="ghost" onClick={fetchDashboardData}>Refresh</button>
              </div>
            </div>
          )}

          {/* Minimal Vitals */}
          <div className="card">
            <h3>Vitals</h3>
            <div className="vitals-row">
              <div className="vcard"><div className="vicon">❤️</div><div className="vname">Heart Rate</div><div className="vval">{user.vitals.hr} BPM</div></div>
              <div className="vcard"><div className="vicon">🫁</div><div className="vname">Oxygen</div><div className="vval">{user.vitals.spo2}%</div></div>
              <div className="vcard"><div className="vicon">🌡</div><div className="vname">Temp</div><div className="vval">{user.vitals.temp}°F</div></div>
            </div>
          </div>
        </div>
      </div>
    );
}

export default Dashboard;