"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { ArrowRight, Check, Minus, Plus, RotateCcw, X } from "lucide-react";
import type { CategorySlug, PlannerRequirements, PlannerResult, Service } from "@/lib/types";
import { CATEGORIES, CITIES } from "@/data/categories";
import { EVENT_SUBS, SUB_LABELS, THEMES } from "@/lib/planner/constants";
import { cityName, localizeCategory, themeName } from "@/data/i18n-data";
import { computeBreakdown, suggestedQuantity, unitLabel } from "@/lib/pricing";
import { formatBDT } from "@/lib/format";
import { usePlan } from "../plan/PlanProvider";
import { useLang } from "../i18n/LanguageProvider";
import { SafeImage } from "../ui/SafeImage";
import { FoodShop } from "../food/FoodShop";
import { useFlyToTarget } from "../food/FlyToTray";
import { RollingNumber } from "../motion/RollingNumber";
import { cn } from "@/lib/utils";

const GUEST_PRESETS = [50, 100, 200, 300, 500, 1000];
const BUDGET_PRESETS = [0, 50_000, 100_000, 300_000, 500_000, 1_000_000];
const BUDGET_MAX = 3_000_000;

interface Pick { qty: number | null; optionIds: string[] }

const serves = (s: Service, city: string | null) => !city || s.city === city || s.serviceAreas.some((a) => a === city || a === "Nationwide");

/**
 * The Event Planner as a planning table: every choice — occasion, details, every service
 * and the food counter — is laid out at once, like spreading brochures and menus on a desk.
 * The receipt on the side adds up live, like a calculator.
 */
