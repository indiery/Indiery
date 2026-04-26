import admin from 'firebase-admin';
import { FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_PROJECT_ID } from './env.js';

const initializeFirebase = () => {
  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY || FIREBASE_PRIVATE_KEY.includes('YOUR_KEY')) {
    console.warn('⚠️  Firebase credentials not configured. Firebase features will be disabled.');
    return null;
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY,
      }),
    });
  }
  return admin;
};

const firebaseAdmin = initializeFirebase();
export default firebaseAdmin;