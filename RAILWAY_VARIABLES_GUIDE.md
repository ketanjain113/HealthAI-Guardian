# 🔧 Railway Environment Variables Setup

This guide shows you **exactly which variables to set in Railway dashboard** for each service.

---

## 📌 KEY CONCEPT

**All configuration is done in Railway dashboard - NOT in code!**

- ❌ NO hardcoded URLs
- ❌ NO hardcoded secrets
- ❌ NO hardcoded API keys
- ✅ Everything read from environment variables
- ✅ Set once in Railway
- ✅ Works for dev/staging/prod

---

## 🚀 RAILWAY SETUP - SERVICE BY SERVICE

### SERVICE 1: Model API (Python)

**In Railway Dashboard:**

Go to: `Model API Service` → Settings → Variables

**Add these variables:**

```
(No variables needed - uses defaults)
```

✅ Model API runs on port 5000 automatically
✅ Loads .h5 model files from directory

---

### SERVICE 2: Backend API (Node.js)

**In Railway Dashboard:**

Go to: `Backend Service` → Settings → Variables

**Add ALL of these variables:**

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/healthai-guardian
MODEL_API_URL=https://healthai-models-xxxx.railway.app
PREDICTION_API=https://healthai-models-xxxx.railway.app/api/diagnose
NODE_ENV=production
PORT=8080
JWT_SECRET=generate-a-random-key-using-openssl
OPENROUTER_API_KEY=your_actual_openrouter_key
```

**Variable Explanation:**

| Variable | Value | Example |
|----------|-------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/healthai-guardian` |
| `MODEL_API_URL` | Model API deployed service URL | `https://healthai-models-abc123.railway.app` |
| `PREDICTION_API` | Diagnosis endpoint URL | `https://healthai-models-abc123.railway.app/api/diagnose` |
| `NODE_ENV` | Environment type | `production` |
| `PORT` | Backend port | `8080` |
| `JWT_SECRET` | Random secret for tokens | Generate with: `openssl rand -hex 32` |
| `OPENROUTER_API_KEY` | Your OpenRouter API key | From OpenRouter |

---

### SERVICE 3: Frontend (React)

**In Railway Dashboard:**

Go to: `Frontend Service` → Settings → Variables

**Add these variables:**

```
REACT_APP_API_URL=https://healthai-backend-xxxx.railway.app
REACT_APP_MODEL_API_URL=https://healthai-models-xxxx.railway.app
```

**Variable Explanation:**

| Variable | Value | Example |
|----------|-------|---------|
| `REACT_APP_API_URL` | Your backend service URL | `https://healthai-backend-abc123.railway.app` |
| `REACT_APP_MODEL_API_URL` | Your model API service URL | `https://healthai-models-abc123.railway.app` |

---

## 🔗 HOW SERVICES CONNECT

```
                    Railway Dashboard (You set variables here)
                                 ↓
┌────────────────────────────────────────────────┐
│  Frontend Service                              │
│  Uses: REACT_APP_API_URL                       │
│  Calls: Backend Service                        │
└──────────────────┬─────────────────────────────┘
                   │
                   ↓
┌────────────────────────────────────────────────┐
│  Backend Service                               │
│  Uses: MODEL_API_URL                           │
│  Uses: MONGO_URI                               │
│  Uses: JWT_SECRET                              │
│  Uses: API Keys (Google, OpenRouter, OpenAI)   │
│  Calls: Model API & MongoDB                    │
└──────────────────┬─────────────────────────────┘
                   │
         ┌─────────┼─────────┐
         ↓                   ↓
    ┌─────────┐          ┌──────────┐
    │ Model   │          │ MongoDB  │
    │ API     │          │ Atlas    │
    └─────────┘          └──────────┘
```

---

## 📝 WHERE VARIABLES ARE USED IN CODE

### Backend (Node.js)

```javascript
// Root/Backend/app.js

const MODEL_API_URL = process.env.MODEL_API_URL;  // From Railway
const PORT = process.env.PORT;                     // From Railway

// Connect to MongoDB with MONGO_URI
mongoose.connect(process.env.MONGO_URI);          // From Railway
```

### Frontend (React)

```javascript
// src/config.js

const API_BASE_URL = process.env.REACT_APP_API_URL;           // From Railway
const MODEL_API_URL = process.env.REACT_APP_MODEL_API_URL;    // From Railway

export const config = {
  API_BASE_URL,
  endpoints: {
    auth: {
      signup: `${API_BASE_URL}/api/auth/signup`,    // Uses API_BASE_URL
    },
  },
};
```

---

## ✅ STEP-BY-STEP RAILWAY SETUP

### Step 1: Deploy Model API Service

1. In Railway: `New Service`
2. Connect GitHub, select root: `Model/`
3. **Deploy** (no variables needed)
4. **Wait for deployment**
5. **Copy the public URL** (e.g., `https://healthai-models-abc123.railway.app`)

### Step 2: Deploy Backend Service

