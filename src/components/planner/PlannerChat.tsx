"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, Check, RotateCcw, Sparkles, X } from "lucide-react";
import { LogoMark } from "../layout/Logo";
import { useLang } from "../i18n/LanguageProvider";
import { usePlan } from "../plan/PlanProvider";
import { activeServices, findService, useCatalog } from "@/lib/store/catalog";
import { localizeCategory } from "@/data/i18n-data";
import { emptyRequirements, parseRequirementsFallback } from "@/lib/planner/parse";
import { recommendByRules } from "@/lib/planner/recommend";
import { DEFAULT_SUBS, EVENT_SUBS, FOOD_SUBS, SUB_LABELS } from "@/lib/planner/constants";
import { blocksOf50, computeBreakdown, lineAmount, priceSuffix } from "@/lib/pricing";
import { formatBDT, formatDate } from "@/lib/format";
import type { PlannerRequirements } from "@/lib/types";
import { cn } from "@/lib/utils";

type Step = "occasion" | "guests" | "budget" | "date" | "area" | "venue" | "services" | "food" | "notes" | "plan";
interface Msg { id: number; from: "bot" | "user"; text: string }
interface Draft extends PlannerRequirements { area: string | null; venue: string | null; venueHelp: boolean; notes: string; foodAsked: boolean; servicesAsked: boolean; budgetAsked: boolean; dateAsked: boolean; venueAsked: boolean; notesAsked: boolean }
interface PlanLine { serviceId: string; quantity: number }

const ORDER: Step[] = ["occasion", "guests", "budget", "date", "area", "venue", "services", "food", "notes", "plan"];
const BUDGETS: Array<[string, number | null]> = [["Under ৳1 lakh", 100000], ["৳1–3 lakh", 300000], ["৳3–5 lakh", 500000], ["৳5–10 lakh", 1000000], ["Above ৳10 lakh", 1500000], ["No fixed budget", null]];
const FOOD_CHOICES: Array<[string, string]> = [["Platter / full meal", "platter"], ["Fuchka & chotpoti", "fuchka"], ["Cha & coffee", "cha-coffee"]];

let nextId = 1;

function initial(): Draft {
  return { ...emptyRequirements(), city: "Dhaka", area: null, venue: null, venueHelp: false, notes: "", foodAsked: false, servicesAsked: false, budgetAsked: false, dateAsked: false, venueAsked: false, notesAsked: false };
}

