"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/types";
import { getClientAuth } from "@/lib/firebase/client";
import { isFirebaseClientConfigured } from "@/lib/config";
import { demoAuth } from "@/lib/demo/store";

export interface ClientUser {
  uid: string;
  email: string;
  name: string;
  role: Role;
  phone?: string;
  city?: string;
}

interface AuthState {
  user: ClientUser | null;
  loading: boolean;
  /** True while Firebase isn't connected: accounts live in this browser only. */
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
  };
  return map[code] ?? (err instanceof Error ? err.message : "Something went wrong. Please try again.");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<ClientUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [serverConfigured, setServerConfigured] = useState(true);
  const demo = !isFirebaseClientConfigured || !serverConfigured;

  const refresh = useCallback(async () => {
    if (!isFirebaseClientConfigured) {
      const u = demoAuth.current();
      setUser(u ? { uid: u.uid, email: u.email, name: u.name, role: u.role, phone: u.phone, city: u.city } : null);
      setServerConfigured(false);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      const data = (await res.json()) as { user: ClientUser | null; configured: boolean };
      setServerConfigured(data.configured);
      if (!data.configured) {
        const u = demoAuth.current();
        setUser(u ? { uid: u.uid, email: u.email, name: u.name, role: u.role, phone: u.phone, city: u.city } : null);
      } else setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createSession = useCallback(
    async (idToken: string, extra?: { name?: string; phone?: string }) => {
      const res = await fetch("/api/auth/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken, ...extra }) });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not start your session.");
      }
      await refresh();
      router.refresh();
    },
    [refresh, router],
  );

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      demo,
      configured: isFirebaseClientConfigured,
      serverConfigured,
      refresh,
      async signIn(email, password) {
        if (demo) {
          await demoAuth.signIn(email, password);
          await refresh();
          router.refresh();
          return;
        }
        const auth = getClientAuth();
        if (!auth) throw new Error("Sign-in is not configured yet.");
        const { signInWithEmailAndPassword } = await import("firebase/auth");
        try {
          const cred = await signInWithEmailAndPassword(auth, email, password);
          await createSession(await cred.user.getIdToken());
        } catch (e) {
          throw new Error(friendlyAuthError(e));
        }
      },
      async signUp({ name, email, password, phone }) {
        if (demo) {
          await demoAuth.register(name, email, password, phone);
          await refresh();
          router.refresh();
          return;
        }
        const auth = getClientAuth();
        if (!auth) throw new Error("Registration is not configured yet.");
        const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
        try {
          const cred = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(cred.user, { displayName: name });
          await createSession(await cred.user.getIdToken(true), { name, phone });
        } catch (e) {
          throw new Error(friendlyAuthError(e));
        }
      },
      async signInWithGoogle() {
        if (demo) {
          await demoAuth.signInAsGuest();
          await refresh();
          router.refresh();
          return;
        }
        const auth = getClientAuth();
        if (!auth) throw new Error("Sign-in is not configured yet.");
        const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
        try {
          const cred = await signInWithPopup(auth, new GoogleAuthProvider());
          await createSession(await cred.user.getIdToken());
        } catch (e) {
          throw new Error(friendlyAuthError(e));
        }
      },
      async resetPassword(email) {
        if (demo) {
          if (!demoAuth.exists(email)) throw new Error("No account found with this email.");
          return;
        }
        const auth = getClientAuth();
        if (!auth) throw new Error("Password reset is not configured yet.");
        const { sendPasswordResetEmail } = await import("firebase/auth");
        try {
          await sendPasswordResetEmail(auth, email);
        } catch (e) {
          throw new Error(friendlyAuthError(e));
        }
      },
      async signOut() {
        if (demo) {
          demoAuth.signOut();
          setUser(null);
          router.push("/");
          router.refresh();
          return;
        }
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
    [user, loading, demo, serverConfigured, refresh, createSession, router],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
