import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // Adjust to your backend URL
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    // Don't redirect on 403 - let the mutation error handler show the toast
    return Promise.reject(error);
  }
);

export default api;