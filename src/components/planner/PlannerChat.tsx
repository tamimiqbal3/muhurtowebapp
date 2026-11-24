"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Send, Sparkles, Wand2, RotateCcw, Calendar, MapPin, Wallet, Users, Palette, ListChecks, MessageSquareText, Tag, Bot, ArrowRight, AlertTriangle } from "lucide-react";
import type { CategorySlug, PlannerRequirements, PlannerResult, Service } from "@/lib/types";
import { CATEGORIES, CITIES, getCategory } from "@/data/categories";
import { EVENT_SUBS, FOOD_SUBS, SUB_LABELS, THEMES } from "@/lib/planner/constants";
import { formatBDT, formatDate } from "@/lib/format";
import { unitLabel } from "@/lib/pricing";
import { usePlan } from "../plan/PlanProvider";
import { Button } from "../ui/Button";
import { SafeImage } from "../ui/SafeImage";
import { Badge, Notice, Spinner } from "../ui/misc";
import { cn } from "@/lib/utils";

type StepKey = "categorySlug" | "date" | "city" | "budget" | "guests" | "theme" | "services" | "preferences";
const STEPS: StepKey[] = ["categorySlug", "date", "city", "budget", "guests", "theme", "services", "preferences"];

const QUESTIONS: Record<StepKey, string> = {
  categorySlug: "What are we celebrating?",
  date: "When is the event?",
  city: "Where will it take place?",
  budget: "What's your approximate budget?",
  guests: "Roughly how many guests are you expecting?",
  theme: "Any theme or style in mind?",
  services: "Which services do you need? Pick as many as you like.",
  preferences: "Anything else we should know — dietary needs, timing, rituals, accessibility?",
};

interface Msg {
  id: number;
  role: "assistant" | "user";
  text: string;
}

const empty: PlannerRequirements = { categorySlug: null, date: null, city: null, budget: null, guests: null, theme: null, services: [], preferences: null };

