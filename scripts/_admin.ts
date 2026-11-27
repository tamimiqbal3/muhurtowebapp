// Shared Firebase Admin bootstrap for CLI scripts (reads .env.local / .env).
import { readFileSync, existsSync } from "node:fs";
import { cert, getApps, initializeApp } from "firebase-admin/app";

for (const f of [".env.local", ".env"]) {
  if (!existsSync(f)) continue;
  for (const line of readFileSync(f, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
}

export const DATABASE_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://muhurto-app-default-rtdb.asia-southeast1.firebasedatabase.app";

export function initAdmin() {
  let { FIREBASE_PROJECT_ID = "muhurto-app", FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (raw) {
    const j = JSON.parse(raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8"));
    FIREBASE_PROJECT_ID = j.project_id; FIREBASE_CLIENT_EMAIL = j.client_email; FIREBASE_PRIVATE_KEY = j.private_key;
  }
  if (!FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    console.error("Missing FIREBASE_SERVICE_ACCOUNT (or FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY) in .env.local");
    process.exit(1);
  }
  if (!getApps().length) initializeApp({ databaseURL: DATABASE_URL, credential: cert({ projectId: FIREBASE_PROJECT_ID, clientEmail: FIREBASE_CLIENT_EMAIL, privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n") }) });
}