1. In Railway: `New Service`
2. Connect GitHub, select root: `Root/Backend/`
3. Go to **Settings → Variables**
4. **Add all these variables:**
   - `MONGO_URI` = your MongoDB connection string
   - `MODEL_API_URL` = **paste URL from Step 1**
   - `PREDICTION_API` = `https://healthai-models-abc123.railway.app/api/diagnose`
   - `NODE_ENV` = `production`
   - `PORT` = `8080`
   - `JWT_SECRET` = generate random secret
   - `OPENROUTER_API_KEY` = your key
5. **Deploy**
6. **Wait for deployment**
7. **Copy the public URL** (e.g., `https://healthai-backend-abc123.railway.app`)

### Step 3: Deploy Frontend Service

1. In Railway: `New Service`
2. Connect GitHub, select root: `/` (project root)
3. Go to **Settings → Variables**
4. **Add these variables:**
   - `REACT_APP_API_URL` = **paste URL from Step 2**
   - `REACT_APP_MODEL_API_URL` = **paste URL from Step 1**
5. **Deploy**
6. **Wait for deployment**
7. **Your app is LIVE!** 🎉

---

## 🔐 GETTING YOUR VALUES

### MongoDB Connection String (MONGO_URI)

1. Go to MongoDB Atlas: https://www.mongodb.com/cloud/atlas
2. Create cluster (free tier OK)
3. Create user with password
4. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/healthai-guardian?retryWrites=true&w=majority`
5. Use this for `MONGO_URI`

### JWT Secret (JWT_SECRET)

Generate a random secure key:

**Linux/Mac:**
```bash
openssl rand -hex 32
```

**Windows PowerShell:**
```powershell
[System.Convert]::ToHexString((1..32 | ForEach-Object { [byte](Get-Random -Max 256) }))
```

**Result example:** `a3f8c2e9b1d4f7a6e8c3d5b9f1a4e7c9d2f5a8b1c4e7a9d2f5a8b1c4e7a9d`

### API Keys

- **OPENROUTER_API_KEY**: Get from [OpenRouter](https://openrouter.ai)

---

## 🧪 VERIFY VARIABLES ARE SET

After deploying each service:

1. Go to Railway dashboard
2. Click the service
3. Click **"Settings"** tab
4. Scroll to **"Variables"** section
5. **Verify all variables are listed**

---

## 🔄 CHANGING VARIABLES LATER

If you need to change a variable:

1. Go to Railway: `Service` → `Settings` → `Variables`
2. Edit the variable value
3. Click **"Redeploy"** in deployment tab
4. Service automatically redeploys with new value

---

## ⚠️ IMPORTANT NOTES

### These are NOT set in Railway (uses defaults):
- Model API service: No variables needed
- Frontend: Only needs `REACT_APP_*` variables

### These MUST be set in Railway (no defaults):
- Backend `MONGO_URI` - Required for database
- Backend `MODEL_API_URL` - Required to call models
- Backend `JWT_SECRET` - Required for authentication
- Any API keys you're using

### Never hardcode:
- ❌ Database passwords
- ❌ API keys
- ❌ JWT secrets
- ❌ Service URLs (use Railway public URLs)

### Security:
- ✅ Variables stored securely in Railway
- ✅ Variables NOT visible in Git
- ✅ Variables NOT in code
- ✅ Each environment (prod/staging) has separate variables

---

## 🎯 QUICK REFERENCE

**Model API Service:** `No variables needed`

**Backend Service:** 7 variables
- 1 Database (MONGO_URI)
- 2 Model URLs (MODEL_API_URL, PREDICTION_API)
- 2 Node config (NODE_ENV, PORT)
- 1 Auth (JWT_SECRET)
- 1 API key (OpenRouter)

**Frontend Service:** 2 variables
- REACT_APP_API_URL
- REACT_APP_MODEL_API_URL

**Total:** 9 variables across all services

---

## ✅ CHECKLIST

Before deploying:

- [ ] Have MongoDB Atlas account & connection string ready
- [ ] Have all API keys ready (Google, OpenRouter, OpenAI)
- [ ] Generated JWT secret
- [ ] Model API service URL ready (from Step 1)
- [ ] Backend service URL ready (from Step 2)

When deploying:

- [ ] Deploy Model API first
- [ ] Copy Model API URL
- [ ] Deploy Backend with MODEL_API_URL
- [ ] Copy Backend URL
- [ ] Deploy Frontend with Backend URL
- [ ] All services running
- [ ] Visit frontend URL - DONE! 🎉

---

## 🆘 TROUBLESHOOTING

### "Backend can't connect to MongoDB"
- Check `MONGO_URI` is correct
- Verify MongoDB Atlas IP whitelist (should be `0.0.0.0/0`)
- Check credentials in connection string

### "Backend can't reach Model API"
- Check `MODEL_API_URL` is correct
- Verify Model API service is running
- Use browser to test: `https://healthai-models-xxx.railway.app/`

### "Frontend can't connect to Backend"
- Check `REACT_APP_API_URL` is correct
- Rebuild frontend (Railway does this automatically)
- Check browser console for errors

### "Variables not taking effect"
- Variables take effect on next deployment
- Go to Deployments tab and redeploy
- Wait for redeployment to complete

---

**All configuration is done in Railway dashboard. No code changes needed after initial setup!** ✅
