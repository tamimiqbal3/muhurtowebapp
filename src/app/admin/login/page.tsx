"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { LogoMark, Wordmark } from "@/components/layout/Logo";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin-auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Sign-in failed.");
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-[#f3f6fb] p-5">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border border-line bg-paper p-7 shadow-[0_30px_60px_-40px_rgb(8_20_48/.5)]">
        <div className="flex items-center gap-3">
          <LogoMark className="h-12 w-12" />
          <div>
            <p><Wordmark className="text-base" /></p>
            <p className="text-xs text-muted">Admin panel</p>
          </div>
        </div>
        <h1 className="mt-6 font-sans text-xl font-semibold">Sign in</h1>
        <label className="mt-5 block"><span className="label">Username</span><input className="field" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} required /></label>
        <label className="mt-4 block"><span className="label">Password</span><input className="field" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        {error && <p className="mt-4 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">{error}</p>}
        <button disabled={busy} className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand text-sm font-semibold text-paper hover:bg-brand/90 disabled:opacity-60">
          <Lock className="h-4 w-4" /> {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
