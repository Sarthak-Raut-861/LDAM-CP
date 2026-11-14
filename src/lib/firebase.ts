import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getDatabase, Database } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDummyKeyForMockFallback_SmartDose",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "smartdose-iot.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://smartdose-iot-default-rtdb.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "smartdose-iot",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "smartdose-iot.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "102938475610",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:102938475610:web:8a9b7c6d5e4f3a2b",
};

// Check if credentials are real or placeholder
export const isRealFirebaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  !process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes("Dummy")
);

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