export function PlannerChat({ services, aiEnabled }: { services: Service[]; aiEnabled: boolean }) {
  const router = useRouter();
  const plan = usePlan();
  const [req, setReq] = useState<PlannerRequirements>(empty);
  const [answered, setAnswered] = useState<Set<StepKey>>(new Set());
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: 0, role: "assistant", text: "নমস্কার / আসসালামু আলাইকুম! I'm your MUHURTO planner. Describe your event in a sentence — or answer a few quick questions — and I'll put together a plan from real MUHURTO services." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<PlannerResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(1);

  const current = useMemo(() => STEPS.find((s) => !answered.has(s)) ?? null, [answered]);
  const svcMap = useMemo(() => new Map(services.map((s) => [s.id, s])), [services]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, current, result, busy]);

  const push = (role: Msg["role"], text: string) => setMsgs((m) => [...m, { id: idRef.current++, role, text }]);

  function markFilled(next: PlannerRequirements, extra: StepKey[] = []) {
    setAnswered((prev) => {
      const s = new Set(prev);
      for (const k of STEPS) {
        const v = next[k];
        if (k === "services" ? (v as string[]).length > 0 : v != null && v !== "") s.add(k);
      }
      extra.forEach((k) => s.add(k));
      return s;
    });
  }

  function answer(key: StepKey, value: PlannerRequirements[StepKey], label: string) {
    const next = { ...req, [key]: value } as PlannerRequirements;
    setReq(next);
    push("user", label);
    markFilled(next, [key]);
    setDraft("");
  }

  async function sendFreeText(e?: FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    push("user", text);
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/planner", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "parse", text, requirements: req }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not understand that.");
      const next = data.requirements as PlannerRequirements;
      const learned: string[] = [];
      if (next.categorySlug && next.categorySlug !== req.categorySlug) learned.push(getCategory(next.categorySlug)?.name ?? next.categorySlug);
      if (next.city && next.city !== req.city) learned.push(`in ${next.city}`);
      if (next.date && next.date !== req.date) learned.push(`on ${formatDate(next.date)}`);
      if (next.guests && next.guests !== req.guests) learned.push(`${next.guests} guests`);
      if (next.budget && next.budget !== req.budget) learned.push(`budget ${formatBDT(next.budget)}`);
      if (next.theme && next.theme !== req.theme) learned.push(`“${next.theme}” theme`);
      if (next.services.length > req.services.length) learned.push(next.services.map((s) => SUB_LABELS[s]).join(", "));
      const extra: StepKey[] = [];
      if (current === "preferences") {
        next.preferences = [req.preferences, text].filter(Boolean).join(" · ").slice(0, 1000);
        extra.push("preferences");
      }
      setReq(next);
      markFilled(next, extra);
      push("assistant", learned.length ? `Got it — ${learned.join(", ")}.` : current === "preferences" ? "Noted, thank you." : "Thanks! I couldn't pick out new details from that — the quick options below might help.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function generate() {
    if (!req.categorySlug) return;
    setBusy(true);
    setError(null);
    setResult(null);
    push("assistant", "Putting your plan together from the MUHURTO catalogue…");
    try {
      const res = await fetch("/api/planner", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "recommend", requirements: req }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create a plan.");
      setResult(data as PlannerResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setReq(empty);
    setAnswered(new Set());
    setResult(null);
    setError(null);
    setMsgs((m) => [m[0]]);
  }

  function addAll(goTo: "/customize" | "/booking") {
    if (!result) return;
    for (const it of result.items) {
      const svc = svcMap.get(it.serviceId);
      if (svc) plan.add(svc, { quantity: it.quantity, optionIds: it.optionIds, openDrawer: false });
    }
    plan.setEvent({
      categorySlug: req.categorySlug ?? undefined,
      date: req.date ?? undefined,
      city: req.city ?? undefined,
      guests: req.guests ?? undefined,
      theme: req.theme ?? undefined,
      notes: req.preferences ?? undefined,
    });
    router.push(goTo);
  }

  const today = new Date().toISOString().slice(0, 10);
  const subOptions = req.categorySlug === "food-culinary" ? [...FOOD_SUBS] : [...EVENT_SUBS, ...FOOD_SUBS];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <section className="card flex min-h-[620px] flex-col overflow-hidden" aria-label="Planner conversation">
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-gold-soft"><Sparkles className="h-5 w-5" /></span>
            <div>
              <p className="text-sm font-semibold">MUHURTO Planner</p>
              <p className="text-xs text-muted">{aiEnabled ? "Powered by Gemini · recommends only real listings" : "Smart guided mode · AI key not configured"}</p>
            </div>
          </div>
          <button onClick={reset} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-ink-soft hover:bg-sand"><RotateCcw className="h-3.5 w-3.5" /> Start over</button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-6" aria-live="polite">
          <AnimatePresence initial={false}>
            {msgs.map((m) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed", m.role === "user" ? "rounded-br-md bg-ink text-paper" : "rounded-bl-md bg-sand text-ink")}>{m.text}</div>
              </motion.div>
            ))}
          </AnimatePresence>

          {!result && current && !busy && (
            <motion.div key={current} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <div className="flex"><div className="max-w-[85%] rounded-2xl rounded-bl-md bg-sand px-4 py-3 text-sm font-medium">{QUESTIONS[current]}</div></div>
              <div className="flex flex-wrap gap-2 pl-1">
                {current === "categorySlug" && CATEGORIES.map((c) => <Chip key={c.slug} onClick={() => answer("categorySlug", c.slug, c.name)}>{c.name}</Chip>)}
                {current === "date" && (
                  <form className="flex flex-wrap items-center gap-2" onSubmit={(e) => { e.preventDefault(); if (draft) answer("date", draft, formatDate(draft)); }}>
                    <input type="date" min={today} value={draft} onChange={(e) => setDraft(e.target.value)} className="field h-10 w-auto py-0" aria-label="Event date" />
                    <Button size="sm" type="submit" disabled={!draft}>Set date</Button>
                    <Chip onClick={() => { push("user", "Not decided yet"); setAnswered((s) => new Set(s).add("date")); }}>Not decided yet</Chip>
                  </form>
                )}
                {current === "city" && (
                  <>
                    {CITIES.slice(0, 6).map((c) => <Chip key={c} onClick={() => answer("city", c, c)}>{c}</Chip>)}
                    <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (draft.trim()) answer("city", draft.trim(), draft.trim()); }}>
                      <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Other city" className="field h-9 w-32 py-0 text-xs" aria-label="Other city" />
                    </form>
                  </>
                )}
                {current === "budget" && (
                  <>
                    {[50000, 100000, 300000, 500000, 1000000, 2000000].map((b) => <Chip key={b} onClick={() => answer("budget", b, formatBDT(b))}>{formatBDT(b)}</Chip>)}
                    <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); const n = Number(draft.replace(/\D/g, "")); if (n > 0) answer("budget", n, formatBDT(n)); }}>
                      <input value={draft} onChange={(e) => setDraft(e.target.value)} inputMode="numeric" placeholder="Exact ৳" className="field h-9 w-28 py-0 text-xs" aria-label="Exact budget in taka" />
                    </form>
                  </>
                )}
                {current === "guests" && (
                  <>
                    {[30, 80, 150, 300, 500, 1000].map((g) => <Chip key={g} onClick={() => answer("guests", g, `${g} guests`)}>{g}</Chip>)}
                    <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); const n = Number(draft.replace(/\D/g, "")); if (n > 0) answer("guests", n, `${n} guests`); }}>
                      <input value={draft} onChange={(e) => setDraft(e.target.value)} inputMode="numeric" placeholder="Exact" className="field h-9 w-24 py-0 text-xs" aria-label="Exact guest count" />
                    </form>
                  </>
                )}
                {current === "theme" && (
                  <>
                    {themesFor(req.categorySlug).map((t) => <Chip key={t} onClick={() => answer("theme", t, t)}>{t}</Chip>)}
                    <Chip onClick={() => { push("user", "No particular theme"); setAnswered((s) => new Set(s).add("theme")); }}>No preference</Chip>
                  </>
                )}
                {current === "services" && (
                  <div className="w-full space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {subOptions.map((s) => {
                        const on = req.services.includes(s);
                        return <Chip key={s} active={on} onClick={() => setReq((r) => ({ ...r, services: on ? r.services.filter((x) => x !== s) : [...r.services, s] }))}>{SUB_LABELS[s]}</Chip>;
                      })}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => { push("user", req.services.length ? req.services.map((s) => SUB_LABELS[s]).join(", ") : "Recommend for me"); setAnswered((s) => new Set(s).add("services")); }}>
                        {req.services.length ? "Continue" : "Recommend for me"}
                      </Button>
                    </div>
                  </div>
                )}
                {current === "preferences" && <Chip onClick={() => { push("user", "Nothing else"); setAnswered((s) => new Set(s).add("preferences")); }}>Nothing else — skip</Chip>}
              </div>
            </motion.div>
          )}

          {!result && !current && !busy && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-dashed border-gold/60 bg-gold-soft/30 p-5 text-sm">
              <p className="font-semibold">I have everything I need.</p>
              <p className="mt-1 text-ink-soft">Check your brief on the right, then generate your plan.</p>
              <Button className="mt-4" variant="accent" onClick={generate}><Wand2 className="h-4 w-4" /> Generate my plan</Button>
            </motion.div>
          )}

          {busy && <div className="flex items-center gap-2 text-sm text-muted"><Spinner /> Thinking…</div>}
          {error && <Notice tone="warning">{error}</Notice>}
          {result && <PlanResult result={result} svcMap={svcMap} onAdd={addAll} />}
          <div ref={endRef} />
        </div>

        <form onSubmit={sendFreeText} className="flex items-center gap-2 border-t border-line bg-paper p-3">
          <label className="sr-only" htmlFor="planner-input">Describe your event</label>
          <input
            id="planner-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Wedding reception in Rajshahi for 400 guests, budget 3 lakh"
            className="h-12 min-w-0 flex-1 rounded-full bg-sand/70 px-5 text-sm outline-none focus:ring-2 focus:ring-ink/10"
            maxLength={2000}
          />
          <button type="submit" disabled={!input.trim() || busy} className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-sindoor text-paper transition hover:bg-sindoor-dark disabled:opacity-40" aria-label="Send">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </section>

      <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start" aria-label="Your event brief">
        <div className="card p-5">
          <p className="eyebrow">Your brief</p>
          <ul className="mt-4 space-y-3 text-sm">
            <BriefRow icon={<Tag className="h-4 w-4" />} label="Category" value={req.categorySlug ? getCategory(req.categorySlug)?.name : null} />
            <BriefRow icon={<Calendar className="h-4 w-4" />} label="Date" value={req.date ? formatDate(req.date) : null} />
            <BriefRow icon={<MapPin className="h-4 w-4" />} label="Location" value={req.city} />
            <BriefRow icon={<Wallet className="h-4 w-4" />} label="Budget" value={req.budget ? formatBDT(req.budget) : null} />
            <BriefRow icon={<Users className="h-4 w-4" />} label="Guests" value={req.guests ? String(req.guests) : null} />
            <BriefRow icon={<Palette className="h-4 w-4" />} label="Theme" value={req.theme} />
            <BriefRow icon={<ListChecks className="h-4 w-4" />} label="Services" value={req.services.length ? req.services.map((s) => SUB_LABELS[s]).join(", ") : null} />
            <BriefRow icon={<MessageSquareText className="h-4 w-4" />} label="Preferences" value={req.preferences} />
          </ul>
          <Button className="mt-5 w-full" variant="accent" disabled={!req.categorySlug || busy} onClick={generate}>
            <Wand2 className="h-4 w-4" /> {result ? "Regenerate plan" : "Generate plan now"}
          </Button>
          {!req.categorySlug && <p className="mt-2 text-center text-xs text-muted">Choose a category to generate a plan.</p>}
        </div>
        {!aiEnabled && (
          <Notice tone="info" title="Guided mode">
            The Gemini key isn&apos;t configured on this deployment, so recommendations use MUHURTO&apos;s rule-based planner. Results still come only from real listings.
          </Notice>
        )}
      </aside>
    </div>
  );
}

