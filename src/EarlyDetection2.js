import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import './EarlyDetection.css';

const diseases = [
  { key: 'parkinsons', title: "Parkinson's", icon: '🧠', emoji: '🤝', desc: 'Early-stage tremor + neuro prediction', type: 'brain', detail: 'Tremor, rigidity, bradykinesia, voice changes' },
  { key: 'tumor', title: "Tumor Detection", icon: '🎗', emoji: '⚠️', desc: 'AI tumor spotting on scans', type: 'tumor', detail: 'Abnormal growths, mass detection on imaging' },
  { key: 'alzheimers', title: "Alzheimer's", icon: '🧠', emoji: '🧩', desc: 'Early cognitive decline detection', type: 'brain', detail: 'Memory loss, confusion, disorientation' },
  { key: 'heart', title: "Heart Disease", icon: '❤️', emoji: '💓', desc: 'Detect arrhythmia, cardiac risk', type: 'heart', detail: 'ECG abnormalities, chest pain, arrhythmia' },
  { key: 'lung', title: "Lung Disease", icon: '🫁', emoji: '💨', desc: 'Detect pneumonia, fibrosis, abnormalities', type: 'lungs', detail: 'Cough, shortness of breath, chest pain' },
  { key: 'thyroid', title: "Thyroid Disease", icon: '🦋', emoji: '🔷', desc: 'Detect hyper/hypothyroidism patterns', type: 'gland', detail: 'Weight changes, fatigue, temperature sensitivity' },
  { key: 'diarrhea', title: "Diarrhea Detection", icon: '💧', emoji: '🩹', desc: 'Analyze patterns & dehydration risk', type: 'stomach', detail: 'Loose stools, abdominal pain, dehydration' },
  { key: 'stress', title: "Stress Analysis", icon: '😰', emoji: '⚡', desc: 'Detect burnout, anxiety from vitals', type: 'waves', detail: 'Heart rate variability, cortisol patterns' }
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

function Hero({ onStart }){
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
          <div className="shield-core">🔰</div>
          <div className="scan-beam" />
        </div>
        <div className="floating-icons">{['❤️','🧠','🫁','🎗','🧬'].map((i,idx)=>(<span key={idx} className={`float-icon f${idx}`}>{i}</span>))}</div>
      </div>
    </section>
  );
}

