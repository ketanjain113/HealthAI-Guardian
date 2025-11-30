import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import './EarlyDetection.css';

const diseases = [
  { key: 'heart', title: "Heart Disease", icon: '❤️', desc: 'Detect arrhythmia, cardiac risk', type: 'heart' },
  { key: 'parkinsons', title: "Parkinson's", icon: '🧠', desc: 'Early-stage tremor + neuro prediction', type: 'brain' },
  { key: 'lung', title: "Lung Disease", icon: '🫁', desc: 'Detect pneumonia, fibrosis, abnormalities', type: 'lungs' },
  { key: 'alzheimers', title: "Alzheimer's", icon: '🧠', desc: 'Early cognitive decline detection', type: 'brain' },
  { key: 'tumor', title: "Tumor Detection", icon: '🎗', desc: 'AI tumor spotting on scans', type: 'tumor' },
  { key: 'thyroid', title: "Thyroid Disease", icon: '🦋', desc: 'Detect hyper/hypothyroidism patterns', type: 'gland' },
  { key: 'diarrhea', title: "Diarrhea Detection", icon: '💧', desc: 'Analyze patterns & dehydration risk', type: 'stomach' },
  { key: 'stress', title: "Stress Analysis", icon: '😰', desc: 'Detect burnout, anxiety from vitals', type: 'waves' }
];

const SmallTrend = ({ data = [], color = '#00cfe8', width = 180, height = 40 }) => {
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
  const d = `M ${first} ${rest}`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="ed-small-trend">
      <path d={d} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
};

function Hero({ onStart }) {
  return (
    <section className="ed-hero card">
      <div className="hero-left">
        <h1>AI-Powered Disease Detection</h1>
        <p className="muted">Upload CT/MRI, reports, symptoms and let HealthAI Guardian analyze signs of chronic conditions early.</p>
        <div className="hero-actions">
          <button className="primary" onClick={onStart}>Start Detection</button>
          <Link to="/" className="ghost">Back Home</Link>
        </div>
        <div className="hero-notes muted">Supports DICOM, PNG, JPG, PDF, audio and CSV logs.</div>
      </div>
      <div className="hero-right">
        <div className="shield-3d modern-3d">
          <div className="shield-core"></div>
          <div className="scan-beam" />
        </div>
      </div>
    </section>
  );
}

function DiseaseCard({ disease, onClick }) {
  const [trend] = useState([10, 12, 8, 14, 11, 15, 13]);
  const iconColorMap = {
    heart: '#ff6464',
    brain: '#c864ff',
    lungs: '#64c8ff',
    tumor: '#ffc864',
    gland: '#64ff96',
    stomach: '#ff9f64',
    waves: '#64aeff'
  };
  const color = iconColorMap[disease.type] || '#64c8ff';

  return (
    <div className="disease-card" onClick={onClick}>
      <div className="disease-icon">{disease.icon}</div>
      <h3>{disease.title}</h3>
      <p>{disease.desc}</p>
      <div className="disease-trend">
        <SmallTrend data={trend} color={color} />
      </div>
      <button className="disease-cta">Analyze</button>
    </div>
  );
}

function DiseaseSelector({ onSelect }) {
  return (
    <section className="ed-diseases">
      <h2>Select Disease to Analyze</h2>
      <p className="muted">Choose a condition for AI-powered early detection</p>
      <div className="diseases-grid">
        {diseases.map(d => <DiseaseCard key={d.key} disease={d} onClick={() => onSelect(d)} />)}
      </div>
    </section>
  );
}

