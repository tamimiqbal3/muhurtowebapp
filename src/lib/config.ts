// Feature flags derived from environment variables. Server-only values are
// read lazily inside functions so they are never inlined into client bundles.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
export const PLATFORM_FEE_RATE = 0.02;

/**
 * Firebase web-app config for the "muhurto-app" project. These are public identifiers (they ship
 * in every browser bundle) — not secrets. Access is controlled by Firestore/Storage security rules
 * and by the server-only service account. Environment variables override them if set.
 */
const FIREBASE_WEB = {
  apiKey: "AIzaSyA3rUrZQpXWacYaOBBHqDdaoE5nHvEXyHc",
  authDomain: "muhurto-app.firebaseapp.com",
  projectId: "muhurto-app",
  storageBucket: "muhurto-app.firebasestorage.app",
  messagingSenderId: "338808019453",
  appId: "1:338808019453:web:19d8edd2208cb13d5e2194",
  measurementId: "G-MKLSRVBFWN",
  // Realtime Database (Singapore, asia-southeast1 — the closest region to Dhaka).
  databaseURL: "https://muhurto-app-default-rtdb.asia-southeast1.firebasedatabase.app",
};

export const firebaseClientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || FIREBASE_WEB.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || FIREBASE_WEB.authDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || FIREBASE_WEB.projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || FIREBASE_WEB.storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || FIREBASE_WEB.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || FIREBASE_WEB.appId,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || FIREBASE_WEB.measurementId,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || FIREBASE_WEB.databaseURL,
};

export const isFirebaseClientConfigured = Boolean(
  firebaseClientConfig.apiKey && firebaseClientConfig.authDomain && firebaseClientConfig.projectId && firebaseClientConfig.appId,
);