function DiseaseGrid(){
  return (
    <section className="disease-grid">
      {diseases.map((d, idx) => (
        <div className="disease-card card" key={d.key}>
          {idx >= 3 && <span className="coming-soon-badge">Coming Soon</span>}
          <div className={`d-3d d-3d-${d.type}`} aria-hidden>
            <div className="d-3d-inner">
              <div className="d-icon-main">{d.icon}</div>
              <div className="d-icon-secondary">{d.emoji}</div>
            </div>
          </div>
          <div className="d-title">{d.title}</div>
          <div className="d-desc">{d.desc}</div>
          <div className="d-detail" style={{fontSize: '12px', color: '#666', marginBottom: '10px'}}>{d.detail}</div>
          <div className="d-actions">
            <Link className="primary small" to={`/early-detection/${d.key}`}>Analyze This Disease →</Link>
            <button className="ghost small" onClick={()=>document.getElementById(`info-${d.key}`)?.classList.add('open')}>Info</button>
          </div>

          <div id={`info-${d.key}`} className="disease-info-modal">
            <div className="modal-card">
              <h4>{d.title} — Details</h4>
              <p><strong>Description:</strong> {d.desc}</p>
              <p><strong>Symptoms:</strong> {d.detail}</p>
              <p className="muted">Upload medical images (CT, MRI, X-ray), reports, and describe your symptoms for analysis.</p>
              <div className="modal-actions"><button className="ghost" onClick={()=>document.getElementById(`info-${d.key}`)?.classList.remove('open')}>Close</button></div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

function DiseasePage(){
  const { disease } = useParams();
  const navigate = useNavigate();
  const info = diseases.find(d => d.key === disease) || {};
  const [files, setFiles] = useState({});
  const [notes, setNotes] = useState('');
  const [extra, setExtra] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // Alzheimer inline result

  const onFile = (key, e) => setFiles(f => ({...f, [key]: e.target.files[0]}));
  
  const run = async () => {
    if (['alzheimers','tumor','parkinsons'].includes(disease)) {
      if (disease === 'tumor') {
        if (!(files.scan || files.mri)) {
          setError('Please upload a scan image');
          return;
        }
      } else if (disease === 'alzheimers') {
        if (!files.mri) {
          setError('Please upload an MRI image');
          return;
        }
      } else if (disease === 'parkinsons') {
        if (!files.hand) {
          setError('Please upload a handwriting sample');
          return;
        }
      }
      setLoading(true);
      setError('');
      setResult(null);
      try {
        const formData = new FormData();
        // For tumor we used key 'scan'; reuse whichever exists
        let fileObj;
        if (disease === 'tumor') fileObj = (files.scan || files.mri);
        else if (disease === 'alzheimers') fileObj = files.mri;
        else if (disease === 'parkinsons') fileObj = files.hand;
        formData.append('image', fileObj);
        let endpoint = 'http://localhost:8080/api/predict/alzheimer';
        if (disease === 'tumor') endpoint = 'http://localhost:8080/api/predict/tumor';
        else if (disease === 'parkinsons') endpoint = 'http://localhost:8080/api/predict/parkinsons';
        const userId = localStorage.getItem('userId');
        const response = await fetch(endpoint, { 
          method: 'POST', 
          headers: userId ? { 'x-user-id': userId } : {},
          body: formData 
        });
        if (!response.ok) throw new Error('Prediction failed');
        const data = await response.json();
        // Determine severity from class label
        const cls = data.class || '';
        let severity;
        if (disease === 'alzheimers') {
          if (/Non Demented/i.test(cls)) severity = 'Low';
          else if (/Very Mild|Mild/i.test(cls)) severity = 'Moderate';
          else severity = 'High';
        } else if (disease === 'tumor') {
          if (/No Tumor/i.test(cls)) severity = 'Low';
          else severity = 'High';
        } else if (disease === 'parkinsons') {
          if (/No Parkinson/i.test(cls)) severity = 'Low';
          else severity = 'High';
        }
        setResult({ confidence: data.confidence, class: cls, severity });
      } catch (err) {
        console.error('Prediction error:', err);
        setError('Failed to analyze image. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      navigate(`/early-detection/${disease}/analysis`, { state: { disease, files, notes, extra } });
    }
  };

  const renderDiseaseSpecific = () => {
    switch(disease){
      case 'heart':
        return (
          <>
            <label>Upload ECG image / ECG CSV</label>
            <input type="file" onChange={(e)=>onFile('ecg', e)} />
            <label>Upload Cholesterol report</label>
            <input type="file" onChange={(e)=>onFile('chol', e)} />
            <label>Enter chest pain / palpitations details</label>
            <textarea onChange={e=>setExtra({...extra, chest:e.target.value})} />
          </>
        );
      case 'parkinsons':
        return (
          <>
            <label>Upload Handwriting Sample (PNG/JPG)</label>
            <input type="file" onChange={(e)=>onFile('hand', e)} />
          </>
        );
      case 'lung':
        return (
          <>
            <label>Upload CT Scan (DICOM/PNG/JPG)</label>
            <input type="file" onChange={(e)=>onFile('ct', e)} />
            <label>Upload Chest X-ray</label>
            <input type="file" onChange={(e)=>onFile('xray', e)} />
            <label>Upload breathing audio (optional)</label>
            <input type="file" onChange={(e)=>onFile('audio', e)} />
          </>
        );
      case 'alzheimers':
        return (
          <>
            <label>Upload MRI report</label>
            <input type="file" onChange={(e)=>onFile('mri', e)} />
          </>
        );
      case 'tumor':
        return (
          <>
            <label>Upload MRI / CT Scan</label>
            <input type="file" onChange={(e)=>onFile('scan', e)} />
          </>
        );
      case 'thyroid':
        return (
          <>
            <label>Upload hormone report (TSH/T3/T4)</label>
            <input type="file" onChange={(e)=>onFile('hormone', e)} />
            <label>Upload ultrasound image (optional)</label>
            <input type="file" onChange={(e)=>onFile('us', e)} />
          </>
        );
      case 'diarrhea':
        return (
          <>
            <label>Upload stool report</label>
            <input type="file" onChange={(e)=>onFile('stool', e)} />
            <label>Enter hydration & symptoms</label>
            <textarea onChange={e=>setExtra({...extra, hyd:e.target.value})} />
          </>
        );
      case 'stress':
        return (
          <>
            <label>Upload sleep data CSV (optional)</label>
            <input type="file" onChange={(e)=>onFile('sleep', e)} />
            <label>Enter recent activity / stress triggers</label>
            <textarea onChange={e=>setExtra({...extra, stress:e.target.value})} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="disease-page">
      <div className={`d-page-header ${['alzheimers','tumor','parkinsons'].includes(disease) ? 'center-header' : ''}`}>        
        <div className={`${['alzheimers','tumor','parkinsons'].includes(disease) ? 'center-header-inner' : ''}`}
             style={{display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '15px', width: '100%'}}>
          <div style={{fontSize: '60px'}}>{info.icon}</div>
          <div>
            <h2 style={{margin: '0 0 5px 0'}}>{info.title} Early Detection</h2>
            <div className="muted" style={{marginBottom: '5px'}}>{info.desc}</div>
            <div style={{fontSize: '13px', color: '#555'}}>📋 {info.detail}</div>
          </div>
        </div>
      </div>
      <div className={`upload-grid card ${['alzheimers','tumor','parkinsons'].includes(disease) ? 'alz-wrapper' : ''}`}>        
        {disease === 'alzheimers' ? (
          <div className="alz-box">
            <h3>🧠 Alzheimer's Scan Upload</h3>
            {renderDiseaseSpecific()}
            <div className="mini-note">Supported formats: JPG, PNG. Ensure de-identified patient data.</div>
            <div className="alz-actions">
              <button className="primary" onClick={run} disabled={loading}>{loading ? 'Analyzing...' : 'Run AI Detection'}</button>
              <Link className="ghost" to="/early-detection">Back</Link>
            </div>
            {error && <div style={{color:'red',marginTop:'10px'}}>{error}</div>}
            {result && (
              <div className="analysis-inline card" style={{marginTop:'24px'}}>
                <h3 style={{marginTop:0}}>Alzheimer's Model Result</h3>
                <div style={{display:'flex', gap:'30px', flexWrap:'wrap'}}>
                  <div className="result-left" style={{minWidth:'180px'}}>
                    <div className="score" style={{fontSize:'48px', fontWeight:'600'}}>{Math.round(result.confidence * 100)}%</div>
                    <div className="muted">Confidence</div>
                    <div style={{marginTop:'10px'}}><strong>Prediction:</strong> {result.class}</div>
                    <div className="severity" style={{marginTop:'6px'}}>Severity: <strong>{result.severity}</strong></div>
                  </div>
                  <div className="result-right" style={{flex:'1 1 240px'}}>
                    <h4 style={{margin:'0 0 8px'}}>Suggested Next Steps</h4>
                    <ul style={{margin:'0 0 12px 18px'}}>
                      <li>Consult a neurologist for confirmation.</li>
                      <li>Schedule follow-up cognitive assessment.</li>
                      <li>Begin lifestyle interventions (diet, exercise).</li>
                    </ul>
                    <div className="trend-wrapper card" style={{padding:'10px'}}>
                      <div className="chart-title" style={{fontSize:'12px', fontWeight:'500', marginBottom:'4px'}}>Confidence Stability (sample)</div>
                      <SmallTrend data={[50,55,53,60, Math.round(result.confidence*100)]} color="#FF6B6B" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : ['tumor','parkinsons'].includes(disease) ? (
          <div className={`inline-box ${disease}`}>            
            <h3>{disease==='tumor' ? '🎗 Brain Tumor Scan Upload' : '🧠 Parkinson\'s Handwriting Upload'}</h3>
            {renderDiseaseSpecific()}
            <div className="mini-note">Supported formats: JPG, PNG. Ensure de-identified patient data.</div>
            <div className="actions">
              <button className="primary" onClick={run} disabled={loading}>{loading ? 'Analyzing...' : 'Run AI Detection'}</button>
              <Link className="ghost" to="/early-detection">Back</Link>
            </div>
            {error && <div style={{color:'red',marginTop:'10px'}}>{error}</div>}
            {result && (
              <div className="analysis-inline card" style={{marginTop:'24px'}}>
                <h3 style={{marginTop:0}}>{disease==='tumor' ? 'Brain Tumor' : "Parkinson's"} Model Result</h3>
                <div style={{display:'flex', gap:'30px', flexWrap:'wrap'}}>
                  <div className="result-left" style={{minWidth:'180px'}}>
                    <div className="score" style={{fontSize:'48px', fontWeight:'600'}}>{Math.round(result.confidence * 100)}%</div>
                    <div className="muted">Confidence</div>
                    <div style={{marginTop:'10px'}}><strong>Prediction:</strong> {result.class}</div>
                    <div className="severity" style={{marginTop:'6px'}}>Severity: <strong>{result.severity}</strong></div>
                  </div>
                  <div className="result-right" style={{flex:'1 1 240px'}}>
                    <h4 style={{margin:'0 0 8px'}}>Suggested Next Steps</h4>
                    <ul style={{margin:'0 0 12px 18px'}}>
                      {disease==='tumor' ? (
                        <>
                          <li>Consult an oncologist / radiologist.</li>
                          <li>Order contrast-enhanced follow-up imaging.</li>
                          <li>Review surgical / radiotherapy candidacy.</li>
                        </>
                      ) : (
                        <>
                          <li>Consult a movement disorder specialist.</li>
                          <li>Begin symptom tracking (tremor, gait).</li>
                          <li>Assess medication / therapy options.</li>
                        </>
                      )}
                    </ul>
                    <div className="trend-wrapper card" style={{padding:'10px'}}>
                      <div className="chart-title" style={{fontSize:'12px', fontWeight:'500', marginBottom:'4px'}}>Confidence Stability (sample)</div>
                      <SmallTrend data={[50,55,53,60, Math.round(result.confidence*100)]} color={disease==='tumor' ? '#8A2BE2' : '#00cfe8'} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="upload-column">
              {disease !== 'tumor' && disease !== 'parkinsons' && (
                <>
                  <label>Upload CT / MRI / X-ray</label>
                  <input type="file" onChange={(e)=>onFile('scan', e)} />
                  <label>Upload Report (PDF / PNG)</label>
                  <input type="file" onChange={(e)=>onFile('report', e)} />
                </>
              )}
              {renderDiseaseSpecific()}
            </div>
            {disease !== 'tumor' && disease !== 'parkinsons' && (
              <div className="upload-column">
                <label>Enter Symptoms</label>
                <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Describe symptoms" />
                <label>Medical history / notes</label>
                <textarea onChange={e=>setExtra({...extra, history:e.target.value})} />
              </div>
            )}
            <div className="upload-actions">
              <button className="primary" onClick={run} disabled={loading}>{loading ? 'Analyzing...' : 'Run AI Detection'}</button>
              <Link className="ghost" to="/early-detection">Back</Link>
            </div>
            {error && <div style={{color: 'red', marginTop: '10px', textAlign: 'center'}}>{error}</div>}
            {result && (['tumor','parkinsons'].includes(disease)) && (
              <div className="analysis-inline card" style={{marginTop:'20px'}}>
                <h3 style={{marginTop:0}}>{disease==='tumor' ? 'Brain Tumor' : "Parkinson's"} Model Result</h3>
                <div style={{display:'flex', gap:'30px', flexWrap:'wrap'}}>
                  <div className="result-left" style={{minWidth:'180px'}}>
                    <div className="score" style={{fontSize:'48px', fontWeight:'600'}}>{Math.round(result.confidence * 100)}%</div>
                    <div className="muted">Confidence</div>
                    <div style={{marginTop:'10px'}}><strong>Prediction:</strong> {result.class}</div>
                    <div className="severity" style={{marginTop:'6px'}}>Severity: <strong>{result.severity}</strong></div>
                  </div>
                  <div className="result-right" style={{flex:'1 1 240px'}}>
                    <h4 style={{margin:'0 0 8px'}}>Suggested Next Steps</h4>
                    <ul style={{margin:'0 0 12px 18px'}}>
                      {disease==='tumor' ? (
                        <>
                          <li>Consult an oncologist / radiologist.</li>
                          <li>Order contrast-enhanced follow-up imaging.</li>
                          <li>Review surgical / radiotherapy candidacy.</li>
                        </>
                      ) : (
                        <>
                          <li>Consult a movement disorder specialist.</li>
                          <li>Begin symptom tracking (tremor, gait).</li>
                          <li>Assess medication / therapy options.</li>
                        </>
                      )}
                    </ul>
                    <div className="trend-wrapper card" style={{padding:'10px'}}>
                      <div className="chart-title" style={{fontSize:'12px', fontWeight:'500', marginBottom:'4px'}}>Confidence Stability (sample)</div>
                      <SmallTrend data={[50,55,53,60, Math.round(result.confidence*100)]} color={disease==='tumor' ? '#8A2BE2' : '#00cfe8'} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function AnalysisPage(){
  const { disease } = useParams();
  const { state } = window.history;
  const result = state?.state?.result;
  
  // Use real results if available (Alzheimer's), otherwise use mock data
  let prob, severity, prediction;
  if (result) {
    prediction = result.class;
    prob = Math.round(result.confidence * 100);
    // Map Alzheimer's classes to severity
    if (prediction.includes('Non Demented')) {
      severity = 'Low';
    } else if (prediction.includes('Very Mild') || prediction.includes('Mild')) {
      severity = 'Moderate';
    } else {
      severity = 'High';
    }
  } else {
    prob = Math.round(Math.random()*40+5);
    severity = ['Low','Moderate','High'][Math.floor(Math.random()*3)];
    prediction = 'Analysis Result';
  }
  const mock = { prob, severity, prediction };
  const downloadReport = () => {
    const title = `${disease} - AI Report`;
    const html = `<html><head><title>${title}</title></head><body><h1>${title}</h1><p>Risk: ${mock.prob}% (${mock.severity})</p><p>Generated: ${new Date().toLocaleString()}</p></body></html>`;
    const w = window.open('', '_blank'); w.document.write(html); w.document.close(); w.print();
  };

  return (
    <div className="analysis-page">
      <h2>AI Analysis Results</h2>
      <div className="analysis-grid card">
        <aside className="result-left">
          <div className="score">{mock.prob}%</div>
          <div className="muted">Confidence</div>
          {mock.prediction && <div style={{marginTop: '10px', fontSize: '14px'}}><strong>Prediction:</strong> {mock.prediction}</div>}
          <div className="severity">Severity: <strong>{mock.severity}</strong></div>
          <div className="heatmap card">Heatmap overlay preview (image + overlay)</div>
          <div className="analysis-actions"><button className="primary" onClick={downloadReport}>Download Report (PDF)</button></div>
        </aside>
        <main className="result-right">
          <h4>Charts & Insights</h4>
          <div className="chart-row card">
            <div>
              <div className="chart-title">Disease risk comparison</div>
              <SmallTrend data={[10,20,15, mock.prob, mock.prob+5]} color="#FF6B6B" />
            </div>
            <div>
              <div className="chart-title">Vital correlation</div>
              <SmallTrend data={[70,72,75,76,74,77]} color="#00cfe8" />
            </div>
          </div>
          <div className="next-steps card">
            <h4>Suggested next steps</h4>
            <ul>
              <li>Confirm with specialist</li>
              <li>Get follow-up scans</li>
              <li>Start symptom tracking</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}

function EarlyDetection(){
  const navigate = useNavigate();
  return (
    <div className="ed-page">
      <Routes>
        <Route path="/" element={<>
          <Hero onStart={()=> navigate('/early-detection')} />
          <h3 className="center">Select a disease to analyze</h3>
          <DiseaseGrid />
        </>} />
        <Route path=":disease" element={<DiseasePage/>} />
        <Route path=":disease/analysis" element={<AnalysisPage/>} />
      </Routes>
    </div>
  );
}

export default EarlyDetection;