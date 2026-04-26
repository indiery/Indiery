import dotenv from 'dotenv';
dotenv.config();

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = process.env.PORT || 5000;
export const API_VERSION = process.env.API_VERSION || 'v1';

export const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/indiery';

export const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
export const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
export const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

export const MAPPLS_CLIENT_ID = process.env.MAPPLS_CLIENT_ID;
export const MAPPLS_CLIENT_SECRET = process.env.MAPPLS_CLIENT_SECRET;
export const MAPPLS_REST_KEY = process.env.MAPPLS_REST_KEY;

export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
export const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
export const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000;
export const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX) || 100;

export default {
  NODE_ENV,
  PORT,
  API_VERSION,
  MONGO_URI,
  FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY,
  MAPPLS_CLIENT_ID,
  MAPPLS_CLIENT_SECRET,
  MAPPLS_REST_KEY,
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET,
  CORS_ORIGIN,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX,
};