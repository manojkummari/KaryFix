import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (redux-persist saves it here)
    const persistedState = localStorage.getItem('persist:karyfix-auth');
    if (persistedState) {
      try {
        const auth = JSON.parse(persistedState);
        const token = auth.token ? JSON.parse(auth.token) : null;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.error('Error parsing persisted auth state', e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - could dispatch logout action here
      console.error('Unauthorized - redirecting to login');
    }
    return Promise.reject(error);
  }
);

export default api;
