import axios from 'axios';

const rawBaseURL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace(/\/$/, '');
const baseURL = rawBaseURL.endsWith('/api') ? `${rawBaseURL}/v1` : rawBaseURL;

const api = axios.create({
  baseURL,
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Automatically unwrap success envelope to keep frontend code clean
api.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      // If backend reports failure, reject promise
      if (response.data.success === false) {
        return Promise.reject({
          response: {
            data: { message: response.data.message || 'Request failed' }
          }
        });
      }
      // Replace response.data with response.data.data
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    // Standardize error formats
    if (error.response && error.response.data && typeof error.response.data === 'object' && 'success' in error.response.data) {
      error.response.data.message = error.response.data.message || 'Request failed';
    }
    return Promise.reject(error);
  }
);

export default api;
