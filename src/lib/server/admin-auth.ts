import "server-only";
import { createHash, pbkdf2Sync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Admin panel sign-in (independent of customer accounts).
 *
 * Default account: admin@muhurto.app — only a one-way verifier of its password is stored here.
 * To change it, set ADMIN_USERNAME and ADMIN_PASSWORD in the hosting environment (Vercel →
 * Settings → Environment Variables); the built-in account is then disabled.
 *
 * The session cookie holds a PBKDF2 derivation of the credentials. The server accepts it only if
 * its SHA-256 matches the verifier, so the verifier in this file cannot be turned into a cookie.
 */
export const ADMIN_COOKIE = "muhurto_admin";
const SALT = Buffer.from("0f8f1c51926d671777e191e5f2f33bad", "hex");
const BUILT_IN = { username: "admin@muhurto.app", verifier: "af4a1baec6f80ff040d5cc9180f46ba55ee4a64287e6d9f896d9aa16495426b2" };

const derive = (username: string, password: string) => pbkdf2Sync(`${username}:${password}`, SALT, 120000, 32, "sha256").toString("hex");
const sha = (s: string) => createHash("sha256").update(s).digest("hex");

function account() {
  const u = process.env.ADMIN_USERNAME?.trim().toLowerCase();
  const p = process.env.ADMIN_PASSWORD;
  if (u && p) return { username: u, verifier: sha(derive(u, p)) };
  return BUILT_IN;
}

const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

/** Returns a session token for valid credentials, or null. */
export function checkCredentials(username: string, password: string): string | null {
  const acc = account();
  const u = username.trim().toLowerCase();
  if (!same(u, acc.username)) return null;
  const token = derive(u, password);
  return same(sha(token), acc.verifier) ? token : null;
}

export function isValidSession(token: string | undefined | null): boolean {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return false;
  return same(sha(token), account().verifier);
}

export async function isAdminRequest(): Promise<boolean> {
  return isValidSession((await cookies()).get(ADMIN_COOKIE)?.value);
}
