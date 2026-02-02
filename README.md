# 🧑‍⚕️ HeathCare AI Guidance — Preventive Health AI Platform 🍎

 HeathCare AI Guidance is a modern preventive health web app that helps users track vitals, run early disease detection using ML models (Parkinson’s, Brain Tumor, Alzheimer’s, and many more), and manage medical dashboards — all with a cohesive, mobile‑friendly UI.

This repo includes:
- Frontend (React) with responsive pages: Home, Login/Signup, Vitals, Early Detection, Predictions, Doctor Panel
- Backend (Node/Express + MongoDB) for auth, user data, and prediction autosave
- Model service (Python/Flask) used by the backend to run ML predictions

## Features
- **Account & Auth:** Signup/Login, localStorage session handling
- **Vitals Tracking:** Steps, heart rate, BP, weight; optional Bluetooth sync
- **Early Detection:** Upload scans for Parkinson’s, Brain Tumor, Alzheimer’s; autosaves class + confidence to user profile
- **Predictions Dashboard:** Recent results, editable profile (height, weight, blood group, emergency contact)
- **Doctor Panel:** Themed admin-like overview with stats, students/medicines/emergency sections
- **Mobile Responsive:** Pages tuned for breakpoints and touch-friendly controls

## Tech Stack
- **Frontend:** React, modern CSS (grids, flex, gradients)
- **Backend:** Node.js, Express, MongoDB/Mongoose
- **Model API:** Python, Flask; `.h5` models loaded server-side

## Monorepo Structure
```
Root/Backend/         # Node/Express API
Model/                # Python/Flask model service + notebooks
public/               # Static assets
src/                  # React app pages & styles
Doctor Panel.js       # Legacy/alternate panel entry (frontend)
package.json          # Frontend package manifest
```

## Getting Started

### 1) Prerequisites
- Node.js 18+
- Python 3.10+
- A MongoDB instance (Atlas or local)

### 2) Install dependencies
- Frontend (root):
```powershell
npm install
```
- Backend:
```powershell
cd ".\Root\Backend"; npm install
```
- Model API:
```powershell
cd ".\Model"; python -m venv .venv; .\.venv\Scripts\activate; pip install -r requirements.txt
```

### 3) Environment variables
Create a `.env` in `Backend/`:
```
MONGODB_URI=<your MongoDB connection string>
MODEL_API_BASE_URL=http://localhost:5000
JWT_SECRET=<strong secret>
PORT=8080
```

Create a `.env` for the frontend (optional) if you want to configure API base:
```
REACT_APP_API_BASE=http://localhost:8080
```

### 4) Run services (local)
- Model API (Flask):
```powershell
cd ".\Model"; .\.venv\Scripts\activate; python ModelAPI.py
```
- Backend (Express):
```powershell
cd ".\Backend"; npm run dev
```
- Frontend (React):
```powershell
npm start
```

Open the app at `http://localhost:3000`.

## Key Workflows

### Signup/Login
- `POST /api/auth/signup` → creates a user; frontend stores `userId` and `userName` in `localStorage`
- `POST /api/auth/login` → returns user details; redirects to home

### Early Detection & Autosave
- Frontend uploads an image to the backend endpoint (e.g., tumor/alzheimer/parkinson)
- Backend forwards to Python Model API (`MODEL_API_BASE_URL`) and receives `{ class, confidence }`
- If header `x-user-id` is present, backend persists the result to the user’s `testResults` and updates `lastScan`

### Vitals & Bluetooth
- Vitals page displays tracked vitals
- Optional Web Bluetooth pairing for devices; name/status shown in UI

## API Overview (Backend)
- `GET /` → health/root route
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/user/:id` → fetch profile
- `PUT /api/user/:id` → update profile (height, weight, bloodGroup, emergency)
- `POST /api/predict/tumor` → multipart image; returns prediction; autosaves if `x-user-id`
- `POST /api/predict/alzheimer` → multipart image; autosaves
- `POST /api/predict/parkinson` → multipart image; autosaves

## Frontend Pages
- `Home.js` — hero + features
- `Login.js` / `Signup.js` — auth flows
- `Vitals.js` — vitals tracking + Bluetooth pairing
- `EarlyDetection.js` / `EarlyDetection2.js` — disease selection and uploads
- `Predictions.js` — profile editing, recent results
- `DoctorPanel.js` — themed admin dashboard

## Development Tips
- If predictions don’t save: confirm backend receives `x-user-id` header; check Mongo connection
- If uploads fail: verify `multer` config and that Model API is reachable
- For mobile tweaks: adjust CSS in `App.css`, `Vitals.css`, `EarlyDetection.css`, `Login.css`, `Signup.css`, `DoctorPanel.css`

## Acknowledgements
- Open‑source libraries and frameworks powering the stack


