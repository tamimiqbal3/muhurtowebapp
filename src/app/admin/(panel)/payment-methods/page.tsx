"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Save } from "lucide-react";
import { saveSettings, useCatalog } from "@/lib/store/catalog";
import { Btn, Card, ImageInput, PageHead } from "@/components/admin/ui";
import { PAYMENT_GROUPS, PAYMENT_METHODS, type PaymentMethodId } from "@/data/payments";
import type { SiteSettings } from "@/lib/site-settings";

export default function AdminPaymentMethods() {
  const data = useCatalog();
  const [s, setS] = useState<SiteSettings>(data.settings);
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => setS(data.settings), [data.settings]);
  const enabled = s.payments.enabled;
  const setPay = (p: Partial<SiteSettings["payments"]>) => setS({ ...s, payments: { ...s.payments, ...p } });
  const move = (id: PaymentMethodId, dir: -1 | 1) => {
    const i = enabled.indexOf(id), j = i + dir;
    if (i < 0 || j < 0 || j >= enabled.length) return;
    const next = [...enabled];
    [next[i], next[j]] = [next[j], next[i]];
    setPay({ enabled: next });
  };
  function save() {
    saveSettings(s);
    setMsg("Saved.");
    setTimeout(() => setMsg(null), 2500);
  }
  return (
    <>
      <PageHead title="Payment methods" subtitle="Choose which SSLCOMMERZ methods appear at checkout and in the footer, set their order and upload each provider's official logo." actions={<Btn onClick={save}><Save className="h-4 w-4" /> Save changes</Btn>} />
      {msg && <p className="mb-4 rounded-xl bg-success/10 px-3 py-2 text-sm text-success">{msg}</p>}
      <div className="space-y-4">
        {PAYMENT_GROUPS.map((g) => (
          <Card key={g.kind}>
            <h2 className="font-sans text-base font-semibold">{g.label}</h2>
            <ul className="mt-3 divide-y divide-line">
              {PAYMENT_METHODS.filter((m) => m.kind === g.kind).map((m) => {
                const on = enabled.includes(m.id);
                return (
                  <li key={m.id} className="flex flex-wrap items-center gap-3 py-3">
                    <input type="checkbox" checked={on} onChange={() => setPay({ enabled: on ? enabled.filter((x) => x !== m.id) : [...enabled, m.id] })} aria-label={`Offer ${m.name}`} className="h-4 w-4" />
                    <span className="w-40 min-w-0 text-sm font-medium">{m.name}{on && <span className="ml-1 text-xs text-muted">#{enabled.indexOf(m.id) + 1}</span>}</span>
                    <div className="min-w-0 flex-1"><ImageInput png value={s.payments.logos[m.id] ?? ""} onChange={(url) => { const logos = { ...s.payments.logos }; if (url) logos[m.id] = url; else delete logos[m.id]; setPay({ logos }); }} /></div>
                    <div className="flex gap-1">
                      <Btn variant="ghost" disabled={!on} onClick={() => move(m.id, -1)}><ArrowUp className="h-4 w-4" /></Btn>
                      <Btn variant="ghost" disabled={!on} onClick={() => move(m.id, 1)}><ArrowDown className="h-4 w-4" /></Btn>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        ))}
      </div>
    </>
  );
}
