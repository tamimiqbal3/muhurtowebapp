import { NextResponse } from "next/server";
import { adminAuth, adminDb, COL, isAdminConfigured } from "@/lib/firebase/admin";
import { adminEmails, SESSION_COOKIE, SESSION_MAX_AGE_MS } from "@/lib/server/auth";
import { fail, handle, readJson } from "@/lib/server/api";
import type { Role, UserProfile } from "@/lib/types";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";

export const dynamic = "force-dynamic";

/** Exchanges a fresh Firebase ID token for an httpOnly session cookie. */
export const POST = handle(async (req: Request) => {
  if (!isAdminConfigured()) return fail(503, "Accounts are not available yet: Firebase Admin is not configured on the server.");
  if (!rateLimit(`session:${clientIp(req)}`, 20, 60_000)) return fail(429, "Too many attempts. Please wait a minute.");
  const body = await readJson<{ idToken?: string; name?: string; phone?: string }>(req);
  if (!body.idToken) return fail(400, "Missing token.");
  const decoded = await adminAuth().verifyIdToken(body.idToken, true).catch(() => null);
  if (!decoded) return fail(401, "Your sign-in could not be verified. Please try again.");
  if (Date.now() / 1000 - decoded.auth_time > 5 * 60) return fail(401, "Please sign in again to continue.");

  const db = adminDb();
  const ref = db.collection(COL.users).doc(decoded.uid);
  const snap = await ref.get();
  const now = new Date().toISOString();
  const email = (decoded.email ?? "").toLowerCase();
  const bootstrapAdmin = Boolean(email && decoded.email_verified !== false && adminEmails().includes(email));
  let role: Role = snap.exists ? ((snap.data() as UserProfile).role ?? "customer") : "customer";
  if (bootstrapAdmin) role = "admin";

  if (!snap.exists) {
    const profile: UserProfile = {
      uid: decoded.uid,
      email,
      name: (body.name || decoded.name || email.split("@")[0] || "Guest").toString().slice(0, 100),
      phone: (body.phone || "").toString().slice(0, 20),
      city: "",
      role,
      createdAt: now,
      updatedAt: now,
    };
    await ref.set(profile);
  } else if (bootstrapAdmin && (snap.data() as UserProfile).role !== "admin") {
    await ref.update({ role: "admin", updatedAt: now });
  }
  if ((decoded.role as string | undefined) !== role) await adminAuth().setCustomUserClaims(decoded.uid, { role });

  const cookie = await adminAuth().createSessionCookie(body.idToken, { expiresIn: SESSION_MAX_AGE_MS });
  const res = NextResponse.json({ ok: true, role });
  res.cookies.set(SESSION_COOKIE, cookie, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: SESSION_MAX_AGE_MS / 1000 });
  return res;
});

export const DELETE = handle(async () => {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  return res;
});
