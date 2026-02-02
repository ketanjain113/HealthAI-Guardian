# HealthAI Guardian - Railway Deployment Quick Start

## What Changed

Your HealthAI Guardian application has been configured for Railway deployment with **3 separate microservices**:

✅ **Model API** - Runs ML models (separate Python/Flask service)
✅ **Backend API** - Node.js server (connects to Model API via environment variable)
✅ **Frontend** - React app (connects to Backend via environment variable)

## Files Created/Modified

### New Files Created:
- `Dockerfile` - Frontend container configuration
- `nginx.conf` - Frontend web server configuration
- `railway.json` - Railway deployment config (root)
- `Model/Dockerfile` - Model API container configuration
- `Model/railway.json` - Model API Railway config
- `Model/.dockerignore` - Ignore patterns for Model API
- `Root/Backend/Dockerfile` - Backend container configuration
- `Root/Backend/railway.json` - Backend Railway config
- `Root/Backend/.dockerignore` - Ignore patterns for Backend
- `.dockerignore` - Ignore patterns for frontend
- `.env.example` - Template for environment variables
- `src/config.js` - Centralized API configuration
- `DEPLOYMENT.md` - Complete deployment guide
- `ENV_SETUP.md` - Environment variable setup guide

### Modified Files:
- `Root/Backend/app.js` - Updated to use `MODEL_API_URL` environment variable
- `src/Signup.js` - Uses config.js for API endpoints
- `src/Login.js` - Uses config.js for API endpoints
- `src/Predictions.js` - Uses config.js for API endpoints
- `src/EarlyDetection2.js` - Uses config.js for API endpoints

## Quick Start - 5 Steps

### 1. **Push to GitHub**
```bash
git add .
git commit -m "Configure for Railway deployment with microservices"
git push origin main
```

### 2. **Create Railway Project**
- Go to https://railway.app
- Create new project from GitHub
- Connect your repository

### 3. **Deploy Model API First**
- New Service → GitHub Repo
- Root Directory: `Model`
- Wait for deployment to complete
- Copy the public URL (e.g., `https://healthai-models-xxxx.railway.app`)

### 4. **Deploy Backend API**
- New Service → GitHub Repo
- Root Directory: `Root/Backend`
- Add environment variables:
  ```
  MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/healthai-guardian
  MODEL_API_URL=<paste_model_api_url_from_step_3>
  PREDICTION_API=<paste_model_api_url>/api/diagnose
  JWT_SECRET=<generate_random_key>
  NODE_ENV=production
  ```
- Wait for deployment
- Copy the public URL

### 5. **Deploy Frontend**
- New Service → GitHub Repo
- Root Directory: `/` (root)
- Add environment variables:
  ```
  REACT_APP_API_URL=<paste_backend_url_from_step_4>
  REACT_APP_MODEL_API_URL=<paste_model_api_url_from_step_3>
  ```
- Wait for deployment
- Visit your frontend URL!

## Key Architecture

```
┌─────────────────────────────────────────┐
│           User Browser                   │
│    (React Frontend on Nginx)             │
└────────────┬──────────────────────────────┘
             │ HTTP/JSON
             ↓
┌─────────────────────────────────────────┐
│      Backend API (Node.js/Express)       │
│  (handles auth, user data, orchestration)│
│  env: MODEL_API_URL                     │
└────────────┬──────────────────────────────┘
             │ HTTP to
             ↓
┌─────────────────────────────────────────┐
│  Model API (Python/Flask)                │
│  (Alzheimer, Tumor, Parkinson models)   │
│  Served separately on Railway            │
└──────────────────────────────────────────┘
```

## Environment Variables Explained

### Frontend Variables
- `REACT_APP_API_URL` - Where to find your backend
- `REACT_APP_MODEL_API_URL` - Where Model API is (for direct calls if needed)

### Backend Variables
- `MONGO_URI` - MongoDB connection string
- `MODEL_API_URL` - Where Model API is deployed
- `PREDICTION_API` - Alternative endpoint for diagnostics
- `JWT_SECRET` - For user authentication
- `NODE_ENV` - Set to `production`
- API keys for AI services (Google, OpenRouter, OpenAI)

## What Happens During Deployment

1. **Railway detects your GitHub repo has 3 services**
   - Looks for Dockerfile in each service root directory
   - Reads railway.json for deployment config

2. **Each service builds independently**
   - Frontend: Built React → Nginx server
   - Backend: Node.js app with npm dependencies
   - Models: Python Flask app with ML models

3. **Each service gets a public HTTPS URL**
   - Models: `https://healthai-models-xxxx.railway.app`
   - Backend: `https://healthai-backend-xxxx.railway.app`
   - Frontend: `https://healthai-frontend-xxxx.railway.app`

4. **Services communicate via URLs stored in environment variables**
   - No localhost references
   - Completely cloud-based

## Testing After Deployment

1. **Frontend loads**: Visit your frontend URL in browser
2. **Network tab**: Check that requests go to correct backend URL
3. **Check models**: Click "Early Detection" - should call Model API
4. **Test signup/login**: Creates users in MongoDB
5. **View logs**: In Railway dashboard for each service to debug issues

## Important Files to Know

- **`src/config.js`** - All API endpoints configured here
  - Change this if you update URLs
  
- **`Root/Backend/app.js`** - Main backend server
  - Uses `MODEL_API_URL` env var to call models
  
- **`Model/ModelAPI.py`** - ML prediction server
  - Loads .h5 model files from same directory
  
- **`.env.example`** - Template for environment variables
  - Keep this in Git (no secrets)
  - Use as reference for Railway setup

## Troubleshooting

**Frontend loads but can't login?**
- Check `REACT_APP_API_URL` matches backend URL
- Check backend logs for connection issues

**Models not working?**
- Check `MODEL_API_URL` is correct in backend
- Verify Model API service is running (check logs)

**MongoDB connection fails?**
- Verify credentials in `MONGO_URI`
- In MongoDB Atlas, whitelist IP `0.0.0.0/0`

**See actual errors?**
- Go to Railway dashboard → Service → Logs tab
- Shows real error messages from your app

## Next Steps

- Read `DEPLOYMENT.md` for complete step-by-step guide
- Read `ENV_SETUP.md` for environment variable details
- Monitor Railway dashboard for service health
- Set up GitHub Actions for automated testing (optional)

## Free Tier Limits

Railway's free tier includes:
- Up to $5/month credit (generous)
- Deploy multiple services
- Good for prototyping
- Scale up with paid plans as needed

---

**Your app is now ready for Railway deployment!** 🚀

Follow the quick start steps above to get it live.