/** Conversational planner: asks one thing at a time, understands free text, and builds a priced plan from the catalogue. */
export function PlannerChat({ onClose, onBooked }: { onClose?: () => void; onBooked?: () => void }) {
  const { t, lang } = useLang();
  const router = useRouter();
  const plan = usePlan();
  const data = useCatalog();
  const services = useMemo(() => activeServices(data), [data]);
  const areas = data.locations.filter((l) => l.active);
  const [draft, setDraft] = useState<Draft>(initial);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [text, setText] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [lines, setLines] = useState<PlanLine[] | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const catName = (slug: string | null) => {
    const c = data.categories.find((x) => x.slug === slug);
    return c ? localizeCategory(c, lang).name : "";
  };
  const subLabel = (sub: string) => {
    const c = data.categories.find((x) => x.subcategories.some((s) => s.slug === sub));
    const s = c ? localizeCategory(c, lang).subcategories.find((x) => x.slug === sub) : undefined;
    return s?.name ?? t(SUB_LABELS[sub] ?? sub);
  };
  const areaName = (name: string | null) => {
    const a = areas.find((x) => x.name === name);
    return a ? (lang === "bn" ? a.nameBn : a.name) : name ?? "";
  };

  const step: Step = useMemo(() => {
    if (lines) return "plan";
    if (!draft.categorySlug) return "occasion";
    if (!draft.guests) return "guests";
    if (!draft.budgetAsked && draft.budget == null) return "budget";
    if (!draft.dateAsked && !draft.date) return "date";
    if (!draft.area) return "area";
    if (!draft.venueAsked) return "venue";
    if (!draft.servicesAsked) return "services";
    if (!draft.foodAsked && draft.categorySlug !== "food-culinary" && !draft.services.some((s) => (FOOD_SUBS as readonly string[]).includes(s))) return "food";
    if (!draft.notesAsked) return "notes";
    return "plan";
  }, [draft, lines]);

  function question(s: Step, d: Draft): string {
    switch (s) {
      case "occasion": return t("What are you celebrating?");
      case "guests": return t("How many guests are you expecting?");
      case "budget": return t("What is your overall budget? I will keep the plan within it.");
      case "date": return t("When is the event? Pick a date, or tell me if it is not decided yet.");
      case "area": return t("Which area of Dhaka will it be in?");
      case "venue": return t("Do you already have a venue?");
      case "services": return t("Which services would you like for your {occasion}? Choose as many as you need, or let me pick the essentials.", { occasion: catName(d.categorySlug) });
      case "food": return t("Would you like food and drinks for your guests?");
      case "notes": return t("Anything else I should know — a theme, colours, timings or special requests?");
      default: return "";
    }
  }

  function say(texts: string[]) {
    setTyping(true);
    setTimeout(() => {
      setMsgs((m) => [...m, ...texts.filter(Boolean).map((x) => ({ id: nextId++, from: "bot" as const, text: x }))]);
      setTyping(false);
    }, 450);
  }

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    say([t("Hello! I am Shubho, your celebration planner. I will help you plan your event in Dhaka step by step."), t("You can tap an answer or simply type, for example: “Wedding for 200 guests in Gulshan on 14 February, budget 5 lakh”."), question("occasion", draft)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the newest message in view by scrolling only the message list — never the page.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [msgs, typing, lines]);

  /** Apply an update, acknowledge it and ask the next question (or build the plan). */
  function advance(next: Draft, ack?: string) {
    setDraft(next);
    const nextStep = (() => {
      if (!next.categorySlug) return "occasion";
      if (!next.guests) return "guests";
      if (!next.budgetAsked && next.budget == null) return "budget";
      if (!next.dateAsked && !next.date) return "date";
      if (!next.area) return "area";
      if (!next.venueAsked) return "venue";
      if (!next.servicesAsked) return "services";
      if (!next.foodAsked && next.categorySlug !== "food-culinary" && !next.services.some((s) => (FOOD_SUBS as readonly string[]).includes(s))) return "food";
      if (!next.notesAsked) return "notes";
      return "plan";
    })() as Step;
    if (nextStep === "plan") return build(next, ack);
    setPicked([]);
    say([ack ?? "", question(nextStep, next)]);
  }

  function build(d: Draft, ack?: string) {
    const isFood = (x: string) => (FOOD_SUBS as readonly string[]).includes(x);
    const noFood = d.foodAsked && !d.services.some(isFood) && d.categorySlug !== "food-culinary";
    const svc = noFood && !d.services.length ? (DEFAULT_SUBS[d.categorySlug ?? "wedding"] ?? DEFAULT_SUBS.wedding).filter((x) => !isFood(x)) : d.services;
    const req: PlannerRequirements = { ...d, services: svc, city: "Dhaka" };
    const rec = recommendByRules(req, services, (k, v) => t(k, v), () => areaName(d.area));
    const ls = rec.items.map((i) => ({ serviceId: i.serviceId, quantity: i.quantity }));
    setLines(ls);
    setNotes(rec.notes);
    say([ack ?? "", ls.length ? t("Here is a plan for your {occasion}. You can remove anything you don't need, then book it in one step.", { occasion: catName(d.categorySlug) }) : t("I could not find matching services right now. Please try different services or contact our team.")]);
  }

  function userSays(textValue: string) {
    setMsgs((m) => [...m, { id: nextId++, from: "user", text: textValue }]);
  }

  function handleText(raw: string) {
    const input = raw.trim();
    if (!input) return;
    userSays(input);
    if (/^(start over|restart|reset|আবার শুরু)/i.test(input)) return restart();
    const parsed = parseRequirementsFallback(input, draft);
    const next: Draft = { ...draft, ...parsed, city: "Dhaka" };
    const lower = input.toLowerCase();
    const area = areas.find((a) => lower.includes(a.name.toLowerCase()) || input.includes(a.nameBn));
    if (area) next.area = area.name;
    if (!parsed.categorySlug || parsed.categorySlug === draft.categorySlug) {
      const byName = data.categories.find((c) => lower.includes(c.name.toLowerCase()) || input.includes(c.nameBn));
      if (byName) next.categorySlug = byName.slug;
    }
    const bare = Number(input.replace(/[^\d]/g, ""));
    if (step === "guests" && !parsed.guests && bare > 0 && bare < 20000) next.guests = bare;
    if (step === "budget") {
      next.budgetAsked = true;
      if (!parsed.budget && bare >= 1000) next.budget = bare;
    }
    if (step === "date") next.dateAsked = true;
    if (step === "venue") {
      next.venueAsked = true;
      if (!/^(no|না|nope)/i.test(input)) next.venue = input.slice(0, 120);
      else next.venueHelp = true;
    }
    if (step === "services" && parsed.services.length) next.servicesAsked = true;
    if (step === "food") next.foodAsked = true;
    if (step === "notes") {
      next.notesAsked = true;
      if (!/^(no|nothing|না|none)\b/i.test(input)) next.notes = input.slice(0, 600);
    }
    if (parsed.services.length > draft.services.length) next.servicesAsked = true;
    const understood: string[] = [];
    if (next.categorySlug && next.categorySlug !== draft.categorySlug) understood.push(catName(next.categorySlug));
    if (next.guests && next.guests !== draft.guests) understood.push(t("{n} guests", { n: next.guests }));
    if (next.budget && next.budget !== draft.budget) understood.push(t("budget {amount}", { amount: formatBDT(next.budget) }));
    if (next.date && next.date !== draft.date) understood.push(formatDate(next.date, undefined, lang));
    if (next.area && next.area !== draft.area) understood.push(areaName(next.area));
    if (parsed.city && parsed.city !== "Dhaka" && !area) return advance(next, t("MUHURTO currently serves Dhaka only. Please choose an area in Dhaka."));
    const ack = understood.length ? t("Noted: {list}.", { list: understood.join(" · ") }) : step === "notes" || step === "venue" || step === "food" ? t("Thank you, noted.") : t("Sorry, I didn't catch that. You can tap one of the options below.");
    advance(next, ack);
  }

  function pickOccasion(slug: string) {
    userSays(catName(slug));
    advance({ ...draft, categorySlug: slug }, t("Wonderful — a {occasion}.", { occasion: catName(slug) }));
  }
  function pickGuests(n: number) {
    userSays(t("{n} guests", { n }));
    advance({ ...draft, guests: n }, t("{n} guests — noted.", { n }));
  }
  function pickBudget(label: string, v: number | null) {
    userSays(t(label));
    advance({ ...draft, budget: v, budgetAsked: true }, v ? t("I will keep the plan around {amount}.", { amount: formatBDT(v) }) : t("No problem — I will suggest a balanced plan."));
  }
  function pickDate(v: string | null) {
    userSays(v ? formatDate(v, undefined, lang) : t("Not decided yet"));
    advance({ ...draft, date: v, dateAsked: true }, v ? t("Saved the date.") : t("That's fine — you can set the date when booking."));
  }
  function pickArea(name: string) {
    userSays(areaName(name));
    advance({ ...draft, area: name }, t("{area}, Dhaka — our partners cover it.", { area: areaName(name) }));
  }
  function pickVenue(have: boolean) {
    userSays(have ? t("Yes, I have a venue") : t("Please help me find one"));
    if (have) {
      setDraft({ ...draft, venueAsked: false });
      say([t("Great — please type the venue name and address.")]);
      setText("");
      return;
    }
    advance({ ...draft, venueAsked: true, venueHelp: true }, t("Our team will suggest suitable venues in {area} after you book.", { area: areaName(draft.area) }));
  }
  function confirmServices(essentials: boolean) {
    const chosen = essentials ? [] : picked;
    userSays(essentials ? t("Pick the essentials for me") : chosen.map(subLabel).join(", "));
    advance({ ...draft, services: chosen, servicesAsked: true }, essentials ? t("I will choose the essentials for this occasion.") : t("Got it."));
  }
  function confirmFood(subs: string[]) {
    userSays(subs.length ? subs.map(subLabel).join(", ") : t("No food needed"));
    const base = draft.services.length ? draft.services : [];
    advance({ ...draft, services: subs.length ? Array.from(new Set([...base, ...(base.length ? [] : essentialsFor(draft.categorySlug)), ...subs])) : base, foodAsked: true }, subs.length ? t("Food added.") : t("No food — understood."));
  }
  function essentialsFor(cat: string | null): string[] {
    return cat === "food-culinary" ? [] : ["decor", "photography-videography", "lighting"];
  }
  function skipNotes() {
    userSays(t("No, show my plan"));
    advance({ ...draft, notesAsked: true });
  }
  function restart() {
    setDraft(initial());
    setLines(null);
    setNotes([]);
    setPicked([]);
    setMsgs([]);
    say([t("Let's start again."), question("occasion", initial())]);
  }

  function book() {
    if (!lines) return;
    plan.clear();
    for (const l of lines) {
      const s = findService(data, l.serviceId);
      if (s) plan.add(s, { quantity: l.quantity, optionIds: [], openDrawer: false });
    }
    plan.setEvent({ categorySlug: draft.categorySlug ?? undefined, guests: draft.guests ?? undefined, date: draft.date ?? undefined, city: draft.area ?? undefined, venue: draft.venue ?? undefined, theme: draft.theme ?? undefined, notes: [draft.notes, draft.venueHelp ? "Please suggest a venue." : ""].filter(Boolean).join(" ") });
    onBooked?.();
    router.push("/booking");
  }

  const priced = (lines ?? []).map((l) => {
    const s = findService(data, l.serviceId)!;
    return s ? { s, q: l.quantity, total: lineAmount(s.unit, s.startingPrice, l.quantity) } : null;
  }).filter(Boolean) as Array<{ s: NonNullable<ReturnType<typeof findService>>; q: number; total: number }>;
  const estimate = computeBreakdown(priced.reduce((a, b) => a + b.total, 0));
  const subsFor = (cat: string | null) => {
    const c = data.categories.find((x) => x.slug === cat);
    const own = c?.subcategories.map((s) => s.slug) ?? [...EVENT_SUBS];
    return cat === "food-culinary" ? own : own.filter((s) => !(FOOD_SUBS as readonly string[]).includes(s));
  };

  const chip = "inline-flex min-h-10 items-center justify-center rounded-full border border-brand/25 bg-paper px-4 text-sm font-medium text-brand transition hover:border-brand hover:bg-brand hover:text-paper";
  const today = new Date().toISOString().slice(0, 10);

  function submit(e: FormEvent) {
    e.preventDefault();
    const v = text;
    setText("");
    handleText(v);
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-paper">
      <div className="flex items-center gap-3 border-b border-line bg-[linear-gradient(120deg,#015fff,#00befe)] px-5 py-4 text-paper">
        <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-paper"><LogoMark className="h-9 w-9" /><span className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-paper bg-emerald-400" /></span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{t("Shubho")}</p>
          <p className="truncate text-xs text-paper/85">{t("Your celebration planner · online")}</p>
        </div>
        <button onClick={restart} title={t("Start over")} aria-label={t("Start over")} className="grid h-9 w-9 place-items-center rounded-full bg-paper/15 hover:bg-paper/25"><RotateCcw className="h-4 w-4" /></button>
        {onClose && <button onClick={onClose} aria-label={t("Close")} className="grid h-9 w-9 place-items-center rounded-full bg-paper/15 hover:bg-paper/25"><X className="h-4 w-4" /></button>}
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-[#f6f8fc] px-4 py-5" aria-live="polite">
        {msgs.map((m) => (
          <div key={m.id} className={cn("flex", m.from === "user" ? "justify-end" : "justify-start")}>
            <p className={cn("max-w-[85%] rounded-2xl px-4 py-2.5 text-[0.95rem] leading-relaxed", m.from === "user" ? "rounded-br-md bg-brand text-paper" : "rounded-bl-md bg-paper text-ink shadow-[0_1px_0_rgb(0_0_0/.04)] ring-1 ring-line")}>{m.text}</p>
          </div>
        ))}
        {typing && (
          <div className="flex"><span className="inline-flex gap-1 rounded-2xl rounded-bl-md bg-paper px-4 py-3 ring-1 ring-line">{[0, 1, 2].map((i) => <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" style={{ animationDelay: `${i * 120}ms` }} />)}</span></div>
        )}

        {lines && !typing && (
          <div className="rounded-2xl bg-paper p-4 ring-1 ring-line sm:p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold">{t("Your plan")} · {catName(draft.categorySlug)}</p>
              <p className="text-xs text-muted">{[draft.guests && t("{n} guests", { n: draft.guests }), draft.date && formatDate(draft.date, undefined, lang), draft.area && `${areaName(draft.area)}, ${t("Dhaka")}`].filter(Boolean).join(" · ")}</p>
            </div>
            <ul className="mt-3 divide-y divide-line">
              {priced.map(({ s, q, total }) => (
                <li key={s.id} className="flex items-start gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{lang === "bn" ? s.nameBn || s.name : s.name}</p>
                    <p className="text-xs text-muted">{subLabel(s.subcategorySlug)} · {formatBDT(s.startingPrice)} {t(priceSuffix(s.unit))} × {s.unit === "per50" ? blocksOf50(q) : q}</p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold">{formatBDT(total)}</p>
                  <button aria-label={t("Remove")} onClick={() => setLines((ls) => (ls ?? []).filter((x) => x.serviceId !== s.id))} className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted hover:bg-sand hover:text-danger"><X className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
            <dl className="mt-2 space-y-1 border-t border-line pt-3 text-sm">
              <div className="flex justify-between text-ink-soft"><dt>{t("Services")}</dt><dd>{formatBDT(estimate.subtotal)}</dd></div>
              <div className="flex justify-between text-ink-soft"><dt>{t("Platform fee (2%)")}</dt><dd>{formatBDT(estimate.platformFee)}</dd></div>
              <div className="flex justify-between text-base font-semibold"><dt>{t("Estimated total")}</dt><dd>{formatBDT(estimate.total)}</dd></div>
              {draft.budget ? <p className={cn("pt-1 text-xs", estimate.total <= draft.budget ? "text-success" : "text-danger")}>{estimate.total <= draft.budget ? t("Within your budget of {amount}.", { amount: formatBDT(draft.budget) }) : t("Above your budget of {amount} — remove an item or ask our team.", { amount: formatBDT(draft.budget) })}</p> : null}
            </dl>
            {notes.length > 0 && <ul className="mt-3 space-y-1 text-xs text-muted">{notes.map((n) => <li key={n}>{n}</li>)}</ul>}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button onClick={book} disabled={!priced.length} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-paper hover:bg-brand/90 disabled:opacity-50"><Check className="h-4 w-4" /> {t("Book this plan")}</button>
              <button onClick={() => { setLines(null); setDraft({ ...draft, servicesAsked: false, foodAsked: false, notesAsked: true }); say([question("services", draft)]); }} className="inline-flex min-h-11 items-center justify-center rounded-full border border-line px-5 text-sm font-semibold hover:border-ink">{t("Change services")}</button>
            </div>
          </div>
        )}
      </div>

      {!typing && step !== "plan" && (
        <div className="max-h-[38%] shrink-0 overflow-y-auto border-t border-line bg-paper px-4 pt-3">
          <div className="scrollbar-none flex flex-wrap gap-2 pb-3">
            {step === "occasion" && data.categories.map((c) => <button key={c.slug} className={chip} onClick={() => pickOccasion(c.slug)}>{localizeCategory(c, lang).name}</button>)}
            {step === "guests" && [50, 100, 150, 200, 300, 500].map((n) => <button key={n} className={chip} onClick={() => pickGuests(n)}>{t("{n} guests", { n })}</button>)}
            {step === "budget" && BUDGETS.map(([l, v]) => <button key={l} className={chip} onClick={() => pickBudget(l, v)}>{t(l)}</button>)}
            {step === "date" && (
              <>
                <input type="date" min={today} className="field !w-auto !py-2" onChange={(e) => e.target.value && pickDate(e.target.value)} aria-label={t("Event date")} />
                <button className={chip} onClick={() => pickDate(null)}>{t("Not decided yet")}</button>
              </>
            )}
            {step === "area" && <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto">{areas.map((a) => <button key={a.id} className={chip} onClick={() => pickArea(a.name)}>{lang === "bn" ? a.nameBn : a.name}</button>)}</div>}
            {step === "venue" && (
              <>
                <button className={chip} onClick={() => pickVenue(true)}>{t("Yes, I have a venue")}</button>
                <button className={chip} onClick={() => pickVenue(false)}>{t("Please help me find one")}</button>
              </>
            )}
            {step === "services" && (
              <>
                {subsFor(draft.categorySlug).map((s) => {
                  const on = picked.includes(s);
                  return <button key={s} aria-pressed={on} className={cn(chip, on && "border-brand bg-brand text-paper")} onClick={() => setPicked((p) => (on ? p.filter((x) => x !== s) : [...p, s]))}>{on && <Check className="mr-1 h-3.5 w-3.5" />}{subLabel(s)}</button>;
                })}
                <button className={cn(chip, "border-ink/15 text-ink")} onClick={() => confirmServices(true)}><Sparkles className="mr-1 h-3.5 w-3.5" /> {t("Pick the essentials for me")}</button>
                {picked.length > 0 && <button className="inline-flex min-h-10 items-center rounded-full bg-ink px-4 text-sm font-semibold text-paper" onClick={() => confirmServices(false)}>{t("Continue")}</button>}
              </>
            )}
            {step === "food" && (
              <>
                {FOOD_CHOICES.map(([l, sub]) => {
                  const on = picked.includes(sub);
                  return <button key={sub} aria-pressed={on} className={cn(chip, on && "border-brand bg-brand text-paper")} onClick={() => setPicked((p) => (on ? p.filter((x) => x !== sub) : [...p, sub]))}>{on && <Check className="mr-1 h-3.5 w-3.5" />}{t(l)}</button>;
                })}
                {picked.length > 0 ? <button className="inline-flex min-h-10 items-center rounded-full bg-ink px-4 text-sm font-semibold text-paper" onClick={() => confirmFood(picked)}>{t("Continue")}</button> : <button className={cn(chip, "border-ink/15 text-ink")} onClick={() => confirmFood([])}>{t("No food needed")}</button>}
              </>
            )}
            {step === "notes" && <button className={chip} onClick={skipNotes}>{t("No, show my plan")}</button>}
          </div>
        </div>
      )}

      <form onSubmit={submit} className="flex shrink-0 items-center gap-2 border-t border-line bg-paper p-3">
        <input value={text} onChange={(e) => setText(e.target.value)} className="field !rounded-full !py-2.5" placeholder={step === "plan" ? t("Ask for changes or type “start over”") : t("Type your answer…")} aria-label={t("Message")} maxLength={600} />
        <button type="submit" disabled={!text.trim()} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand text-paper disabled:opacity-40" aria-label={t("Send")}><ArrowUp className="h-5 w-5" /></button>
      </form>
    </div>
  );
}
