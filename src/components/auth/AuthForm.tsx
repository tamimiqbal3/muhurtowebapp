"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { Button } from "../ui/Button";
import { Notice, Spinner } from "../ui/misc";

function safeNext(next: string | null): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const auth = useAuth();
  const router = useRouter();
  const sp = useSearchParams();
  const next = safeNext(sp.get("next"));
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (auth.user) router.replace(next);
  }, [auth.user, next, router]);

  const disabled = !auth.configured || !auth.serverConfigured;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "login") await auth.signIn(form.email, form.password);
      else {
        if (form.password.length < 8) throw new Error("Please choose a password with at least 8 characters.");
        if (form.phone && !/^(?:\+?880|0)1[3-9]\d{8}$/.test(form.phone.replace(/[\s-]/g, ""))) throw new Error("Enter a valid Bangladeshi mobile number (e.g. 01712345678).");
        await auth.signUp(form);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card w-full max-w-md p-8">
      <h1 className="text-4xl">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
      <p className="bn mt-1 text-gold">{mode === "login" ? "আবার স্বাগতম" : "মুহূর্তে যোগ দিন"}</p>
      {disabled && (
        <Notice tone="warning" className="mt-6" title="Accounts not configured">
          Firebase credentials haven&apos;t been added to this deployment yet, so sign-in is disabled. You can still browse, search, customise and use the AI planner.
        </Notice>
      )}
      <form onSubmit={submit} className="mt-6 space-y-4">
        {mode === "register" && (
          <>
            <label className="block"><span className="label">Full name</span><input className="field" required maxLength={100} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={disabled} /></label>
            <label className="block"><span className="label">Mobile number</span><input className="field" inputMode="tel" placeholder="01XXXXXXXXX" autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} disabled={disabled} /></label>
          </>
        )}
        <label className="block"><span className="label">Email</span><input className="field" type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={disabled} /></label>
        <label className="block"><span className="label">Password</span><input className="field" type="password" required minLength={mode === "register" ? 8 : 1} autoComplete={mode === "login" ? "current-password" : "new-password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} disabled={disabled} /></label>
        {error && <Notice tone="warning">{error}</Notice>}
        {info && <Notice tone="success">{info}</Notice>}
        <Button type="submit" variant="accent" size="lg" className="w-full" disabled={busy || disabled}>{busy ? <Spinner /> : mode === "login" ? "Sign in" : "Create account"}</Button>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs text-muted"><span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" /></div>
      <Button variant="outline" size="lg" className="w-full" disabled={busy || disabled} onClick={async () => { setBusy(true); setError(null); try { await auth.signInWithGoogle(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); } }}>
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.2 14.6 2.2 12 2.2 6.6 2.2 2.2 6.6 2.2 12s4.4 9.8 9.8 9.8c5.7 0 9.4-4 9.4-9.6 0-.6-.1-1.1-.2-1.6H12z" /></svg>
        Continue with Google
      </Button>
      <div className="mt-6 flex flex-wrap justify-between gap-2 text-sm">
        {mode === "login" ? (
          <>
            <Link href={`/register?next=${encodeURIComponent(next)}`} className="font-semibold text-sindoor hover:underline">Create an account</Link>
            <button type="button" className="text-ink-soft hover:text-ink" disabled={disabled} onClick={async () => { setError(null); setInfo(null); if (!form.email) { setError("Enter your email above first."); return; } try { await auth.resetPassword(form.email); setInfo("If an account exists, a reset link is on its way."); } catch (e) { setError((e as Error).message); } }}>Forgot password?</button>
          </>
        ) : (
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-semibold text-sindoor hover:underline">Already have an account? Sign in</Link>
        )}
      </div>
    </div>
  );
}
