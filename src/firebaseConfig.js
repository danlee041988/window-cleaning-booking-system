/**
 * FIREBASE CONFIGURATION - CURRENTLY UNUSED
 * 
 * This application uses EmailJS for form submissions instead of Firebase.
 * Firebase configuration is retained here for potential future use but is
 * not imported anywhere in the application.
 * 
 * To reduce bundle size by ~60%, consider removing the firebase dependency
 * from package.json if you don't plan to use it.
 * 
 * Run: npm uninstall firebase
 */

// Commented out to prevent unnecessary bundle inclusion
// Uncomment if Firebase is needed in the future

/*
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase configuration using environment variables
// See https://firebase.google.com/docs/web/setup#available-libraries
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID // Optional: for Google Analytics
};

// Validate that required Firebase config values are present
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  // Use proper error handling instead of console.error
  throw new Error(`Missing required Firebase configuration: ${missingKeys.join(', ')}`);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
*/

// Export empty objects to prevent import errors if this file is referenced
export const db = null;
export const auth = null;
