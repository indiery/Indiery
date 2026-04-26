import Constants from 'expo-constants';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider, signInWithPhoneNumber as firebaseSignInWithPhoneNumber, signInWithPopup, onAuthStateChanged as firebaseOnAuthStateChanged, RecaptchaVerifier as FirebaseRecaptchaVerifier } from 'firebase/auth';

// Firebase config - use hardcoded values as fallback
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDBCb63NtVtrctEN5sb1DP7a2h2AlEiHKs',
  authDomain: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'indiery-6a489.firebaseapp.com',
  projectId: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'indiery-6a489',
  storageBucket: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'indiery-6a489.firebasestorage.app',
  messagingSenderId: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1066705936060',
  appId: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_APP_ID || '1:1066705936060:web:2d1eef2edde1f9b6f77ab9',
};

// Initialize Firebase app
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// Auth providers
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

export const getIdToken = async (forceRefresh = false) => {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken(forceRefresh);
};

export const getCurrentUser = () => auth.currentUser;

export const onAuthStateChanged = (callback) => {
  return firebaseOnAuthStateChanged(auth, callback);
};

// Social sign-in methods
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signInWithApple = () => signInWithPopup(auth, appleProvider);

// Phone auth with recaptcha
export const signInWithPhoneNumber = (phoneNumber) => {
  const verifier = new FirebaseRecaptchaVerifier(auth, 'recaptcha-container', {
    size: 'invisible',
  });
  return firebaseSignInWithPhoneNumber(auth, phoneNumber, verifier);
};

export const RecaptchaVerifier = FirebaseRecaptchaVerifier;

export { app, auth, googleProvider, appleProvider };
export default app;