export function PlannerBoard({ services, aiEnabled }: { services: Service[]; aiEnabled: boolean }) {
  const { t, lang } = useLang();
  const plan = usePlan();
  const router = useRouter();
  const reduce = useReducedMotion();
  const { launch, layer } = useFlyToTarget();
  const receiptRef = useRef<HTMLDivElement>(null);

  const [category, setCategory] = useState<CategorySlug>("wedding");
  const [date, setDate] = useState("");
  const [city, setCity] = useState<string | null>(null);
  const [guests, setGuests] = useState(200);
  const [budget, setBudget] = useState(0);
  const [theme, setTheme] = useState<string | null>(null);
  const [picks, setPicks] = useState<Record<string, Pick>>({});
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<"suggest" | "read" | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
  const [flash, setFlash] = useState<string | null>(null);
  const [today, setToday] = useState("");
  useEffect(() => setToday(new Date().toISOString().slice(0, 10)), []);

  const cats = useMemo(() => CATEGORIES.map((c) => localizeCategory(c, lang)), [lang]);
  const byId = useMemo(() => new Map(services.map((s) => [s.id, s])), [services]);
  const food = useMemo(() => services.filter((s) => s.categorySlug === "food-culinary"), [services]);
  const rows = useMemo(
    () => (category === "food-culinary" ? [] : EVENT_SUBS.map((sub) => ({ sub, items: services.filter((s) => s.categorySlug === category && s.subcategorySlug === sub) })).filter((r) => r.items.length)),
    [category, services],
  );

  /* ─── Selection ─── */
  const lines = useMemo(
    () =>
      Object.entries(picks).flatMap(([id, p]) => {
        const s = byId.get(id);
        if (!s) return [];
        const q = p.qty ?? suggestedQuantity(s, guests);
        const extra = s.options.filter((o) => p.optionIds.includes(o.id)).reduce((a, o) => a + o.priceDelta, 0);
        return [{ s, q, total: (s.startingPrice + extra) * q }];
      }),
    [picks, byId, guests],
  );
  const est = computeBreakdown(lines.reduce((a, l) => a + l.total, 0));
  const ratio = budget ? est.total / budget : 0;

  function toggle(s: Service, el: HTMLElement | null, single: boolean) {
    setPicks((cur) => {
      if (cur[s.id]) { const { [s.id]: _drop, ...rest } = cur; void _drop; return rest; }
      const next = { ...cur };
      if (single) for (const id of Object.keys(next)) { const o = byId.get(id); if (o && o.categorySlug === s.categorySlug && o.subcategorySlug === s.subcategorySlug) delete next[id]; }
      next[s.id] = { qty: null, optionIds: [] };
      return next;
    });
    if (!picks[s.id]) launch(s.images[0]?.src, el, receiptRef.current);
  }
  const setQty = (id: string, q: number) => setPicks((cur) => (cur[id] ? { ...cur, [id]: { ...cur[id], qty: Math.max(byId.get(id)?.minQuantity ?? 1, Math.min(20000, q)) } } : cur));
  const remove = (id: string) => setPicks((cur) => { const { [id]: _d, ...rest } = cur; void _d; return rest; });

  function chooseCategory(c: CategorySlug) {
    setCategory(c);
    // Keep food picks (food works for every event); drop services from the previous occasion.
    setPicks((cur) => Object.fromEntries(Object.entries(cur).filter(([id]) => byId.get(id)?.categorySlug === "food-culinary" || byId.get(id)?.categorySlug === c)));
    setNotes([]);
  }
  function resetAll() {
    setPicks({}); setNotes([]); setBudget(0); setTheme(null); setDate(""); setCity(null); setGuests(200); setNote("");
  }

  const requirements = (): PlannerRequirements => ({ categorySlug: category, date: date || null, city, budget: budget || null, guests, theme, services: [], preferences: note.trim() || null });

  async function suggest() {
    setBusy("suggest");
    setNotes([]);
    try {
      const res = await fetch("/api/planner", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "recommend", requirements: requirements() }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
      const out = data as PlannerResult;
      const next: Record<string, Pick> = {};
      for (const it of out.items) if (byId.has(it.serviceId)) next[it.serviceId] = { qty: it.quantity, optionIds: it.optionIds ?? [] };
      // Lay the suggestions down one by one, like a planner placing cards on the table.
      setPicks({});
      const ids = Object.keys(next);
      ids.forEach((id, i) => setTimeout(() => setPicks((cur) => ({ ...cur, [id]: next[id] })), reduce ? 0 : 140 * (i + 1)));
      setNotes([out.summary, ...out.notes].filter(Boolean).slice(0, 4));
      setFlash(t("Plan suggested — adjust anything you like"));
    } catch (e) {
      setFlash(t(e instanceof Error ? e.message : "Something went wrong. Please try again."));
    } finally {
      setBusy(null);
      setTimeout(() => setFlash(null), 3200);
    }
  }

  async function readNote(e: FormEvent) {
    e.preventDefault();
    const text = note.trim();
    if (!text) return;
    setBusy("read");
    try {
      const res = await fetch("/api/planner", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "parse", text, requirements: requirements() }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const r = data.requirements as PlannerRequirements;
      if (r.categorySlug && r.categorySlug !== category) chooseCategory(r.categorySlug);
      if (r.city) setCity(r.city);
      if (r.guests) setGuests(r.guests);
      if (r.budget) setBudget(r.budget);
      if (r.date) setDate(r.date);
      if (r.theme) setTheme(r.theme);
      setFlash(t("Got it — your details are filled in"));
    } catch {
      setFlash(t("Couldn't read that note"));
    } finally {
      setBusy(null);
      setTimeout(() => setFlash(null), 3200);
    }
  }

  function book(to: "/booking" | "/customize") {
    if (!lines.length) return;
    plan.clear();
    for (const l of lines) plan.add(l.s, { quantity: l.q, optionIds: picks[l.s.id]?.optionIds ?? [], openDrawer: false });
    plan.setEvent({ categorySlug: category, date: date || undefined, city: city ?? undefined, guests, theme: theme ?? undefined, notes: note.trim() || undefined });
    router.push(to);
  }

  const catName = cats.find((c) => c.slug === category)?.name ?? "";

  return (
    <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
      <div className="space-y-10">
        {/* 1 · Occasion */}
        <Panel step={1} title={t("What are you celebrating?")}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            {cats.map((c, i) => {
              const on = c.slug === category;
              return (
                <motion.button
                  key={c.slug}
                  type="button"
                  onClick={() => chooseCategory(c.slug)}
                  aria-pressed={on}
                  initial={reduce ? false : { opacity: 0, rotateY: -50, y: 20 }}
                  whileInView={{ opacity: 1, rotateY: 0, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 160, damping: 16, delay: i * 0.06 }}
                  whileHover={reduce ? undefined : { y: -6, rotateX: 6 }}
                  whileTap={{ scale: 0.96 }}
                  style={{ transformPerspective: 900 }}
                  className={cn("group relative h-32 overflow-hidden rounded-2xl text-left ring-2 transition-shadow sm:h-36", on ? "shadow-[0_18px_30px_-12px_rgb(1_95_255/.6)] ring-brand" : "ring-transparent shadow-[var(--shadow-soft)]", i === 4 && "col-span-2 sm:col-span-1")}
                >
                  <SafeImage src={c.card.src} alt="" fill sizes="(max-width:640px) 50vw, 20vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <span className={cn("absolute inset-0 transition", on ? "bg-[linear-gradient(180deg,rgb(1_95_255/.15),rgb(1_95_255/.85))]" : "bg-[linear-gradient(180deg,transparent_30%,rgb(10_22_51/.85))]")} />
                  <span className="absolute inset-x-3 bottom-3 font-display text-xl leading-tight text-paper">{c.name}</span>
                  <AnimatePresence>{on && <CheckBadge className="right-2 top-2" />}</AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        </Panel>

        {/* 2 · Details, all visible together */}
        <Panel step={2} title={t("The details")}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={t("Guests")} value={<RollingNumber value={String(guests)} bangla={lang === "bn"} className="font-display text-3xl font-semibold text-brand" />}>
              <input type="range" min={10} max={3000} step={10} value={Math.min(guests, 3000)} onChange={(e) => setGuests(Number(e.target.value))} className="range-brand w-full" aria-label={t("Guests")} />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {GUEST_PRESETS.map((g) => <Chip key={g} on={guests === g} onClick={() => setGuests(g)}>{lang === "bn" ? g.toLocaleString("bn-BD") : g}</Chip>)}
                <Stepper value={guests} onChange={(v) => setGuests(Math.max(10, Math.min(20000, v)))} step={10} label={t("Guests")} />
              </div>
            </Field>
            <Field label={t("Budget")} value={budget ? <RollingNumber value={formatBDT(budget)} bangla={lang === "bn"} className="font-display text-3xl font-semibold text-brand" /> : <span className="font-display text-2xl text-muted">{t("No limit")}</span>}>
              <input type="range" min={0} max={BUDGET_MAX} step={10_000} value={Math.min(budget, BUDGET_MAX)} onChange={(e) => setBudget(Number(e.target.value))} className="range-brand w-full" aria-label={t("Budget")} />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {BUDGET_PRESETS.map((b) => <Chip key={b} on={budget === b} onClick={() => setBudget(b)}>{b === 0 ? t("No limit") : b >= 100_000 ? t("{n} lakh", { n: b / 100_000 }) : t("{n}K", { n: b / 1000 })}</Chip>)}
              </div>
            </Field>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Field label={t("Event date")}>
              <input type="date" min={today || undefined} value={date} onChange={(e) => setDate(e.target.value)} className="h-12 w-full rounded-xl border border-line bg-paper px-3 text-sm font-medium focus:border-brand focus:outline-none" />
            </Field>
              <Field label={t("City")}>
                <select value={city ?? ""} onChange={(e) => setCity(e.target.value || null)} className="h-12 w-full rounded-xl border border-line bg-paper px-3 text-sm font-medium focus:border-brand focus:outline-none">
                  <option value="">{t("Any city")}</option>
                  {CITIES.map((c) => <option key={c} value={c}>{cityName(c, lang)}</option>)}
                </select>
              </Field>
              <Field label={t("Theme")}>
                <select value={theme ?? ""} onChange={(e) => setTheme(e.target.value || null)} className="h-12 w-full rounded-xl border border-line bg-paper px-3 text-sm font-medium focus:border-brand focus:outline-none">
                  <option value="">{t("No preference")}</option>
                  {THEMES.map((th) => <option key={th} value={th}>{themeName(th, lang)}</option>)}
                </select>
              </Field>
          </div>
          <form onSubmit={readNote} className="mt-4 flex flex-col gap-2 rounded-2xl border border-dashed border-brand/40 bg-brand/[0.03] p-3 sm:flex-row sm:items-center">
            <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} placeholder={t("Or just type it: wedding in Rajshahi, 400 guests, 3 lakh")} className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-paper px-3 text-sm focus:border-brand focus:outline-none" aria-label={t("Describe your event")} />
            <button type="submit" disabled={busy !== null || !note.trim()} className="h-11 rounded-xl bg-ink px-4 text-sm font-semibold text-paper transition hover:bg-brand disabled:opacity-40">{busy === "read" ? t("Reading your note…") : t("Fill it in")}</button>
          </form>
        </Panel>

        {/* 3 · Every service, laid out on the table */}
        {rows.length > 0 && (
          <Panel step={3} title={t("Pick your services")} aside={<span className="text-xs text-muted">{t("One per row — tap again to remove")}</span>}>
            <div className="space-y-5">
              {rows.map(({ sub, items }, ri) => {
                return (
                  <motion.div key={`${category}-${sub}`} initial={reduce ? false : { opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: ri * 0.06, type: "spring", stiffness: 160, damping: 20 }} className="grid gap-3 sm:grid-cols-[150px_1fr] sm:items-center">
                    <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-ink-soft uppercase">{t(SUB_LABELS[sub] ?? sub)}</p>
                    <div className="grid grid-cols-1 gap-3 min-[460px]:grid-cols-2">
                      {items.map((s) => <ServiceTile key={s.id} s={s} on={Boolean(picks[s.id])} far={!serves(s, city)} onPick={(el) => toggle(s, el, true)} />)}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Panel>
        )}

        {/* 4 · Food counter */}
        <Panel step={rows.length ? 4 : 3} title={category === "food-culinary" ? t("Pick your food") : t("Add food & drinks")} aside={<span className="text-xs text-muted">{t("Pick as many as you like")}</span>}>
          <FoodShop services={food} picked={(id) => Boolean(picks[id])} onPick={(s, el) => toggle(s, el, false)} />
        </Panel>
      </div>

      {/* ─── Live receipt / calculator ─── */}
      <div ref={receiptRef} className="lg:sticky lg:top-24" id="plan-receipt">
        <div className="overflow-hidden rounded-[28px] bg-[linear-gradient(160deg,#0a1633,#0b2a6f)] p-4 shadow-[0_30px_60px_-25px_rgb(1_95_255/.6)]">
          {/* LCD */}
          <div className="rounded-2xl bg-[linear-gradient(180deg,#dff6ff,#bfeaff)] px-4 py-3 shadow-[inset_0_3px_10px_rgb(0_0_0/.25)]">
            <div className="flex items-center justify-between font-lcd text-[0.68rem] tracking-widest text-[#0b2a6f]/70 uppercase">
              <span>{catName}</span>
              <span>{t("{n} items", { n: lines.length })}</span>
            </div>
            <div className="mt-1 text-right font-lcd text-[2.4rem] leading-none text-[#04205e]">
              <RollingNumber value={formatBDT(est.total)} bangla={lang === "bn"} />
            </div>
            <div className="mt-1 text-right font-lcd text-[0.68rem] tracking-wide text-[#0b2a6f]/70">{t("Estimated total incl. 2% fee")}</div>
          </div>

          {/* Budget meter */}
          {budget > 0 && (
            <div className="mt-3 px-1">
              <div className="flex justify-between text-[0.7rem] font-semibold text-paper/80">
                <span>{t("Budget")} {formatBDT(budget)}</span>
                <span className={ratio > 1 ? "text-[#ff9b9b]" : ratio > 0.85 ? "text-sunflower" : "text-[#7dffb5]"}>{ratio > 1 ? t("Above budget") : t("Within budget")}</span>
              </div>
              <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-paper/15">
                <motion.div className={cn("h-full rounded-full", ratio > 1 ? "bg-[#ff6b6b]" : ratio > 0.85 ? "bg-sunflower" : "bg-[linear-gradient(90deg,#00befe,#7dffb5)]")} animate={{ width: `${Math.min(100, ratio * 100)}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
              </div>
            </div>
          )}

          {/* Paper receipt */}
          <div className="relative mt-4 rounded-t-xl bg-paper px-4 pt-4 pb-6 [mask-image:linear-gradient(#000,#000),radial-gradient(circle_at_8px_100%,transparent_7px,#000_7.5px)] [mask-size:100%_calc(100%-8px),16px_9px] [mask-position:top,bottom] [mask-repeat:no-repeat,repeat-x]">
            <div className="flex items-center gap-2 border-b border-dashed border-line pb-2">
              <p className="text-sm font-semibold">{t("Your plan")}</p>
              {lines.length > 0 && <button type="button" onClick={() => setPicks({})} className="ml-auto inline-flex items-center gap-1 text-xs text-muted hover:text-danger"><RotateCcw className="h-3 w-3" /> {t("Clear")}</button>}
            </div>
            <ul className="max-h-[40vh] overflow-y-auto py-2 lg:max-h-[34vh]">
              <AnimatePresence initial={false}>
                {lines.map((l) => (
                  <motion.li key={l.s.id} layout initial={{ opacity: 0, y: -14, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, x: 40, height: 0 }} transition={{ type: "spring", stiffness: 320, damping: 28 }} className="overflow-hidden">
                    <div className="flex items-start gap-2 py-1.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[0.82rem] font-semibold">{l.s.name}</p>
                        <div className="mt-1 flex items-center gap-2">
                          {l.s.unit === "event" ? (
                            <span className="text-[0.7rem] text-muted">{t("Package")}</span>
                          ) : (
                            <Stepper small value={l.q} onChange={(v) => setQty(l.s.id, v)} step={l.s.unit === "hour" ? 1 : 10} label={l.s.name} />
                          )}
                          {l.s.unit !== "event" && <span className="text-[0.7rem] text-muted">{t(unitLabel(l.s.unit, l.q))}</span>}
                        </div>
                      </div>
                      <span className="pt-0.5 font-lcd text-sm tabular-nums">{formatBDT(l.total)}</span>
                      <button type="button" onClick={() => remove(l.s.id)} className="mt-0.5 grid h-6 w-6 place-items-center rounded-full text-muted hover:bg-sand hover:text-danger" aria-label={t("Remove {name}", { name: l.s.name })}><X className="h-3 w-3" /></button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
              {!lines.length && <li className="py-6 text-center text-sm text-muted">{t("Tap services and dishes on the left — they'll appear here with prices.")}</li>}
            </ul>
            <dl className="space-y-1 border-t border-dashed border-line pt-2 font-lcd text-[0.8rem]">
              <div className="flex justify-between"><dt>{t("Subtotal")}</dt><dd>{formatBDT(est.subtotal)}</dd></div>
              <div className="flex justify-between text-muted"><dt>{t("Platform fee 2%")}</dt><dd>{formatBDT(est.platformFee)}</dd></div>
              <div className="flex justify-between border-t border-ink pt-1 text-base font-semibold"><dt>{t("TOTAL")}</dt><dd>{formatBDT(est.total)}</dd></div>
            </dl>
          </div>

          <AnimatePresence>
            {notes.length > 0 && (
              <motion.ul initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3 space-y-1 overflow-hidden rounded-xl bg-paper/10 p-3 text-[0.75rem] text-paper/85">
                {notes.map((n, i) => <li key={i}>• {t(n)}</li>)}
              </motion.ul>
            )}
          </AnimatePresence>

          <div className="mt-4 grid gap-2">
            <motion.button type="button" onClick={suggest} disabled={busy !== null} whileTap={{ scale: 0.97 }} className="relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-xl bg-paper text-sm font-semibold text-ink transition hover:bg-sand disabled:opacity-60">
              {busy === "suggest" && <motion.span aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgb(0_190_254/.35),transparent)]" animate={{ x: ["-100%", "100%"] }} transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }} />}
              {busy === "suggest" ? t("Calculating…") : budget ? t("Suggest the best plan for my budget") : t("Suggest a plan for me")}
            </motion.button>
            <button type="button" onClick={() => book("/booking")} disabled={!lines.length} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-gradient text-sm font-semibold text-paper shadow-[0_10px_24px_-10px_rgb(0_190_254/.9)] transition hover:brightness-110 disabled:opacity-40">
              {t("Book this plan")} <ArrowRight className="h-4 w-4" />
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => book("/customize")} disabled={!lines.length} className="h-10 rounded-xl border border-paper/25 text-xs font-semibold text-paper transition hover:bg-paper/10 disabled:opacity-40">{t("Customize first")}</button>
              <button type="button" onClick={resetAll} className="h-10 rounded-xl border border-paper/25 text-xs font-semibold text-paper transition hover:bg-paper/10">{t("Start over")}</button>
            </div>
            <p className="pt-1 text-center text-[0.65rem] text-paper/60">{aiEnabled ? t("Suggestions by Gemini AI, priced from real listings.") : t("Suggestions by smart rules, priced from real listings.")} {t("Estimate only. Final prices are confirmed at booking.")}</p>
          </div>
        </div>
      </div>

      {/* Mobile: total always in reach */}
      <div className="fixed inset-x-3 bottom-[88px] z-40 lg:hidden">
        <a href="#plan-receipt" className="flex items-center justify-between rounded-2xl bg-ink/95 px-4 py-3 text-paper shadow-[0_12px_30px_-8px_rgb(1_95_255/.6)] backdrop-blur">
          <span className="text-xs">{t("{n} items", { n: lines.length })}</span>
          <RollingNumber value={formatBDT(est.total)} bangla={lang === "bn"} className="font-lcd text-xl text-sky" />
          <span className="inline-flex items-center gap-1 text-xs font-semibold">{t("View plan")} <ArrowRight className="h-3.5 w-3.5" /></span>
        </a>
      </div>

      <AnimatePresence>
        {flash && (
          <motion.div role="status" initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-40 left-1/2 z-[80] -translate-x-1/2 rounded-full bg-ink px-5 py-2.5 text-sm text-paper shadow-xl lg:bottom-8">
            {flash}
          </motion.div>
        )}
      </AnimatePresence>
      {layer}
    </div>
  );
}

/* ─── Pieces ─── */
function Panel({ step, title, aside, children }: { step: number; title: string; aside?: ReactNode; children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 40, rotateX: 10 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ type: "spring", stiffness: 110, damping: 18 }}
      style={{ transformPerspective: 1200 }}
      className="rounded-[28px] bg-paper p-5 shadow-[var(--shadow-soft)] ring-1 ring-line sm:p-7"
    >
      <header className="mb-5 flex flex-wrap items-center gap-3">
        <span className="font-lcd text-sm tracking-[0.25em] text-brand">{String(step).padStart(2, "0")}</span>
        <h2 className="text-3xl">{title}</h2>
        {aside && <span className="ml-auto">{aside}</span>}
      </header>
      {children}
    </motion.section>
  );
}

function Field({ label, value, children }: { label: string; value?: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-sand/50 p-4 ring-1 ring-line/60">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold tracking-[0.16em] text-ink-soft uppercase">{label}</span>
        {value}
      </div>
      {children}
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <motion.button type="button" onClick={onClick} whileTap={{ scale: 0.92 }} aria-pressed={on} className={cn("h-8 rounded-full px-3 text-xs font-semibold transition", on ? "bg-brand text-paper shadow-[0_6px_14px_-6px_rgb(1_95_255/.9)]" : "bg-paper text-ink-soft ring-1 ring-line hover:ring-brand")}>
      {children}
    </motion.button>
  );
}

function Stepper({ value, onChange, step, label, small }: { value: number; onChange: (v: number) => void; step: number; label: string; small?: boolean }) {
  const { t } = useLang();
  const btn = cn("grid place-items-center rounded-full bg-paper ring-1 ring-line transition hover:bg-brand hover:text-paper hover:ring-brand", small ? "h-6 w-6" : "h-8 w-8");
  return (
    <span className="inline-flex items-center gap-1">
      <button type="button" className={btn} onClick={() => onChange(value - step)} aria-label={t("Decrease {name}", { name: label })}><Minus className="h-3 w-3" /></button>
      <input type="number" inputMode="numeric" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} className={cn("rounded-lg border border-line bg-paper text-center font-semibold tabular-nums", small ? "h-6 w-14 text-[0.72rem]" : "h-8 w-16 text-xs")} aria-label={label} />
      <button type="button" className={btn} onClick={() => onChange(value + step)} aria-label={t("Increase {name}", { name: label })}><Plus className="h-3 w-3" /></button>
    </span>
  );
}

function CheckBadge({ className }: { className?: string }) {
  return (
    <motion.span initial={{ scale: 0, rotate: -120 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 500, damping: 18 }} className={cn("absolute grid h-7 w-7 place-items-center rounded-full bg-paper text-brand shadow-lg", className)}>
      <Check className="h-4 w-4" strokeWidth={3} />
    </motion.span>
  );
}

function ServiceTile({ s, on, far, onPick }: { s: Service; on: boolean; far: boolean; onPick: (el: HTMLElement | null) => void }) {
  const { t } = useLang();
  const reduce = useReducedMotion();
  const img = s.images[0];
  return (
    <motion.button
      type="button"
      onClick={(e) => onPick(e.currentTarget)}
      aria-pressed={on}
      whileHover={reduce ? undefined : { y: -4 }}
      whileTap={{ scale: 0.97 }}
      animate={{ scale: on ? 1.015 : 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 22 }}
      className={cn("group relative flex items-stretch gap-3 overflow-hidden rounded-2xl bg-paper p-2 pr-3 text-left ring-2 transition-shadow", on ? "shadow-[0_14px_26px_-14px_rgb(1_95_255/.8)] ring-brand" : "ring-line hover:ring-sky")}
    >
      <span className="relative h-[74px] w-[86px] shrink-0 overflow-hidden rounded-xl">
        {img && <SafeImage src={img.src} alt="" fill sizes="90px" className="object-cover transition-transform duration-700 group-hover:scale-110" />}
        <AnimatePresence>{on && <CheckBadge className="left-1.5 top-1.5 h-6 w-6" />}</AnimatePresence>
      </span>
      <span className="flex min-w-0 flex-1 flex-col justify-center">
        <span className="line-clamp-2 text-[0.82rem] leading-snug font-semibold">{s.name}</span>
        <span className="mt-1 flex flex-wrap items-baseline gap-x-1">
          <span className={cn("font-display text-lg font-semibold", on ? "text-brand" : "text-ink")}>{formatBDT(s.startingPrice)}</span>
          <span className="text-[0.68rem] text-muted">/ {t(unitLabel(s.unit))}</span>
        </span>
        {far && <span className="mt-0.5 text-[0.65rem] text-warning">{t("Confirm travel to your city")}</span>}
      </span>
      {on && <motion.span aria-hidden className="absolute inset-0 rounded-2xl bg-[linear-gradient(120deg,transparent_40%,rgb(0_190_254/.18)_50%,transparent_60%)]" initial={{ x: "-100%" }} animate={{ x: "100%" }} transition={{ duration: 0.8 }} />}
    </motion.button>
  );
}
