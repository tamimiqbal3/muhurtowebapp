"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/types";
import { getClientAuth } from "@/lib/firebase/client";
import { isFirebaseClientConfigured } from "@/lib/config";

export interface ClientUser {
  uid: string;
  email: string;
  name: string;
  role: Role;
  phone?: string;
  city?: string;
  photoURL?: string;
}

interface AuthState {
  user: ClientUser | null;
  loading: boolean;
  /** Always false — accounts are real Firebase Authentication users. Kept for older components. */
  demo: boolean;
  configured: boolean;
  serverConfigured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (args: { name: string; email: string; password: string; phone: string }) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

function friendlyAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  const map: Record<string, string> = {
    "auth/invalid-credential": "Email or password is incorrect.",
    "auth/wrong-password": "Email or password is incorrect.",
    "auth/user-not-found": "No account found with this email.",
    "auth/email-already-in-use": "An account with this email already exists. Try signing in.",
    "auth/weak-password": "Please choose a password with at least 8 characters.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
    "auth/popup-closed-by-user": "The sign-in window was closed before finishing.",
    "auth/network-request-failed": "Network error. Check your connection and try again.",
    "auth/operation-not-allowed": "This sign-in method is not enabled yet in Firebase (Authentication → Sign-in method).",
    "auth/unauthorized-domain": "This website's domain is not authorised for sign-in yet (Firebase → Authentication → Settings → Authorized domains).",
    "auth/popup-blocked": "Your browser blocked the Google sign-in window. Please allow pop-ups and try again.",
    "auth/account-exists-with-different-credential": "This email is already registered with a different sign-in method.",
  };
  return map[code] ?? (err instanceof Error ? err.message : "Something went wrong. Please try again.");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<ClientUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [serverConfigured, setServerConfigured] = useState(true);

  /** Server session (role, phone, city) — created from a fresh Firebase ID token. */
  const createSession = useCallback(async (idToken: string, extra?: { name?: string; phone?: string }) => {
    const res = await fetch("/api/auth/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken, ...extra }) });
    if (res.status === 503) { setServerConfigured(false); return false; }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Could not start your session.");
    }
    return true;
  }, []);

  /** Reads the server profile for the signed-in Firebase user. */
  const refresh = useCallback(async () => {
    const auth = getClientAuth();
    const fbUser = auth?.currentUser ?? null;
    if (!fbUser) { setUser(null); setLoading(false); return; }
    const base: ClientUser = { uid: fbUser.uid, email: fbUser.email ?? "", name: fbUser.displayName || (fbUser.email ?? "").split("@")[0], role: "customer", photoURL: fbUser.photoURL ?? undefined };
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      const data = (await res.json()) as { user: ClientUser | null; configured: boolean };
      setServerConfigured(data.configured);
      if (data.configured && !data.user) {
        // The server session has expired while Firebase still remembers the user — try to renew it.
        const ok = await createSession(await fbUser.getIdToken(true)).catch(() => false);
        if (!ok) {
          const { signOut } = await import("firebase/auth");
          await signOut(auth!).catch(() => undefined);
          setUser(null);
          return;
        }
        const again = (await (await fetch("/api/me", { cache: "no-store" })).json()) as { user: ClientUser | null };
        setUser(again.user ? { ...base, ...again.user, photoURL: base.photoURL } : base);
        return;
      }
      setUser(data.user && data.user.uid === fbUser.uid ? { ...base, ...data.user, photoURL: base.photoURL } : base);
    } catch {
      setUser(base);
    } finally {
      setLoading(false);
    }
  }, [createSession]);

  // Firebase Authentication is the single source of truth for who is signed in.
  useEffect(() => {
    const auth = getClientAuth();
    if (!auth) { setLoading(false); return; }
    let unsub = () => {};
    let cancelled = false;
    (async () => {
      const { onAuthStateChanged, getRedirectResult } = await import("firebase/auth");
      // Finish a Google sign-in that used a full-page redirect (mobile / popup blocked).
      try {
        const r = await getRedirectResult(auth);
        if (r?.user) await createSession(await r.user.getIdToken(true));
      } catch {
        /* surfaced on the sign-in page if needed */
      }
      if (cancelled) return;
      unsub = onAuthStateChanged(auth, () => { void refresh(); });
    })();
    return () => { cancelled = true; unsub(); };
  }, [refresh, createSession]);

  const afterSignIn = useCallback(async (idToken: string, extra?: { name?: string; phone?: string }) => {
    await createSession(idToken, extra);
    await refresh();
    router.refresh();
  }, [createSession, refresh, router]);

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      demo: false,
      configured: isFirebaseClientConfigured,
      serverConfigured,
      refresh,
      async signIn(email, password) {
        const auth = getClientAuth();
        if (!auth) throw new Error("Sign-in is not available right now.");
        const { signInWithEmailAndPassword } = await import("firebase/auth");
        try {
          const cred = await signInWithEmailAndPassword(auth, email, password);
          await afterSignIn(await cred.user.getIdToken());
        } catch (e) {
          throw new Error(friendlyAuthError(e));
        }
      },
      async signUp({ name, email, password, phone }) {
        const auth = getClientAuth();
        if (!auth) throw new Error("Registration is not available right now.");
        const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
        try {
          const cred = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(cred.user, { displayName: name });
          await afterSignIn(await cred.user.getIdToken(true), { name, phone });
        } catch (e) {
          throw new Error(friendlyAuthError(e));
        }
      },
      async signInWithGoogle() {
        const auth = getClientAuth();
        if (!auth) throw new Error("Sign-in is not available right now.");
        const { GoogleAuthProvider, signInWithPopup, signInWithRedirect } = await import("firebase/auth");
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });
        try {
          const cred = await signInWithPopup(auth, provider);
          await afterSignIn(await cred.user.getIdToken());
        } catch (e) {
          const code = (e as { code?: string })?.code ?? "";
          // Popups are blocked in some mobile and in-app browsers — use a full-page redirect instead.
          if (code === "auth/popup-blocked" || code === "auth/operation-not-supported-in-this-environment" || code === "auth/cancelled-popup-request") {
            await signInWithRedirect(auth, provider);
            return;
          }
          throw new Error(friendlyAuthError(e));
        }
      },
      async resetPassword(email) {
        const auth = getClientAuth();
        if (!auth) throw new Error("Password reset is not available right now.");
        const { sendPasswordResetEmail } = await import("firebase/auth");
        try {
          await sendPasswordResetEmail(auth, email);
        } catch (e) {
          throw new Error(friendlyAuthError(e));
        }
      },
      async signOut() {
        await fetch("/api/auth/session", { method: "DELETE" }).catch(() => undefined);
        const auth = getClientAuth();
        if (auth) {
          const { signOut } = await import("firebase/auth");
          await signOut(auth).catch(() => undefined);
        }
        setUser(null);
        router.push("/");
        router.refresh();
      },
    }),
    [user, loading, serverConfigured, refresh, afterSignIn, router],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
