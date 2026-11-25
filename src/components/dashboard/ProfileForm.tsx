"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CITIES } from "@/data/categories";
import { useAuth } from "../auth/AuthProvider";
import { Button } from "../ui/Button";
import { Badge, Notice } from "../ui/misc";
import { useLang } from "../i18n/LanguageProvider";
import { cityName } from "@/data/i18n-data";
import { demoAuth } from "@/lib/demo/store";
import { bdPhone } from "@/lib/validation";

export function ProfileForm() {
  const { user, refresh, resetPassword, demo } = useAuth();
  const { t, lang } = useLang();
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
      if (demo) {
        if (form.name.trim().length < 2) throw new Error("Please enter your full name.");
        demoAuth.update({ name: form.name.trim(), phone: form.phone ? bdPhone(form.phone) : "", city: form.city });
      } else {
        const res = await fetch("/api/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        const d = await res.json();
        if (!res.ok) throw new Error(d.error ?? "Could not save.");
      }
      await refresh();
      setMsg({ tone: "success", text: t("Profile updated.") });
    } catch (err) {
      setMsg({ tone: "warning", text: t(err instanceof Error ? err.message : "Could not save.") });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <form onSubmit={save} className="card grid gap-4 p-6 sm:grid-cols-2">
        <h2 className="text-3xl sm:col-span-2">{t("Profile")}</h2>
        <label className="sm:col-span-2"><span className="label">{t("Full name")}</span><input className="field" required maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label><span className="label">{t("Mobile number")}</span><input className="field" inputMode="tel" placeholder="01XXXXXXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
        <label><span className="label">{t("City")}</span><input className="field" list="profile-cities" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /><datalist id="profile-cities">{CITIES.map((c) => <option key={c} value={c}>{cityName(c, lang)}</option>)}</datalist></label>
        {msg && <Notice tone={msg.tone} className="sm:col-span-2">{msg.text}</Notice>}
        <div className="sm:col-span-2"><Button type="submit" disabled={busy}>{busy ? t("Saving…") : t("Save changes")}</Button></div>
      </form>
      <div className="card space-y-4 p-6">
        <h2 className="text-3xl">{t("Account")}</h2>
        <p className="text-sm"><span className="text-muted">{t("Email")}</span><br />{user.email}</p>
        <p className="text-sm"><span className="text-muted">{t("Role")}</span><br /><Badge tone="ink">{t(user.role)}</Badge>{demo && <Badge tone="gold" className="ml-2">{t("Demo account")}</Badge>}</p>
        {!demo && <Button variant="outline" size="sm" onClick={async () => { try { await resetPassword(user.email); setMsg({ tone: "success", text: t("Password reset email sent.") }); } catch (e) { setMsg({ tone: "warning", text: t((e as Error).message) }); } }}>{t("Send password reset email")}</Button>}
      </div>
    </div>
  );
}
