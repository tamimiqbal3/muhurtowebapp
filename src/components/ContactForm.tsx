"use client";

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "./ui/Button";
import { Notice } from "./ui/misc";
import { useAuth } from "./auth/AuthProvider";
import { useT } from "./i18n/LanguageProvider";

export function ContactForm({ compact }: { compact?: boolean }) {
  const { user } = useAuth();
  const t = useT();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: compact ? t("Booking support") : "", message: "", website: "" });
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const val = (k: keyof typeof form) => (k === "name" && !form.name && user ? user.name : k === "email" && !form.email && user ? user.email : form[k]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setState("sending");
    setError(null);
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, name: val("name"), email: val("email") }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Could not send your message.");
      setState("sent");
    } catch (err) {
      setError(t(err instanceof Error ? err.message : "Could not send your message."));
      setState("idle");
    }
  }

  if (state === "sent") return <Notice tone="success" title={t("Message received")}>{t("Thank you — our team will get back to you within one working day.")}</Notice>;

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <label><span className="label">{t("Name")} *</span><input className="field" required maxLength={100} value={val("name")} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" /></label>
      <label><span className="label">{t("Email")} *</span><input className="field" type="email" required value={val("email")} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" /></label>
      {!compact && <label><span className="label">{t("Phone")}</span><input className="field" inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" /></label>}
      <label className={compact ? "sm:col-span-2" : ""}><span className="label">{t("Subject")} *</span><input className="field" required maxLength={120} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></label>
      <label className="sm:col-span-2"><span className="label">{t("Message")} *</span><textarea className="field min-h-32" required minLength={10} maxLength={3000} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></label>
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
      {error && <Notice tone="warning" className="sm:col-span-2">{error}</Notice>}
      <div className="sm:col-span-2"><Button type="submit" variant="accent" disabled={state === "sending"}><Send className="h-4 w-4" /> {state === "sending" ? t("Sending…") : t("Send message")}</Button></div>
    </form>
  );
}
