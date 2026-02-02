// src/config.js
// Configuration for API endpoints based on environment

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const MODEL_API_URL = process.env.REACT_APP_MODEL_API_URL || 'http://localhost:5000';

export const config = {
  API_BASE_URL,
  MODEL_API_URL,
  endpoints: {
    auth: {
      signup: `${API_BASE_URL}/api/auth/signup`,
      login: `${API_BASE_URL}/api/auth/login`,
    },
    dashboard: {
      user: (userId) => `${API_BASE_URL}/api/dashboard/user/${userId}`,
      profile: (userId) => `${API_BASE_URL}/api/dashboard/user/${userId}/profile`,
      testResult: (userId) => `${API_BASE_URL}/api/dashboard/user/${userId}/test-result`,
    },
    predict: {
      alzheimer: `${API_BASE_URL}/api/predict/alzheimer`,
      tumor: `${API_BASE_URL}/api/predict/tumor`,
      parkinsons: `${API_BASE_URL}/api/predict/parkinsons`,
    },
    ai: {
      symptoms: `${API_BASE_URL}/api/process-symptoms`,
    },
  },
};

export default config;
