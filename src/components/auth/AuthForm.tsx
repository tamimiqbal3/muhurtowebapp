"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, FlaskConical } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { useT } from "../i18n/LanguageProvider";
import { Button } from "../ui/Button";
import { Notice, Spinner } from "../ui/misc";

function safeNext(next: string | null): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const auth = useAuth();
  const t = useT();
  const router = useRouter();
  const sp = useSearchParams();
  const next = safeNext(sp.get("next"));
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (auth.user) router.replace(next);
  }, [auth.user, next, router]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "login") await auth.signIn(form.email, form.password);
      else {
        if (form.name.trim().length < 2) throw new Error("Please enter your full name.");
        if (form.password.length < 8) throw new Error("Please choose a password with at least 8 characters.");
        if (form.phone && !/^(?:\+?880|0)1[3-9]\d{8}$/.test(form.phone.replace(/[\s-]/g, ""))) throw new Error("Enter a valid Bangladeshi mobile number (e.g. 01712345678).");
        await auth.signUp(form);
      }
    } catch (err) {
      setError(t(err instanceof Error ? err.message : "Something went wrong. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, rotateX: -12, y: 30 }} animate={{ opacity: 1, rotateX: 0, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} style={{ transformPerspective: 1000 }} className="card w-full max-w-md p-8">
      <h1 className="text-4xl">{mode === "login" ? t("Welcome back") : t("Create your account")}</h1>
      <p className="mt-1 text-sm text-ink-soft">{mode === "login" ? t("Sign in to see your bookings and event updates.") : t("Save plans, book services and follow your event.")}</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        {mode === "register" && (
          <>
            <label className="block"><span className="label">{t("Full name")}</span><input className="field" required maxLength={100} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label className="block"><span className="label">{t("Mobile number")}</span><input className="field" inputMode="tel" placeholder="01XXXXXXXXX" autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
          </>
        )}
        <label className="block"><span className="label">{t("Email")}</span><input className="field" type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label className="block">
          <span className="label">{t("Password")}</span>
          <span className="relative block">
            <input className="field pr-12" type={show ? "text" : "password"} required minLength={mode === "register" ? 8 : 1} autoComplete={mode === "login" ? "current-password" : "new-password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? t("Hide password") : t("Show password")} className="absolute inset-y-0 right-3 grid place-items-center text-muted hover:text-ink">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </span>
        </label>
        {error && <Notice tone="warning">{error}</Notice>}
        {info && <Notice tone="success">{info}</Notice>}
        <Button type="submit" variant="accent" size="lg" className="w-full" disabled={busy}>{busy ? <Spinner /> : mode === "login" ? t("Sign in") : t("Create account")}</Button>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs text-muted"><span className="h-px flex-1 bg-line" />{t("or")}<span className="h-px flex-1 bg-line" /></div>
      <Button variant="outline" size="lg" className="w-full" disabled={busy} onClick={async () => { setBusy(true); setError(null); try { await auth.signInWithGoogle(); } catch (e) { setError(t((e as Error).message)); } finally { setBusy(false); } }}>
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.2 14.6 2.2 12 2.2 6.6 2.2 2.2 6.6 2.2 12s4.4 9.8 9.8 9.8c5.7 0 9.4-4 9.4-9.6 0-.6-.1-1.1-.2-1.6H12z" /></svg>
        {auth.demo ? t("Continue as demo guest") : t("Continue with Google")}
      </Button>
      <div className="mt-6 flex flex-wrap justify-between gap-2 text-sm">
        {mode === "login" ? (
          <>
            <Link href={`/register?next=${encodeURIComponent(next)}`} className="font-semibold text-sindoor hover:underline">{t("Create an account")}</Link>
            <button type="button" className="text-ink-soft hover:text-ink" onClick={async () => { setError(null); setInfo(null); if (!form.email) { setError(t("Enter your email above first.")); return; } try { await auth.resetPassword(form.email); setInfo(auth.demo ? t("Demo accounts can't receive emails — create a new demo account if you've forgotten the password.") : t("If an account exists, a reset link is on its way.")); } catch (e) { setError(t((e as Error).message)); } }}>{t("Forgot password?")}</button>
          </>
        ) : (
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-semibold text-sindoor hover:underline">{t("Already have an account? Sign in")}</Link>
        )}
      </div>
    </motion.div>
  );
}
