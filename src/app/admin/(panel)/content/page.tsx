"use client";

import { useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { resetCatalog, saveSettings, useCatalog } from "@/lib/store/catalog";
import { Btn, Card, Field, PageHead } from "@/components/admin/ui";
import type { SiteSettings } from "@/lib/site-settings";

export default function AdminContent() {
  const data = useCatalog();
  const [s, setS] = useState<SiteSettings>(data.settings);
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => setS(data.settings), [data.settings]);
  const patch = <K extends keyof SiteSettings>(k: K, v: Partial<SiteSettings[K]>) => setS({ ...s, [k]: { ...s[k], ...v } });
  const text = (k: keyof SiteSettings["content"], label: string, area = false) => (
    <Field label={label} wide={area}>{area ? <textarea className="field min-h-20" value={s.content[k]} onChange={(e) => patch("content", { [k]: e.target.value })} /> : <input className="field" value={s.content[k]} onChange={(e) => patch("content", { [k]: e.target.value })} />}</Field>
  );
  function save() {
    saveSettings(s);
    setMsg("Saved. The website now shows these changes.");
    setTimeout(() => setMsg(null), 3000);
  }
  return (
    <>
      <PageHead title="Website content" subtitle="Homepage text, contact details, social links, slider speed and the support team shown on invoices." actions={<Btn onClick={save}><Save className="h-4 w-4" /> Save changes</Btn>} />
      {msg && <p className="mb-4 rounded-xl bg-success/10 px-3 py-2 text-sm text-success">{msg}</p>}
      <div className="space-y-4">
        <Card>
          <h2 className="font-sans text-base font-semibold">Homepage</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {text("heroTitle", "Headline (English)")}{text("heroTitleBn", "Headline (Bangla)")}
            {text("heroSubtitle", "Intro (English)", true)}{text("heroSubtitleBn", "Intro (Bangla)", true)}
            {text("aboutTitle", "About heading (English)")}{text("aboutTitleBn", "About heading (Bangla)")}
            {text("aboutBody", "About text (English)", true)}{text("aboutBodyBn", "About text (Bangla)", true)}
            <Field label="Time per slide in the homepage film (seconds)"><input className="field" type="number" min={1} max={10} step={0.1} value={s.hero.intervalMs / 1000} onChange={(e) => patch("hero", { intervalMs: Math.round(Number(e.target.value) * 1000) })} /></Field>
          </div>
        </Card>
        <Card>
          <h2 className="font-sans text-base font-semibold">Footer & contact</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {text("footerBlurb", "Footer text (English)", true)}{text("footerBlurbBn", "Footer text (Bangla)", true)}
            <Field label="Address (English)" wide><input className="field" value={s.contact.address} onChange={(e) => patch("contact", { address: e.target.value })} /></Field>
            <Field label="Address (Bangla)" wide><input className="field" value={s.contact.addressBn} onChange={(e) => patch("contact", { addressBn: e.target.value })} /></Field>
            <Field label="Phone"><input className="field" value={s.contact.phone} onChange={(e) => patch("contact", { phone: e.target.value })} /></Field>
            <Field label="Email"><input className="field" value={s.contact.email} onChange={(e) => patch("contact", { email: e.target.value })} /></Field>
            <Field label="Office hours (English)"><input className="field" value={s.contact.hours} onChange={(e) => patch("contact", { hours: e.target.value })} /></Field>
            <Field label="Office hours (Bangla)"><input className="field" value={s.contact.hoursBn} onChange={(e) => patch("contact", { hoursBn: e.target.value })} /></Field>
            {(["facebook", "instagram", "youtube", "linkedin"] as const).map((k) => <Field key={k} label={`${k[0].toUpperCase()}${k.slice(1)} link (empty hides it)`}><input className="field" value={s.social[k]} onChange={(e) => patch("social", { [k]: e.target.value })} /></Field>)}
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between"><h2 className="font-sans text-base font-semibold">Support team (assigned at random on each invoice)</h2><Btn variant="outline" onClick={() => setS({ ...s, supportTeam: [...s.supportTeam, { id: `s${Date.now()}`, name: "", email: "", phone: "" }] })}><Plus className="h-4 w-4" /> Add member</Btn></div>
          <ul className="mt-4 space-y-2">
            {s.supportTeam.map((m, i) => (
              <li key={m.id} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
                {(["name", "email", "phone"] as const).map((k) => <input key={k} className="field !py-2 text-sm" placeholder={k} value={m[k]} onChange={(e) => setS({ ...s, supportTeam: s.supportTeam.map((x, j) => (j === i ? { ...x, [k]: e.target.value } : x)) })} />)}
                <Btn variant="ghost" className="text-danger" onClick={() => setS({ ...s, supportTeam: s.supportTeam.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4" /></Btn>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="font-sans text-base font-semibold">Bank transfer instructions</h2>
          <div className="mt-4 grid gap-4">
            <Field label="English"><textarea className="field min-h-20" value={s.bankTransfer.instructions} onChange={(e) => patch("bankTransfer", { instructions: e.target.value })} /></Field>
            <Field label="Bangla"><textarea className="field min-h-20" value={s.bankTransfer.instructionsBn} onChange={(e) => patch("bankTransfer", { instructionsBn: e.target.value })} /></Field>
          </div>
        </Card>
        <Card>
          <h2 className="font-sans text-base font-semibold">Restore</h2>
          <p className="mt-1 text-sm text-muted">Bring back the original catalogue, content and settings. Bookings and payments are kept.</p>
          <Btn variant="danger" className="mt-3" onClick={() => confirm("Restore the original catalogue and content? Your edits will be lost.") && resetCatalog()}>Restore defaults</Btn>
        </Card>
      </div>
    </>
  );
}
