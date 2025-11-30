import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import axios from 'axios';

import aiRoutes from './routes/ai.js';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import User from './models/User.js';

const app = express();

app.use(express.json());
app.use(cors());


// =========================
// CONNECT MONGODB
// =========================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err));


app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Basic root route to avoid "Cannot GET /" when hitting backend directly
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'HealthAI Node API', routes: ['/api/auth', '/api/dashboard', '/api/ai', '/api/predict/*'] });
});

app.post("/api/process-symptoms", async (req, res) => {
  const { symptoms } = req.body;

  try {
    const response = await axios.post("http://localhost:5000/api/diagnose", {
      symptoms: symptoms,
    });

    return res.json({
      reply: response.data.reply,
    });

  } catch (error) {
    console.error("Python API Error:", error.message);

    return res.status(500).json({
      error: "Python API Failed to respond",
    });
  }
});

import multer from 'multer';
import FormData from 'form-data';
const upload = multer({ storage: multer.memoryStorage() });

app.post("/api/predict/alzheimer", upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const formData = new FormData();
    formData.append('image', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await axios.post("http://localhost:5000/predict/alzheimer", formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    // Auto-save to user if header present
    const userId = req.headers['x-user-id'] || req.headers['X-User-Id'] || req.query.userId;
    if (userId) {
      try {
        const resultPayload = {
          testType: 'alzheimer',
          result: response.data?.class || response.data?.result || 'Unknown',
          confidence: response.data?.confidence,
          severity: /tumor|parkinson|moderate|high/i.test(response.data?.class || '') ? 'High' : 'Low',
          details: { source: 'api/predict/alzheimer' },
          date: new Date()
        };
        const user = await User.findById(userId);
        if (user) {
          user.testResults.push(resultPayload);
          user.lastScan = { name: 'alzheimer', status: resultPayload.result, date: new Date() };
          await user.save();
        }
      } catch (e) {
        console.warn('Autosave alzheimer result failed:', e.message);
      }
    }

    return res.json(response.data);

  } catch (error) {
    console.error("Alzheimer Prediction Error:", error.message);
    return res.status(500).json({
      error: "Failed to process Alzheimer prediction",
      details: error.response?.data || error.message
    });
  }
});

// =========================
// BRAIN TUMOR PREDICTION ROUTE
// Frontend disease key: 'tumor' -> Python endpoint '/predict/brain_tumor'
// =========================
app.post('/api/predict/tumor', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    const formData = new FormData();
    formData.append('image', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    const response = await axios.post('http://localhost:5000/predict/brain_tumor', formData, {
      headers: { ...formData.getHeaders() },
    });
    // Auto-save
    const userId = req.headers['x-user-id'] || req.headers['X-User-Id'] || req.query.userId;
    if (userId) {
      try {
        const resultPayload = {
          testType: 'tumor',
          result: response.data?.class || response.data?.result || 'Unknown',
          confidence: response.data?.confidence,
          severity: /tumor|moderate|high/i.test(response.data?.class || '') ? 'High' : 'Low',
          details: { source: 'api/predict/tumor' },
          date: new Date()
        };
        const user = await User.findById(userId);
        if (user) {
          user.testResults.push(resultPayload);
          user.lastScan = { name: 'tumor', status: resultPayload.result, date: new Date() };
          await user.save();
        }
      } catch (e) {
        console.warn('Autosave tumor result failed:', e.message);
      }
    }

    return res.json(response.data);
  } catch (error) {
    console.error('Tumor Prediction Error:', error.message);
    return res.status(500).json({
      error: 'Failed to process Tumor prediction',
      details: error.response?.data || error.message,
    });
  }
});

// =========================
// PARKINSON'S PREDICTION ROUTE
// Frontend disease key: 'parkinsons' -> Python endpoint '/predict/parkinson'
// =========================
app.post('/api/predict/parkinsons', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    const formData = new FormData();
    formData.append('image', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    const response = await axios.post('http://localhost:5000/predict/parkinson', formData, {
      headers: { ...formData.getHeaders() },
    });
    // Auto-save
    const userId = req.headers['x-user-id'] || req.headers['X-User-Id'] || req.query.userId;
    if (userId) {
      try {
        const resultPayload = {
          testType: 'parkinsons',
          result: response.data?.class || response.data?.result || 'Unknown',
          confidence: response.data?.confidence,
          severity: /parkinson|moderate|high/i.test(response.data?.class || '') ? 'High' : 'Low',
          details: { source: 'api/predict/parkinsons' },
          date: new Date()
        };
        const user = await User.findById(userId);
        if (user) {
          user.testResults.push(resultPayload);
          user.lastScan = { name: 'parkinsons', status: resultPayload.result, date: new Date() };
          await user.save();
        }
      } catch (e) {
        console.warn('Autosave parkinsons result failed:', e.message);
      }
    }

    return res.json(response.data);
  } catch (error) {
    console.error('Parkinson Prediction Error:', error.message);
    return res.status(500).json({
      error: 'Failed to process Parkinson prediction',
      details: error.response?.data || error.message,
    });
  }
});


// =========================
// START NODE BACKEND ON PORT 8080
// =========================
app.listen(8080, () => {
  console.log("Node Backend running on port 8080");
});
