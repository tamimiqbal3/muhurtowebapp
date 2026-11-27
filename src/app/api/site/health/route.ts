import { NextResponse } from "next/server";
import { handle } from "@/lib/server/api";
import { ApiError } from "@/lib/server/auth";
import { adminCredentials, adminDb } from "@/lib/firebase/admin";
import { isAdminRequest } from "@/lib/server/admin-auth";

export const dynamic = "force-dynamic";

const has = (n: string) => Boolean(process.env[n]?.trim());

/** Explains a Firestore connection error in plain words. */
function explain(msg: string): string {
  if (/invalid_grant|account not found|invalid jwt|DECODER|private key|PEM/i.test(msg)) return "The private key or client email is wrong — generate a new key in Firebase → Project settings → Service accounts and paste it again.";
  if (/NOT_FOUND|database.*does not exist|5 NOT_FOUND/i.test(msg)) return "Firestore has not been created in this project yet — Firebase → Firestore Database → Create database.";
  if (/PERMISSION_DENIED|7 PERMISSION_DENIED|insufficient permission/i.test(msg)) return "The service account has no access — use a key from Project settings → Service accounts of the muhurto-app project.";
  if (/project/i.test(msg)) return "The project ID doesn't match the key — FIREBASE_PROJECT_ID should be muhurto-app (or leave it out).";
  return msg.slice(0, 300);
}

/**
 * Admin-only diagnostics: which server settings are present (never their values), and whether a real
 * Firestore read succeeds. Shown in the admin panel so setup problems are obvious.
 */
export const GET = handle(async () => {
  if (!(await isAdminRequest())) throw new ApiError(401, "Admin session required.");
  const cred = adminCredentials();
  const found = {
    FIREBASE_SERVICE_ACCOUNT: has("FIREBASE_SERVICE_ACCOUNT") || has("FIREBASE_SERVICE_ACCOUNT_JSON"),
    FIREBASE_PROJECT_ID: has("FIREBASE_PROJECT_ID"),
    FIREBASE_CLIENT_EMAIL: has("FIREBASE_CLIENT_EMAIL"),
    FIREBASE_PRIVATE_KEY: has("FIREBASE_PRIVATE_KEY"),
  };
  let firestore: { ok: boolean; message?: string } = { ok: false, message: cred.problems[0] };
  if (cred.creds) {
    try {
      await adminDb().collection("site").doc("meta").get();
      firestore = { ok: true };
    } catch (e) {
      firestore = { ok: false, message: explain(String((e as Error)?.message ?? e)) };
    }
  }
  return NextResponse.json(
    { configured: Boolean(cred.creds), environment: process.env.VERCEL_ENV ?? "local", source: cred.creds ? cred.source : null, found, problems: cred.problems, firestore },
    { headers: { "Cache-Control": "no-store" } },
  );
});
