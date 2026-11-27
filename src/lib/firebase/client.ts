"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { firebaseClientConfig, isFirebaseClientConfigured } from "../config";

let app: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseClientConfigured) return null;
  if (app) return app;
  app = getApps().length ? getApp() : initializeApp(firebaseClientConfig);
  return app;
}

export function getClientAuth(): Auth | null {
  const a = getFirebaseApp();
  return a ? getAuth(a) : null;
}

export function getClientStorage(): FirebaseStorage | null {
  const a = getFirebaseApp();
  return a ? getStorage(a) : null;
}

/**
 * Google Analytics for Firebase. Browser-only, loaded lazily so it never blocks rendering, and only
 * where Analytics is supported (it isn't in some private modes and in-app browsers).
 */
let analyticsStarted = false;
export async function startAnalytics(): Promise<void> {
  if (analyticsStarted || typeof window === "undefined") return;
  const a = getFirebaseApp();
  if (!a || !firebaseClientConfig.measurementId) return;
  analyticsStarted = true;
  try {
    const { initializeAnalytics, isSupported } = await import("firebase/analytics");
    // Page views are logged by us on every route change, so turn off the automatic first one.
    if (await isSupported()) initializeAnalytics(a, { config: { send_page_view: false } });
    else analyticsStarted = false;
  } catch {
    /* analytics is optional */
  }
}

/** Records a page view (the App Router changes pages without a full reload). */
export async function logPageView(path: string): Promise<void> {
  if (!analyticsStarted) return;
  try {
    const { getAnalytics, isSupported, logEvent } = await import("firebase/analytics");
    const a = getFirebaseApp();
    if (a && (await isSupported())) logEvent(getAnalytics(a), "page_view", { page_path: path, page_location: window.location.href, page_title: document.title });
  } catch {
    /* ignore */
  }
}

/* ─── Realtime Database ─────────────────────────────────────────────── */

/**
 * The project's Realtime Database address. The server looks it up from Firebase (it depends on where the
 * database was created); remembered for the browser session.
 */
let dbUrl: Promise<string> | null = null;
function realtimeURL(): Promise<string> {
  if (process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL) return Promise.resolve(firebaseClientConfig.databaseURL);
  dbUrl ??= (async () => {
    try { const u = sessionStorage.getItem("mh.dburl"); if (u) return u; } catch { /* ignore */ }
    try {
      const r = await fetch("/api/site/database");
      const { url } = (await r.json()) as { url?: string };
      if (url && /^https:\/\/[a-z0-9.-]+$/.test(url)) {
        try { sessionStorage.setItem("mh.dburl", url); } catch { /* ignore */ }
        return url;
      }
    } catch { /* fall back */ }
    return firebaseClientConfig.databaseURL;
  })();
  return dbUrl;
}

/** Realtime Database for the public site (live sync, visitor presence). Loaded lazily. */
export async function getRealtimeDb() {
  const a = getFirebaseApp();
  if (!a) return null;
  const [{ getDatabase }, url] = await Promise.all([import("firebase/database"), realtimeURL()]);
  return getDatabase(a, url);
}

/**
 * A separate Firebase app instance for the admin panel, signed in with a server-issued admin token.
 * Kept apart from customer sign-in so the two never interfere.
 */
let adminApp: FirebaseApp | null = null;
export async function getAdminRealtimeDb() {
  if (!isFirebaseClientConfigured) return null;
  adminApp = adminApp ?? (getApps().find((x) => x.name === "muhurto-admin") ?? initializeApp(firebaseClientConfig, "muhurto-admin"));
  const auth = getAuth(adminApp);
  if (!auth.currentUser) {
    const res = await fetch("/api/site/admin-token", { method: "POST", credentials: "same-origin" });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Could not connect the admin panel to Firebase.");
    const { token } = await res.json();
    const { signInWithCustomToken } = await import("firebase/auth");
    await signInWithCustomToken(auth, token);
  }
  const [{ getDatabase }, url] = await Promise.all([import("firebase/database"), realtimeURL()]);
  return getDatabase(adminApp, url);
}
