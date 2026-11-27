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

/** Realtime Database for the public site (visitor presence). Loaded lazily. */
export async function getRealtimeDb() {
  const a = getFirebaseApp();
  if (!a || !firebaseClientConfig.databaseURL) return null;
  const { getDatabase } = await import("firebase/database");
  return getDatabase(a, firebaseClientConfig.databaseURL);
}

/**
 * A separate Firebase app instance for the admin panel, signed in with a server-issued admin token.
 * Kept apart from customer sign-in so the two never interfere.
 */
let adminApp: FirebaseApp | null = null;
export async function getAdminRealtimeDb() {
  if (!isFirebaseClientConfigured || !firebaseClientConfig.databaseURL) return null;
  adminApp = adminApp ?? (getApps().find((x) => x.name === "muhurto-admin") ?? initializeApp(firebaseClientConfig, "muhurto-admin"));
  const auth = getAuth(adminApp);
  if (!auth.currentUser) {
    const res = await fetch("/api/site/admin-token", { method: "POST", credentials: "same-origin" });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Could not connect the admin panel to Firebase.");
    const { token } = await res.json();
    const { signInWithCustomToken } = await import("firebase/auth");
    await signInWithCustomToken(auth, token);
  }
  const { getDatabase } = await import("firebase/database");
  return getDatabase(adminApp, firebaseClientConfig.databaseURL);
}
