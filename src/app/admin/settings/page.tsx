"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Notice, Skeleton, Spinner } from "@/components/ui/misc";
import { PaymentLogo } from "@/components/payments/PaymentLogo";
import { SiteSettingsProvider } from "@/components/SiteSettingsProvider";
import { PAYMENT_GROUPS, PAYMENT_METHODS, getPaymentMethod, type PaymentMethodId } from "@/data/payments";
import type { SiteSettings } from "@/lib/site-settings";

/** Admin → Site settings: contact details, social links, hero timing, payment methods and their logos. */
export default function AdminSettings() {
  const [s, setS] = useState<SiteSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState<PaymentMethodId | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings").then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error ?? "Could not load settings."); setS(d); }).catch((e) => setError(e.message));
  }, []);

  if (error && !s) return <Notice tone="warning">{error}</Notice>;
  if (!s) return <Skeleton className="h-96" />;

  const patch = <K extends keyof SiteSettings>(k: K, v: Partial<SiteSettings[K]>) => setS({ ...s, [k]: { ...s[k], ...v } });
  const enabled = s.payments.enabled;
  const toggle = (id: PaymentMethodId) => patch("payments", { enabled: enabled.includes(id) ? enabled.filter((x) => x !== id) : [...enabled, id] });
  const move = (id: PaymentMethodId, dir: -1 | 1) => {
    const i = enabled.indexOf(id), j = i + dir;
    if (i < 0 || j < 0 || j >= enabled.length) return;
    const next = [...enabled]; [next[i], next[j]] = [next[j], next[i]];
    patch("payments", { enabled: next });
  };

  async function uploadLogo(id: PaymentMethodId, file: File) {
    setUploading(id); setError(null);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Upload failed.");
      patch("payments", { logos: { ...s!.payments.logos, [id]: d.url } });
    } catch (e) { setError((e as Error).message); } finally { setUploading(null); }
  }

  async function save() {
    setBusy(true); setError(null); setMsg(null);
    try {
      const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Could not save settings.");
      setS(d); setMsg("Settings saved. The live website now uses them.");
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }

  const text = (label: string, value: string, on: (v: string) => void, wide = false) => (
    <label className={wide ? "md:col-span-2" : undefined}><span className="label">{label}</span><input className="field" value={value} onChange={(e) => on(e.target.value)} /></label>
  );

  return (
    <SiteSettingsProvider value={s}>
      <div className="space-y-8 pb-24">
        {error && <Notice tone="warning">{error}</Notice>}
        {msg && <Notice tone="success">{msg}</Notice>}

        <section className="rounded-2xl border border-line bg-paper p-5">
          <h2 className="text-xl">Contact details</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {text("Address (English)", s.contact.address, (v) => patch("contact", { address: v }), true)}
            {text("Address (Bangla)", s.contact.addressBn, (v) => patch("contact", { addressBn: v }), true)}
            {text("Phone", s.contact.phone, (v) => patch("contact", { phone: v }))}
            {text("Email", s.contact.email, (v) => patch("contact", { email: v }))}
            {text("Office hours (English)", s.contact.hours, (v) => patch("contact", { hours: v }))}
            {text("Office hours (Bangla)", s.contact.hoursBn, (v) => patch("contact", { hoursBn: v }))}
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-paper p-5">
          <h2 className="text-xl">Social links</h2>
          <p className="mt-1 text-sm text-muted">Leave a field empty to hide that icon.</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {(["facebook", "instagram", "youtube", "linkedin"] as const).map((k) => text(k[0].toUpperCase() + k.slice(1), s.social[k], (v) => patch("social", { [k]: v }), false))}
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-paper p-5">
          <h2 className="text-xl">Homepage slider</h2>
          <label className="mt-4 block max-w-xs"><span className="label">Time per image (seconds)</span>
            <input type="number" min={0.8} max={10} step={0.1} className="field" value={s.hero.intervalMs / 1000} onChange={(e) => patch("hero", { intervalMs: Math.round(Number(e.target.value) * 1000) })} />
          </label>
        </section>

        <section className="rounded-2xl border border-line bg-paper p-5">
          <h2 className="text-xl">Payment methods</h2>
          <p className="mt-1 text-sm text-muted">Tick the methods to offer at checkout and in “We accept”. Use the arrows to set the order. Upload each provider’s official logo file (PNG, JPEG or WebP, from their brand kit) — it replaces the default.</p>
          {PAYMENT_GROUPS.map((g) => (
            <div key={g.kind} className="mt-5">
              <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">{g.label}</p>
              <ul className="mt-2 divide-y divide-line rounded-xl border border-line">
                {PAYMENT_METHODS.filter((m) => m.kind === g.kind).map((m) => {
                  const on = enabled.includes(m.id);
                  return (
                    <li key={m.id} className="flex flex-wrap items-center gap-3 px-3 py-2.5">
                      <input type="checkbox" checked={on} onChange={() => toggle(m.id)} aria-label={`Offer ${m.name}`} className="h-4 w-4 accent-[#015fff]" />
                      <span className="grid h-8 w-24 place-items-center"><PaymentLogo key={s.payments.logos[m.id] ?? m.id} method={m} size="sm" /></span>
                      <span className="min-w-0 flex-1 text-sm font-medium">{m.name}{on && <span className="ml-2 text-xs text-muted">#{enabled.indexOf(m.id) + 1}</span>}</span>
                      <div className="flex items-center gap-1">
                        <button type="button" className="rounded-full p-2 hover:bg-sand disabled:opacity-30" disabled={!on} aria-label="Move up" onClick={() => move(m.id, -1)}><ArrowUp className="h-4 w-4" /></button>
                        <button type="button" className="rounded-full p-2 hover:bg-sand disabled:opacity-30" disabled={!on} aria-label="Move down" onClick={() => move(m.id, 1)}><ArrowDown className="h-4 w-4" /></button>
                        <label className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full border border-line px-3 text-xs font-medium hover:border-ink/30">
                          {uploading === m.id ? <Spinner /> : <Upload className="h-3.5 w-3.5" />} Logo
                          <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadLogo(m.id, f); e.target.value = ""; }} />
                        </label>
                        {s.payments.logos[m.id] && <button type="button" className="px-2 text-xs text-danger hover:underline" onClick={() => { const l = { ...s.payments.logos }; delete l[m.id]; patch("payments", { logos: l }); }}>Reset</button>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          <p className="mt-3 text-xs text-muted">Order at checkout: {enabled.map((id) => getPaymentMethod(id)?.name).join(" · ") || "none selected"}</p>
        </section>

        <section className="rounded-2xl border border-line bg-paper p-5">
          <h2 className="text-xl">Bank transfer instructions</h2>
          <div className="mt-4 grid gap-4">
            <label><span className="label">English</span><textarea className="field min-h-24" value={s.bankTransfer.instructions} onChange={(e) => patch("bankTransfer", { instructions: e.target.value })} /></label>
            <label><span className="label">Bangla</span><textarea className="field min-h-24" value={s.bankTransfer.instructionsBn} onChange={(e) => patch("bankTransfer", { instructionsBn: e.target.value })} /></label>
          </div>
        </section>

        <div className="sticky bottom-24 z-10 flex justify-end lg:bottom-6">
          <Button size="lg" onClick={save} disabled={busy}>{busy ? <Spinner /> : <><Save className="h-4 w-4" /> Save settings</>}</Button>
        </div>
      </div>
    </SiteSettingsProvider>
  );
}
