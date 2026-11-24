"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CITIES } from "@/data/categories";
import { useAuth } from "../auth/AuthProvider";
import { Button } from "../ui/Button";
import { Badge, Notice } from "../ui/misc";

export function ProfileForm() {
  const { user, refresh, resetPassword } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "", city: "" });
  const [msg, setMsg] = useState<{ tone: "success" | "warning"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (user) setForm({ name: user.name, phone: user.phone ?? "", city: user.city ?? "" });
  }, [user]);
  if (!user) return null;

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Could not save.");
      await refresh();
      setMsg({ tone: "success", text: "Profile updated." });
    } catch (err) {
      setMsg({ tone: "warning", text: err instanceof Error ? err.message : "Could not save." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <form onSubmit={save} className="card grid gap-4 p-6 sm:grid-cols-2">
        <h2 className="text-3xl sm:col-span-2">Profile</h2>
        <label className="sm:col-span-2"><span className="label">Full name</span><input className="field" required maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label><span className="label">Mobile number</span><input className="field" inputMode="tel" placeholder="01XXXXXXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
        <label><span className="label">City</span><input className="field" list="profile-cities" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /><datalist id="profile-cities">{CITIES.map((c) => <option key={c} value={c} />)}</datalist></label>
        {msg && <Notice tone={msg.tone} className="sm:col-span-2">{msg.text}</Notice>}
        <div className="sm:col-span-2"><Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save changes"}</Button></div>
      </form>
      <div className="card space-y-4 p-6">
        <h2 className="text-3xl">Account</h2>
        <p className="text-sm"><span className="text-muted">Email</span><br />{user.email}</p>
        <p className="text-sm"><span className="text-muted">Role</span><br /><Badge tone="ink">{user.role}</Badge></p>
        <Button variant="outline" size="sm" onClick={async () => { try { await resetPassword(user.email); setMsg({ tone: "success", text: "Password reset email sent." }); } catch (e) { setMsg({ tone: "warning", text: (e as Error).message }); } }}>Send password reset email</Button>
      </div>
    </div>
  );
}
