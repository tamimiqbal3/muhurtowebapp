import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { getDatabase, ServerValue } from "firebase-admin/database";
import { RtdbStore } from "./rtdb-store";
import { firebaseClientConfig } from "../config";

/**
 * Server credentials for Firebase Admin, accepted in any of these forms (set in Vercel → Environment Variables):
 *  1. FIREBASE_SERVICE_ACCOUNT  — the whole downloaded service-account JSON file (raw JSON, or base64 of it)
 *  2. FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY (+ FIREBASE_PROJECT_ID, default "muhurto-app")
 * Common paste mistakes are repaired: literal "\n" sequences, surrounding quotes, base64-encoded keys.
 */
type Creds = { projectId: string; clientEmail: string; privateKey: string };

const env = (...names: string[]) => names.map((n) => process.env[n]?.trim()).find((v) => v) ?? "";

function fixKey(raw: string): string {
  let k = raw.trim().replace(/^['"]|['"]$/g, "");
  if (!k.includes("BEGIN") && /^[A-Za-z0-9+/=\s]+$/.test(k)) {
    try { const d = Buffer.from(k, "base64").toString("utf8"); if (d.includes("BEGIN")) k = d; } catch { /* not base64 */ }
  }
  return k.replace(/\\n/g, "\n").replace(/\r/g, "");
}

function parseJson(raw: string): Record<string, string> | null {
  const t = raw.trim().replace(/^'|'$/g, "");
  for (const c of [t, (() => { try { return Buffer.from(t, "base64").toString("utf8"); } catch { return ""; } })()]) {
    try { const o = JSON.parse(c); if (o && typeof o === "object") return o; } catch { /* next */ }
  }
  return null;
}

let resolved: { creds: Creds | null; problems: string[]; source: string } | null = null;

export function adminCredentials() {
  if (resolved) return resolved;
  const problems: string[] = [];
  const json = env("FIREBASE_SERVICE_ACCOUNT", "FIREBASE_SERVICE_ACCOUNT_JSON", "FIREBASE_ADMIN_CREDENTIALS", "GOOGLE_SERVICE_ACCOUNT");
  if (json) {
    const o = parseJson(json);
    if (!o) problems.push("FIREBASE_SERVICE_ACCOUNT is set but is not valid JSON — paste the whole downloaded .json file.");
    else if (!o.client_email || !o.private_key) problems.push("FIREBASE_SERVICE_ACCOUNT is missing client_email or private_key — use the service-account key file.");
    else {
      resolved = { creds: { projectId: o.project_id || env("FIREBASE_PROJECT_ID") || firebaseClientConfig.projectId || "muhurto-app", clientEmail: o.client_email, privateKey: fixKey(o.private_key) }, problems, source: "FIREBASE_SERVICE_ACCOUNT" };
      return resolved;
    }
  }
  const clientEmail = env("FIREBASE_CLIENT_EMAIL", "FIREBASE_ADMIN_CLIENT_EMAIL");
  const keyRaw = env("FIREBASE_PRIVATE_KEY", "FIREBASE_ADMIN_PRIVATE_KEY");
  const projectId = env("FIREBASE_PROJECT_ID", "FIREBASE_ADMIN_PROJECT_ID") || firebaseClientConfig.projectId || "muhurto-app";
  if (!clientEmail && !keyRaw && !json) problems.push("No Firebase server key found. Add FIREBASE_SERVICE_ACCOUNT (the whole key file) or FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY in Vercel, then redeploy.");
  else if (!json) {
    if (!clientEmail) problems.push("FIREBASE_CLIENT_EMAIL is missing (the client_email value from the key file).");
    else if (!/@.+\.iam\.gserviceaccount\.com$/.test(clientEmail)) problems.push("FIREBASE_CLIENT_EMAIL doesn't look like a service-account email (…@muhurto-app.iam.gserviceaccount.com).");
    if (!keyRaw) problems.push("FIREBASE_PRIVATE_KEY is missing (the private_key value from the key file).");
  }
  const privateKey = keyRaw ? fixKey(keyRaw) : "";
  if (keyRaw && !/-----BEGIN PRIVATE KEY-----[\s\S]+-----END PRIVATE KEY-----/.test(privateKey)) problems.push("FIREBASE_PRIVATE_KEY doesn't look complete — it must include -----BEGIN PRIVATE KEY----- … -----END PRIVATE KEY-----.");
  resolved = { creds: problems.length === 0 && clientEmail && privateKey ? { projectId, clientEmail, privateKey } : null, problems, source: "FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY" };
  return resolved;
}

export function isAdminConfigured(): boolean {
  return Boolean(adminCredentials().creds);
}

let app: App | null = null;
let db: Firestore | null = null;

export function getAdminApp(): App {
  const { creds, problems } = adminCredentials();
  if (!creds) throw new Error(problems[0] ?? "Firebase Admin is not configured.");
  if (app) return app;
  app = getApps()[0] ?? initializeApp({
    credential: cert(creds),
    projectId: creds.projectId,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || firebaseClientConfig.storageBucket,
    databaseURL: firebaseClientConfig.databaseURL,
  });
  return app;
}

/** Realtime Database (live admin alerts and visitor presence). */
export function adminRtdb() {
  return getDatabase(getAdminApp(), firebaseClientConfig.databaseURL);
}

export function adminAuth() {
  return getAuth(getAdminApp());
}

/**
 * The app's database: Firebase Realtime Database, used through a document-store layer (rtdb-store.ts) so
 * every server module reads and writes /bookings, /payments, /users … in Realtime Database.
 * (Typed as the Firestore interface the server code was written against; only that subset is used.)
 */
export function adminDb(): Firestore {
  if (db) return db;
  db = new RtdbStore(adminRtdb(), ServerValue) as unknown as Firestore;
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
