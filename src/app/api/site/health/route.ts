import { NextResponse } from "next/server";
import { handle } from "@/lib/server/api";
import { ApiError } from "@/lib/server/auth";
import { adminCredentials, adminRtdb } from "@/lib/firebase/admin";
import { firebaseClientConfig } from "@/lib/config";
import { isAdminRequest } from "@/lib/server/admin-auth";

export const dynamic = "force-dynamic";

const has = (n: string) => Boolean(process.env[n]?.trim());

/** Explains a Realtime Database connection error in plain words. */
function explain(msg: string): string {
  if (/invalid_grant|account not found|invalid jwt|DECODER|private key|PEM|credential/i.test(msg)) return "The service-account key is wrong — generate a new key (Project settings → Service accounts) and paste it into FIREBASE_SERVICE_ACCOUNT again.";
  if (/404|not found|Can't determine Firebase Database URL|database URL|namespace/i.test(msg)) return `Realtime Database was not found at ${firebaseClientConfig.databaseURL}. Copy the URL shown at the top of Realtime Database → Data and add it in Vercel as NEXT_PUBLIC_FIREBASE_DATABASE_URL, then redeploy.`;
  if (/permission|denied|401|403/i.test(msg)) return "The service account has no access to this database — use a key from the muhurto-app project.";
  if (/timed out|timeout/i.test(msg)) return `Could not reach Realtime Database at ${firebaseClientConfig.databaseURL} — check the URL (Realtime Database → Data, top of the page).`;
  return msg.slice(0, 300);
}

/**
 * Admin-only diagnostics: which server settings are present (never their values), and whether a real
 * Realtime Database read succeeds.
 */
export const GET = handle(async () => {
  if (!(await isAdminRequest())) throw new ApiError(401, "Admin session required.");
  const cred = adminCredentials();
  const found = {
    FIREBASE_SERVICE_ACCOUNT: has("FIREBASE_SERVICE_ACCOUNT") || has("FIREBASE_SERVICE_ACCOUNT_JSON"),
    FIREBASE_CLIENT_EMAIL: has("FIREBASE_CLIENT_EMAIL"),
    FIREBASE_PRIVATE_KEY: has("FIREBASE_PRIVATE_KEY"),
    NEXT_PUBLIC_FIREBASE_DATABASE_URL: has("NEXT_PUBLIC_FIREBASE_DATABASE_URL"),
  };
  let database: { ok: boolean; message?: string; raw?: string } = { ok: false, message: cred.problems[0] };
  if (cred.creds) {
    try {
      await Promise.race([
        adminRtdb().ref("site/version").once("value"),
        new Promise((_, rej) => setTimeout(() => rej(new Error("timed out")), 8000)),
      ]);
      database = { ok: true };
    } catch (e) {
      const raw = String((e as Error)?.message ?? e);
      database = { ok: false, message: explain(raw), raw: raw.slice(0, 400) };
    }
  }
  return NextResponse.json(
    { configured: Boolean(cred.creds), environment: process.env.VERCEL_ENV ?? "local", project: cred.creds?.projectId ?? null, databaseURL: firebaseClientConfig.databaseURL, found, problems: cred.problems, database },
    { headers: { "Cache-Control": "no-store" } },
  );
});
