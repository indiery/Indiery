import axios from 'axios';
import { auth } from '../config/firebase';

const BASE_URL = 'http://localhost:4000/api'; // change to prod URL for release

const api = axios.create({ baseURL: BASE_URL });

// Attach Firebase token to every request
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
