import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth, adminDb, COL, isAdminConfigured } from "../firebase/admin";
import type { Role, UserProfile } from "../types";

export const SESSION_COOKIE = "__session";
export const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 5; // 5 days

export interface SessionUser {
  uid: string;
  email: string;
  name: string;
  role: Role;
  profile: UserProfile | null;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  if (!isAdminConfigured()) return null;
  const store = await cookies();
  const cookie = store.get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  try {
    const decoded = await adminAuth().verifySessionCookie(cookie, true);
    const snap = await adminDb().collection(COL.users).doc(decoded.uid).get();
    const profile = snap.exists ? (snap.data() as UserProfile) : null;
    const role: Role = profile?.role ?? "customer";
    return {
      uid: decoded.uid,
      email: decoded.email ?? profile?.email ?? "",
      name: profile?.name || (decoded.name as string | undefined) || decoded.email?.split("@")[0] || "Guest",
      role,
      profile,
    };
  } catch {
    return null;
  }
}

/** For server components: redirect to login if signed out. */
export async function requirePageUser(next: string): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

/** For server components: only allow the given roles (admins always allowed). */
export async function requirePageRole(roles: Role[], next: string): Promise<SessionUser | "forbidden"> {
  const user = await requirePageUser(next);
  if (user.role === "admin" || roles.includes(user.role)) return user;
  return "forbidden";
}

/** For route handlers. */
export async function requireApiUser(): Promise<SessionUser> {
  if (!isAdminConfigured()) throw new ApiError(503, "Accounts are not available yet: Firebase is not configured on the server.");
  const user = await getSessionUser();
  if (!user) throw new ApiError(401, "Please sign in to continue.");
  return user;
}

export async function requireApiRole(...roles: Role[]): Promise<SessionUser> {
  const user = await requireApiUser();
  if (user.role === "admin" || roles.includes(user.role)) return user;
  throw new ApiError(403, "You do not have permission to do this.");
}

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
}