function themesFor(cat: CategorySlug | null): string[] {
  const map: Partial<Record<CategorySlug, string[]>> = {
    wedding: ["Royal Red & Gold", "Classic Bengali", "Holud Yellow", "Ivory & Blush", "Modern Minimal", "Rustic Jute"],
    birthday: ["Pastel Dream", "Bold & Bright", "Gold & Black", "Jungle Safari", "Under the Sea", "Boho Sunset"],
    "corporate-events": ["Corporate Clean", "Tech Launch", "Gala Night"],
    "family-events": ["Classic Bengali", "Ivory & Blush", "Rustic Jute", "Holud Yellow"],
    "food-culinary": ["Classic Bengali", "Modern Minimal", "Playful"],
  };
  return (cat && map[cat]) || THEMES.slice(0, 6);
}

function Chip({ children, onClick, active }: { children: ReactNode; onClick: () => void; active?: boolean }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={cn("rounded-full border px-3.5 py-2 text-xs font-medium transition", active ? "border-ink bg-ink text-paper" : "border-line bg-paper hover:border-ink")}>
      {children}
    </button>
  );
}

function BriefRow({ icon, label, value }: { icon: ReactNode; label: string; value: string | null | undefined }) {
  return (
    <li className="flex gap-3">
      <span className={cn("mt-0.5", value ? "text-sindoor" : "text-line")}>{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-muted">{label}</p>
        <p className={cn("truncate", value ? "font-medium" : "text-muted/60")}>{value || "—"}</p>
      </div>
    </li>
  );
}

function PlanResult({ result, svcMap, onAdd }: { result: PlannerResult; svcMap: Map<string, Service>; onAdd: (to: "/customize" | "/booking") => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-gold-soft"><Bot className="h-4 w-4" /></span>
        <div className="space-y-2">
          <Badge tone={result.source === "gemini" ? "ink" : "neutral"}>{result.source === "gemini" ? "Gemini recommendation" : "Rule-based recommendation"}</Badge>
          <p className="text-sm leading-relaxed">{result.summary}</p>
        </div>
      </div>
      <ul className="space-y-3">
        {result.items.map((it) => {
          const svc = svcMap.get(it.serviceId);
          return (
            <li key={it.serviceId} className="flex gap-3 rounded-2xl border border-line bg-paper p-3">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-sand">{svc?.images[0] && <SafeImage src={svc.images[0].src} alt="" fill sizes="80px" className="object-cover" />}</div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted">{SUB_LABELS[it.line.subcategorySlug]} · {it.line.vendorName}</p>
                    <a href={`/service/${it.serviceId}`} target="_blank" rel="noreferrer" className="font-semibold hover:text-sindoor">{it.line.serviceName}</a>
                  </div>
                  <p className="text-sm font-semibold">{formatBDT(it.line.lineTotal)}</p>
                </div>
                <p className="mt-1 text-xs text-muted">{formatBDT(it.line.unitPrice)} × {it.line.quantity} {unitLabel(it.line.unit, it.line.quantity)}{it.line.optionLabels.length > 0 && ` · ${it.line.optionLabels.join(", ")}`}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">{it.reason}</p>
                {svc && svc.options.length > 0 && <p className="mt-1 text-[0.7rem] text-muted">{svc.options.length} customisation options available on the Customize page.</p>}
              </div>
            </li>
          );
        })}
      </ul>
      <div className="rounded-2xl bg-sand/70 p-4 text-sm">
        <div className="flex justify-between"><span>Estimated services</span><span>{formatBDT(result.estimate.subtotal)}</span></div>
        <div className="flex justify-between text-ink-soft"><span>Platform fee (2%)</span><span>{formatBDT(result.estimate.platformFee)}</span></div>
        <div className="mt-1 flex justify-between text-base font-semibold"><span>Estimated total</span><span>{formatBDT(result.estimate.total)}</span></div>
        {result.budget != null && (
          <p className={cn("mt-2 inline-flex items-center gap-1.5 text-xs font-semibold", result.withinBudget ? "text-success" : "text-warning")}>
            {!result.withinBudget && <AlertTriangle className="h-3.5 w-3.5" />}
            {result.withinBudget ? `Within your ${formatBDT(result.budget)} budget` : `Above your ${formatBDT(result.budget)} budget`}
          </p>
        )}
        <p className="mt-2 text-[0.7rem] text-muted">Estimated prices from current listings. Prices are confirmed only when you book; vendor availability is confirmed by our team.</p>
      </div>
      {result.notes.length > 0 && (
        <ul className="space-y-1.5 text-xs text-ink-soft">
          {result.notes.map((n, i) => <li key={i} className="flex gap-2"><span className="text-gold">◆</span>{n}</li>)}
        </ul>
      )}
      <div className="flex flex-wrap gap-2">
        <Button variant="accent" onClick={() => onAdd("/booking")}>Book this plan <ArrowRight className="h-4 w-4" /></Button>
        <Button variant="outline" onClick={() => onAdd("/customize")}>Customize first</Button>
      </div>
    </motion.div>
  );
}
