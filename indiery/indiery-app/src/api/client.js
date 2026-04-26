import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Firebase token to requests
client.interceptors.request.use(
  async (config) => {
    const { getIdToken } = await import('../services/firebase');
    const token = await getIdToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - could trigger logout
      console.log('Unauthorized request');
    }
    return Promise.reject(error);
  }
);

export default client;