function DiseaseAnalyzer({ disease }) {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [notes, setNotes] = useState('');
  const [extra, setExtra] = useState({ history: '', vital: '', scan: '' });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const onFile = (field, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (field === 'image') setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderDiseaseSpecific = () => {
    const inputs = {
      heart: (
        <>
          <label>Heart Rate (bpm)</label>
          <input type="number" placeholder="e.g. 75" onChange={(e) => setExtra({ ...extra, vital: e.target.value })} />
          <label>Blood Pressure</label>
          <input type="text" placeholder="120/80" onChange={(e) => setExtra({ ...extra, vital: e.target.value })} />
        </>
      ),
      brain: (
        <>
          <label>Tremor Severity (1-10)</label>
          <input type="range" min="1" max="10" onChange={(e) => setExtra({ ...extra, vital: e.target.value })} />
          <label>Cognitive Test Score</label>
          <input type="number" placeholder="0-30" onChange={(e) => setExtra({ ...extra, vital: e.target.value })} />
        </>
      ),
      lungs: (
        <>
          <label>Respiratory Rate (breaths/min)</label>
          <input type="number" placeholder="e.g. 16" onChange={(e) => setExtra({ ...extra, vital: e.target.value })} />
          <label>Oxygen Saturation (%)</label>
          <input type="number" placeholder="e.g. 98" onChange={(e) => setExtra({ ...extra, vital: e.target.value })} />
        </>
      ),
      tumor: (
        <>
          <label>Scan Type</label>
          <select onChange={(e) => setExtra({ ...extra, scan: e.target.value })}>
            <option>CT Scan</option>
            <option>MRI</option>
            <option>X-Ray</option>
          </select>
          <label>Tumor Location (if known)</label>
          <input type="text" placeholder="e.g. Right lung" onChange={(e) => setExtra({ ...extra, vital: e.target.value })} />
        </>
      ),
      gland: (
        <>
          <label>TSH Level (mIU/L)</label>
          <input type="number" placeholder="0.5-5.0" onChange={(e) => setExtra({ ...extra, vital: e.target.value })} />
          <label>T4 Level (ng/dL)</label>
          <input type="number" placeholder="5.0-12.0" onChange={(e) => setExtra({ ...extra, vital: e.target.value })} />
        </>
      ),
      stomach: (
        <>
          <label>Frequency (times/day)</label>
          <input type="number" placeholder="1-10" onChange={(e) => setExtra({ ...extra, vital: e.target.value })} />
          <label>Duration (days)</label>
          <input type="number" placeholder="1-30" onChange={(e) => setExtra({ ...extra, vital: e.target.value })} />
        </>
      ),
      waves: (
        <>
          <label>Stress Level (1-10)</label>
          <input type="range" min="1" max="10" onChange={(e) => setExtra({ ...extra, vital: e.target.value })} />
          <label>Sleep Hours</label>
          <input type="number" placeholder="0-12" onChange={(e) => setExtra({ ...extra, vital: e.target.value })} />
        </>
      )
    };
    return inputs[disease.type] || null;
  };

  const run = async () => {
    setLoading(true);
    // Simulate AI analysis
    await new Promise(r => setTimeout(r, 2000));
    setResults({
      riskLevel: Math.random() > 0.5 ? 'High' : Math.random() > 0.5 ? 'Medium' : 'Low',
      confidence: (Math.random() * 30 + 70).toFixed(1),
      recommendations: [
        `Consult a ${disease.type === 'heart' ? 'Cardiologist' : disease.type === 'brain' ? 'Neurologist' : disease.type === 'lungs' ? 'Pulmonologist' : 'Specialist'}`,
        'Perform regular checkups',
        'Maintain a healthy lifestyle',
        'Monitor symptoms closely'
      ]
    });
    setLoading(false);
  };

  return (
    <section className="ed-analyzer card">
      <div className="analyzer-header">
        <h2>{disease.icon} {disease.title} Analysis</h2>
        <button className="ghost" onClick={() => navigate('/early-detection')}>← Back</button>
      </div>

      {!results ? (
        <>
          <div className="upload-area">
            <div className="upload-column">
              <label>Upload Medical Image</label>
              <div className="file-drop" onClick={() => document.getElementById('img-input').click()}>
                {image ? <img src={image} alt="preview" style={{ width: '100%', borderRadius: '8px' }} /> : (
                  <>
                    <div className="drop-icon">📷</div>
                    <p>Drop CT/MRI scan or click to upload</p>
                  </>
                )}
              </div>
              <input id="img-input" type="file" hidden onChange={(e) => onFile('image', e)} />
              <label>Upload Report (PDF / PNG)</label>
              <input type="file" onChange={(e) => onFile('report', e)} />
              {renderDiseaseSpecific()}
            </div>
            <div className="upload-column">
              <label>Enter Symptoms</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Describe symptoms..." />
              <label>Medical History</label>
              <textarea onChange={e => setExtra({ ...extra, history: e.target.value })} placeholder="Past medical conditions, medications..." />
            </div>
          </div>
          <div className="upload-actions">
            <button className="primary" onClick={run} disabled={loading}>
              {loading ? '⏳ Analyzing...' : '🚀 Run AI Detection'}
            </button>
            <Link className="ghost" to="/early-detection">Cancel</Link>
          </div>
        </>
      ) : (
        <div className="results-panel">
          <div className={`risk-badge risk-${results.riskLevel.toLowerCase()}`}>
            <span className="risk-label">{results.riskLevel} Risk</span>
            <span className="confidence">{results.confidence}% confident</span>
          </div>
          <div className="recommendations">
            <h3>📋 Recommendations</h3>
            <ul>
              {results.recommendations.map((r, i) => <li key={i}>✓ {r}</li>)}
            </ul>
          </div>
          <div className="result-actions">
            <button className="primary" onClick={() => { setResults(null); navigate('/early-detection'); }}>New Analysis</button>
            <button className="ghost">📥 Download Report</button>
          </div>
        </div>
      )}
    </section>
  );
}

export default function EarlyDetection() {
  const { diseaseKey } = useParams();
  const selectedDisease = diseases.find(d => d.key === diseaseKey);

  return (
    <div className="early-detection">
      {!selectedDisease ? (
        <Routes>
          <Route path="/" element={
            <>
              <Hero onStart={() => {}} />
              <DiseaseSelector onSelect={(d) => window.location.href = `/early-detection/${d.key}`} />
            </>
          } />
        </Routes>
      ) : (
        <DiseaseAnalyzer disease={selectedDisease} />
      )}
    </div>
  );
}
