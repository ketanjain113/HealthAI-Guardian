import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './DoctorPanel.css';

// Chart component for simple line graph
function SimpleChart({ data, label, color }) {
  if (!data || data.length === 0) return null;
  
  const max = Math.max(...data);
  const width = 300;
  const height = 120;
  const pointSpacing = width / (data.length - 1);
  
  const points = data.map((val, i) => {
    const x = i * pointSpacing;
    const y = height - (val / max) * (height - 20);
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <div className="chart-container">
      <h4>{label}</h4>
      <svg width={width} height={height} className="chart-svg">
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" />
        {data.map((val, i) => (
          <circle key={i} cx={i * pointSpacing} cy={height - (val / max) * (height - 20)} r="4" fill={color} />
        ))}
      </svg>
      <div className="chart-values">
        {data.map((val, i) => (
          <span key={i}>{val}</span>
        ))}
      </div>
    </div>
  );
}

// Donut chart component
function DonutChart({ value, max, label, color }) {
  const percentage = (value / max) * 100;
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="donut-chart">
      <svg width="120" height="120" className="donut-svg">
        <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(100, 200, 255, 0.1)" strokeWidth="8" />
        <circle 
          cx="60" 
          cy="60" 
          r="45" 
          fill="none" 
          stroke={color} 
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
        />
        <text x="60" y="65" textAnchor="middle" className="donut-text">{percentage.toFixed(0)}%</text>
      </svg>
      <p className="donut-label">{label}</p>
    </div>
  );
}

// Mock data for demonstration
const mockStudents = [
  { id: 'S001', name: 'Aditya Kumar', age: 20, disease: 'Asthma', medication: 'Salbutamol', allergy: 'Penicillin', emergency: '9876543210', severity: 'High', lastCheckup: '2025-11-15' },
  { id: 'S002', name: 'Priya Singh', age: 19, disease: 'Diabetes', medication: 'Metformin', allergy: 'None', emergency: '9876543211', severity: 'Medium', lastCheckup: '2025-11-10' },
  { id: 'S003', name: 'Rohan Sharma', age: 21, disease: 'Heart Condition', medication: 'Aspirin', allergy: 'Sulfa drugs', emergency: '9876543212', severity: 'High', lastCheckup: '2025-11-18' },
  { id: 'S004', name: 'Neha Patel', age: 20, disease: 'Allergies', medication: 'Cetirizine', allergy: 'Shellfish, Nuts', emergency: '9876543213', severity: 'Low', lastCheckup: '2025-11-12' },
  { id: 'S005', name: 'Arjun Das', age: 22, disease: 'None', medication: 'None', allergy: 'None', emergency: '9876543214', severity: 'Low', lastCheckup: '2025-11-05' },
];

const mockMedicines = [
  { id: 'M001', name: 'Salbutamol Inhaler', stock: 15, required: true, requiredFor: ['Asthma'] },
  { id: 'M002', name: 'Metformin', stock: 8, required: true, requiredFor: ['Diabetes'] },
  { id: 'M003', name: 'Aspirin', stock: 5, required: true, requiredFor: ['Heart Condition'] },
  { id: 'M004', name: 'Cetirizine', stock: 20, required: false, requiredFor: ['Allergies'] },
  { id: 'M005', name: 'Paracetamol', stock: 3, required: false, requiredFor: ['Fever', 'Pain'] },
];

function StatCard({ icon, label, value, color }) {
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );
}

