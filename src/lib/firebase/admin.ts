import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { firebaseClientConfig } from "../config";

export function isAdminConfigured(): boolean {
  return Boolean(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);
}

let app: App | null = null;
let db: Firestore | null = null;

function getAdminApp(): App {
  if (!isAdminConfigured()) throw new Error("Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.");
  if (app) return app;
  app = getApps()[0] ?? initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n").replace(/^"|"$/g, ""),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || firebaseClientConfig.storageBucket,
  });
  return app;
}

export function adminAuth() {
  return getAuth(getAdminApp());
}

export function adminDb(): Firestore {
  if (db) return db;
  db = getFirestore(getAdminApp());
  try {
    db.settings({ ignoreUndefinedProperties: true });
  } catch {
    // settings() throws if already applied in a warm lambda — safe to ignore.
  }
  return db;
}

export function adminStorage() {
  return getStorage(getAdminApp());
}

export const COL = {
  users: "users",
  categories: "categories",
  subcategories: "subcategories",
  services: "services",
  vendors: "vendors",
  bookings: "bookings",
  payments: "payments",
  customizationRequests: "customizationRequests",
  monitoringAgents: "monitoringAgents",
  monitoringAssignments: "monitoringAssignments",
  eventUpdates: "eventUpdates",
  reviews: "reviews",
  notifications: "notifications",
  supportRequests: "supportRequests",
} as const;
