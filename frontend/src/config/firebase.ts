// Firebase configuration
export const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "businesspilot-demo.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "businesspilot-demo",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "businesspilot-demo.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:123456789:web:demo"
};

// VAPID key for push notifications
export const vapidKey = process.env.REACT_APP_FIREBASE_VAPID_KEY || "demo-vapid-key";

// Firebase feature flags
export const firebaseFeatures = {
  messaging: process.env.REACT_APP_FIREBASE_MESSAGING_ENABLED === 'true',
  analytics: process.env.REACT_APP_FIREBASE_ANALYTICS_ENABLED === 'true',
  performance: process.env.REACT_APP_FIREBASE_PERFORMANCE_ENABLED === 'true',
};