function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showAddMedicine, setShowAddMedicine] = useState(false);
  const [newMedicine, setNewMedicine] = useState({ name: '', stock: '', requiredFor: '' });

  const totalStudents = mockStudents.length;
  const chronicStudents = mockStudents.filter(s => s.disease !== 'None').length;
  const onMedication = mockStudents.filter(s => s.medication !== 'None').length;
  const emergencyCases = mockStudents.filter(s => s.severity === 'High').length;
  const lowStockMedicines = mockMedicines.filter(m => m.stock < 10).length;

  // Filter emergency students
  const asthmaStudents = mockStudents.filter(s => s.disease === 'Asthma');
  const heartStudents = mockStudents.filter(s => s.disease === 'Heart Condition');
  const allergyStudents = mockStudents.filter(s => s.allergy !== 'None');
  const highRiskStudents = mockStudents.filter(s => s.severity === 'High');

  const generateReport = (type) => {
    let reportContent = '';
    const date = new Date().toLocaleDateString();

    switch(type) {
      case 'disease':
        reportContent = `STUDENT DISEASE LIST REPORT\nDate: ${date}\n\n`;
        mockStudents.forEach(s => {
          reportContent += `ID: ${s.id} | Name: ${s.name} | Disease: ${s.disease}\n`;
        });
        break;
      case 'medicine':
        reportContent = `MEDICINE REQUIREMENT LIST\nDate: ${date}\n\n`;
        mockMedicines.forEach(m => {
          reportContent += `${m.name} - Stock: ${m.stock} | Required: ${m.required ? 'Yes' : 'No'}\n`;
        });
        break;
      case 'monthly':
        reportContent = `MONTHLY HEALTH MONITORING REPORT\nDate: ${date}\n\n`;
        reportContent += `Total Students: ${totalStudents}\n`;
        reportContent += `Chronic Disease Cases: ${chronicStudents}\n`;
        reportContent += `Students on Medication: ${onMedication}\n`;
        reportContent += `Emergency Cases: ${emergencyCases}\n`;
        break;
      case 'highrisk':
        reportContent = `HIGH-RISK STUDENT REPORT\nDate: ${date}\n\n`;
        highRiskStudents.forEach(s => {
          reportContent += `${s.name} (${s.id}) - Disease: ${s.disease} | Severity: ${s.severity}\n`;
        });
        break;
      default:
        return;
    }

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(reportContent));
    element.setAttribute('download', `report_${type}_${date}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="doctor-panel">
      {/* NAVBAR */}
      <nav className="doctor-navbar">
        <div className="navbar-brand">
          <div className="brand-icon">⚕️</div>
          <div className="brand-text">
            <div className="brand-title">HealthAI Guardian</div>
            <div className="brand-subtitle">Doctor Panel</div>
          </div>
        </div>
        <div className="navbar-tabs">
          <button 
            className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            🩺 Dashboard
          </button>
          <button 
            className={`nav-tab ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            📋 Students
          </button>
          <button 
            className={`nav-tab ${activeTab === 'medicines' ? 'active' : ''}`}
            onClick={() => setActiveTab('medicines')}
          >
            💊 Medicines
          </button>
          <button 
            className={`nav-tab ${activeTab === 'emergency' ? 'active' : ''}`}
            onClick={() => setActiveTab('emergency')}
          >
            ⚠️ Emergency
          </button>
          <button 
            className={`nav-tab ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            📄 Reports
          </button>
        </div>
        <Link to="/" className="logout-btn">← Back Home</Link>
      </nav>

      {/* CONTENT */}
      <div className="doctor-content">
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="tab-content">
            <div className="content-header">
              <h2>🩺 Doctor Dashboard</h2>
              <p>College Health Management System</p>
            </div>

            <div className="stats-grid">
              <StatCard icon="👥" label="Total Students" value={totalStudents} color="blue" />
              <StatCard icon="🏥" label="Chronic Diseases" value={chronicStudents} color="red" />
              <StatCard icon="💊" label="On Medication" value={onMedication} color="green" />
              <StatCard icon="🚨" label="Emergency Cases" value={emergencyCases} color="orange" />
              <StatCard icon="📅" label="Upcoming Checkups" value={5} color="purple" />
              <StatCard icon="⏰" label="Low Stock Medicines" value={lowStockMedicines} color="yellow" />
            </div>

            <div className="dashboard-grid">
              {/* Recent Checkups */}
              <div className="card">
                <h3>📅 Recent Checkups</h3>
                <div className="recent-list">
                  {mockStudents.slice(0, 3).map(s => (
                    <div key={s.id} className="recent-item">
                      <div className="recent-info">
                        <div className="recent-name">{s.name}</div>
                        <div className="recent-meta">{s.disease} • {s.lastCheckup}</div>
                      </div>
                      <div className={`severity-badge severity-${s.severity.toLowerCase()}`}>
                        {s.severity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="card">
                <h3>📊 Health Overview</h3>
                <div className="health-overview">
                  <div className="overview-item">
                    <div className="overview-label">Average Age</div>
                    <div className="overview-value">20.4 yrs</div>
                  </div>
                  <div className="overview-item">
                    <div className="overview-label">High Risk</div>
                    <div className="overview-value">{emergencyCases}</div>
                  </div>
                  <div className="overview-item">
                    <div className="overview-label">Allergies</div>
                    <div className="overview-value">{allergyStudents.length}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STUDENTS TAB */}
        {activeTab === 'students' && (
          <div className="tab-content">
            <div className="content-header">
              <h2>📋 Student Medical Records</h2>
              <input type="text" placeholder="Search students..." className="search-input" />
            </div>

            <div className="students-grid">
              {mockStudents.map(student => (
                <div key={student.id} className="student-card card">
                  <div className="student-header">
                    <div className="student-avatar">{student.name.charAt(0)}</div>
                    <div className="student-info">
                      <div className="student-name">{student.name}</div>
                      <div className="student-id">ID: {student.id}</div>
                    </div>
                    <div className={`severity-badge severity-${student.severity.toLowerCase()}`}>
                      {student.severity}
                    </div>
                  </div>

                  <div className="student-details">
                    <div className="detail-row">
                      <span className="label">Age:</span>
                      <span className="value">{student.age} years</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">🩺 Disease:</span>
                      <span className="value">{student.disease}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">💊 Medication:</span>
                      <span className="value">{student.medication}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">⚠️ Allergy:</span>
                      <span className="value">{student.allergy}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">📞 Emergency:</span>
                      <span className="value">{student.emergency}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">📅 Last Checkup:</span>
                      <span className="value">{student.lastCheckup}</span>
                    </div>
                  </div>

                  <div className="student-actions">
                    <button className="btn-small primary">Edit</button>
                    <button className="btn-small ghost">View Full</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MEDICINES TAB */}
        {activeTab === 'medicines' && (
          <div className="tab-content">
            <div className="content-header">
              <h2>💊 Medicine Availability System</h2>
              <button className="btn primary" onClick={() => setShowAddMedicine(!showAddMedicine)}>
                + Add Medicine
              </button>
            </div>

            {showAddMedicine && (
              <div className="card add-medicine-form">
                <h3>Add New Medicine</h3>
                <div className="form-group">
                  <input type="text" placeholder="Medicine Name" value={newMedicine.name} onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <input type="number" placeholder="Stock Quantity" value={newMedicine.stock} onChange={(e) => setNewMedicine({...newMedicine, stock: e.target.value})} />
                </div>
                <div className="form-group">
                  <input type="text" placeholder="Required For (disease)" value={newMedicine.requiredFor} onChange={(e) => setNewMedicine({...newMedicine, requiredFor: e.target.value})} />
                </div>
                <div className="form-actions">
                  <button className="btn primary">Save Medicine</button>
                  <button className="btn ghost" onClick={() => setShowAddMedicine(false)}>Cancel</button>
                </div>
              </div>
            )}

            <div className="medicines-grid">
              {mockMedicines.map(medicine => (
                <div key={medicine.id} className="medicine-card card">
                  <div className="medicine-header">
                    <div className="medicine-icon">💊</div>
                    <div className="medicine-name">{medicine.name}</div>
                  </div>

                  <div className="medicine-details">
                    <div className="detail-row">
                      <span className="label">Stock:</span>
                      <span className={`value stock-${medicine.stock < 10 ? 'low' : 'normal'}`}>
                        {medicine.stock} units
                        {medicine.stock < 10 && ' ⚠️'}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Required:</span>
                      <span className="value">{medicine.required ? '✅ Yes' : '❌ No'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">For:</span>
                      <span className="value">{medicine.requiredFor.join(', ')}</span>
                    </div>
                  </div>

                  <div className="medicine-actions">
                    <button className="btn-small primary">Edit</button>
                    <button className="btn-small ghost">View</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EMERGENCY TAB */}
        {activeTab === 'emergency' && (
          <div className="tab-content">
            <div className="content-header">
              <h2>⚠️ Emergency Alert System</h2>
              <p>Students requiring immediate attention</p>
            </div>

            <div className="emergency-grid">
              {/* Asthma Cases */}
              <div className="emergency-card card red">
                <h3>🫁 Asthma Cases</h3>
                <div className="emergency-count">{asthmaStudents.length}</div>
                <div className="emergency-list">
                  {asthmaStudents.map(s => (
                    <div key={s.id} className="emergency-item">
                      <div className="item-icon">🫁</div>
                      <div className="item-info">
                        <div className="item-name">{s.name}</div>
                        <div className="item-detail">{s.medication} • {s.emergency}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Heart Conditions */}
              <div className="emergency-card card blue">
                <h3>❤️ Heart Conditions</h3>
                <div className="emergency-count">{heartStudents.length}</div>
                <div className="emergency-list">
                  {heartStudents.map(s => (
                    <div key={s.id} className="emergency-item">
                      <div className="item-icon">❤️</div>
                      <div className="item-info">
                        <div className="item-name">{s.name}</div>
                        <div className="item-detail">{s.medication} • {s.emergency}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Severe Allergies */}
              <div className="emergency-card card orange">
                <h3>⚠️ Severe Allergies</h3>
                <div className="emergency-count">{allergyStudents.length}</div>
                <div className="emergency-list">
                  {allergyStudents.map(s => (
                    <div key={s.id} className="emergency-item">
                      <div className="item-icon">⚠️</div>
                      <div className="item-info">
                        <div className="item-name">{s.name}</div>
                        <div className="item-detail">{s.allergy}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* High Risk Students */}
              <div className="emergency-card card purple">
                <h3>🚨 High Risk Students</h3>
                <div className="emergency-count">{highRiskStudents.length}</div>
                <div className="emergency-list">
                  {highRiskStudents.map(s => (
                    <div key={s.id} className="emergency-item">
                      <div className="item-icon">🚨</div>
                      <div className="item-info">
                        <div className="item-name">{s.name}</div>
                        <div className="item-detail">{s.disease} • Requires immediate attention</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === 'reports' && (
          <div className="tab-content">
            <div className="content-header">
              <h2>📄 Reports</h2>
              <p>Generate and download health reports</p>
            </div>

            <div className="reports-grid">
              <div className="report-card card">
                <div className="report-icon">📋</div>
                <h3>Student Disease List</h3>
                <p>List of all students with their diseases and diagnoses</p>
                <button className="btn primary" onClick={() => generateReport('disease')}>
                  Download Report
                </button>
              </div>

              <div className="report-card card">
                <div className="report-icon">💊</div>
                <h3>Medicine Requirement</h3>
                <p>Complete medicine inventory and requirements</p>
                <button className="btn primary" onClick={() => generateReport('medicine')}>
                  Download Report
                </button>
              </div>

              <div className="report-card card">
                <div className="report-icon">📊</div>
                <h3>Monthly Health Report</h3>
                <p>Summary of health statistics for the month</p>
                <button className="btn primary" onClick={() => generateReport('monthly')}>
                  Download Report
                </button>
              </div>

              <div className="report-card card">
                <div className="report-icon">🚨</div>
                <h3>High Risk Students</h3>
                <p>Students requiring special attention and care</p>
                <button className="btn primary" onClick={() => generateReport('highrisk')}>
                  Download Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DoctorDashboard;
