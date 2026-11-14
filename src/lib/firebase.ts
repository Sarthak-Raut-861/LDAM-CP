import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getDatabase, Database } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBsdCMUxOvvw37v-pGcAnhOVhhXf4GPfvY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "ldam-cp.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://ldam-cp-default-rtdb.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "ldam-cp",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "ldam-cp.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "228611898573",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:228611898573:web:66cc2e57e1fcdae268fd84",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-6MRBRC8XYJ"
};

// Configured with real project keys
export const isRealFirebaseConfigured = true;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let database: Database | null = null;

if (typeof window !== "undefined") {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    database = getDatabase(app);
  } catch (err) {
    console.warn("Firebase client init note: using local resilient store fallback.", err);
  }
}

export { app, auth, database };

