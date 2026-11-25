"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useAnimate, useReducedMotion } from "motion/react";
import { Volume2, VolumeX, Sparkles, Scissors, ArrowRight, Wand2 } from "lucide-react";
import type { CategorySlug, PlannerRequirements, PlannerResult, Service } from "@/lib/types";
import { CATEGORIES, CITIES } from "@/data/categories";
import { EVENT_SUBS, FOOD_SUBS, SUB_LABELS, THEMES } from "@/lib/planner/constants";
import { cityName, localizeCategory, themeName } from "@/data/i18n-data";
import { SERVICES_BN } from "@/data/services.bn";
import { formatBDT } from "@/lib/format";
import { unitLabel } from "@/lib/pricing";
import { usePlan } from "../plan/PlanProvider";
import { useLang } from "../i18n/LanguageProvider";
import { Button } from "../ui/Button";
import { calcSound } from "./calc-audio";
import { cn } from "@/lib/utils";

type Mode = "guests" | "budget" | "date" | null;
interface TapeLine { id: number; kind: "head" | "reg" | "item" | "sub" | "rule" | "sum" | "total" | "note" | "foot" | "bar"; left?: string; right?: string; detail?: string }

const EMPTY: PlannerRequirements = { categorySlug: null, date: null, city: null, budget: null, guests: null, theme: null, services: [], preferences: null };
const fmt = (n: number) => n.toLocaleString("en-IN");

/* ─── Physical key ─────────────────────────────────────────────────── */
function Key({ children, onPress, tone = "num", wide, active, label, className, led }: { children: ReactNode; onPress: () => void; tone?: "num" | "fn" | "op" | "eq" | "clear" | "svc"; wide?: boolean; active?: boolean; label?: string; className?: string; led?: boolean }) {
  const tones = {
    num: "bg-[linear-gradient(180deg,#f4efe6,#ddd5c7)] text-[#2a2520] [--edge:#b9ae9c]",
    fn: "bg-[linear-gradient(180deg,#4a443d,#2f2a25)] text-[#efe6d6] [--edge:#14110e]",
    op: "bg-[linear-gradient(180deg,#d9c08f,#b48f55)] text-[#2b200f] [--edge:#7d6234]",
    eq: "bg-[linear-gradient(180deg,#b8343a,#8d1f24)] text-paper [--edge:#5b1215]",
    clear: "bg-[linear-gradient(180deg,#d9772f,#b4561c)] text-paper [--edge:#7a3810]",
    svc: "bg-[linear-gradient(180deg,#3b4a52,#26333a)] text-[#e3ecef] [--edge:#11191d]",
  } as const;
  return (
    <motion.button
      type="button"
      aria-label={label}
      aria-pressed={led !== undefined ? active : undefined}
      onPointerDown={(e) => { if (e.pointerType === "mouse" && e.button !== 0) return; onPress(); }}
      onClick={(e) => { if (e.detail === 0) onPress(); /* keyboard & assistive-tech activation */ }}
      whileTap={{ y: 3, boxShadow: "0 1px 0 var(--edge), 0 2px 3px rgb(0 0 0 / .25), inset 0 1px 0 rgb(255 255 255 / .15)" }}
      transition={{ type: "spring", stiffness: 900, damping: 30 }}
      className={cn(
        "relative select-none rounded-[10px] font-semibold tracking-wide outline-offset-2 [touch-action:manipulation]",
        "shadow-[0_4px_0_var(--edge),0_6px_10px_rgb(0_0_0/.35),inset_0_1px_0_rgb(255_255_255/.35)]",
        tones[tone],
        wide && "col-span-2",
        className,
      )}
    >
      {led !== undefined && <span aria-hidden className={cn("absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full transition", active ? "bg-[#7dff9a] shadow-[0_0_6px_#7dff9a]" : "bg-black/40")} />}
      {children}
    </motion.button>
  );
}

/* ─── Main component ───────────────────────────────────────────────── */
export function PlannerCalculator({ services, aiEnabled }: { services: Service[]; aiEnabled: boolean }) {
  const { t, lang } = useLang();
  const plan = usePlan();
  const router = useRouter();
  const reduce = useReducedMotion();
  const [regs, setRegs] = useState<PlannerRequirements>(EMPTY);
  const [mode, setMode] = useState<Mode>(null);
  const [entry, setEntry] = useState("");
  const [message, setMessage] = useState<string>("");
  const [display, setDisplay] = useState<string>("0");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<PlannerResult | null>(null);
  const [tape, setTape] = useState<TapeLine[]>([]);
  const [tearing, setTearing] = useState(false);
  const [sound, setSound] = useState(true);
  const [note, setNote] = useState("");
  const [lcdScope, animateLcd] = useAnimate();
  const lineId = useRef(1);
  const svcMap = useMemo(() => new Map(services.map((s) => [s.id, s])), [services]);
  const cats = useMemo(() => CATEGORIES.map((c) => localizeCategory(c, lang)), [lang]);

  useEffect(() => {
    try { setSound(localStorage.getItem("muhurto.calc.sound") !== "off"); } catch { /* ignore */ }
    setMessage(t("Press EVENT to begin"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sfx = useCallback((k: keyof typeof calcSound) => { if (sound) calcSound[k](); }, [sound]);

  const print = useCallback((lines: Array<Omit<TapeLine, "id">>) => {
    lines.forEach((l, i) => {
      setTimeout(() => {
        setTape((tp) => [...tp, { ...l, id: lineId.current++ }]);
        sfx("print");
      }, reduce ? 0 : i * 120);
    });
  }, [reduce, sfx]);

  const flashError = useCallback((msg: string) => {
    setError(true);
    setMessage(msg);
    sfx("error");
    if (lcdScope.current && !reduce) animateLcd(lcdScope.current, { x: [0, -6, 6, -4, 4, 0] }, { duration: 0.35 });
    setTimeout(() => setError(false), 900);
  }, [animateLcd, lcdScope, reduce, sfx]);

  const catLabel = (slug: CategorySlug | null) => (slug ? cats.find((c) => c.slug === slug)?.name ?? slug : "—");
  const subLabel = (slug: string) => t(SUB_LABELS[slug] ?? slug);

  /* Commit what's typed into the active register. */
  const commit = useCallback((): boolean => {
    if (!mode || !entry) { setMode(null); return true; }
    if (mode === "guests") {
      const n = Number(entry);
      if (!n || n > 20000) { flashError(t("Guests must be 1–20,000")); return false; }
      setRegs((r) => ({ ...r, guests: n }));
      print([{ kind: "reg", left: t("Guests"), right: fmt(n) }]);
    } else if (mode === "budget") {
      const n = Number(entry);
      if (!n || n < 1000) { flashError(t("Budget must be at least ৳1,000")); return false; }
      setRegs((r) => ({ ...r, budget: n }));
      print([{ kind: "reg", left: t("Budget"), right: `৳${fmt(n)}` }]);
    } else if (mode === "date") {
      if (entry.length !== 6) { flashError(t("Type the date as DDMMYY")); return false; }
      const d = Number(entry.slice(0, 2)), m = Number(entry.slice(2, 4)), y = 2000 + Number(entry.slice(4, 6));
      const dt = new Date(Date.UTC(y, m - 1, d));
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) { flashError(t("That date doesn't exist")); return false; }
      if (dt.getTime() < today.getTime()) { flashError(t("Pick a future date")); return false; }
      const iso = dt.toISOString().slice(0, 10);
      setRegs((r) => ({ ...r, date: iso }));
      print([{ kind: "reg", left: t("Date"), right: `${entry.slice(0, 2)}-${entry.slice(2, 4)}-${y}` }]);
    }
    setMode(null);
    setEntry("");
    return true;
  }, [mode, entry, flashError, print, t]);

  /* ─── Key handlers ─── */
  const pressDigit = (d: string) => {
    sfx("key");
    if (!mode) { flashError(t("Choose DATE, GUESTS or BUDGET first")); return; }
    setEntry((e) => {
      const max = mode === "date" ? 6 : mode === "guests" ? 5 : 10;
      const next = (e === "0" ? "" : e) + d;
      return next.length > max ? e : next;
    });
  };
  const pressMultiplier = (mult: number) => {
    sfx("func");
    if (mode !== "budget" || !entry) { flashError(t("K and LAKH work while entering a budget")); return; }
    setEntry((e) => String(Math.min(9_999_999_999, Number(e) * mult)));
  };
  const pressMode = (m: Exclude<Mode, null>) => {
    sfx("func");
    if (mode && entry && !commit()) return;
    setMode(m);
    setEntry("");
    setMessage(m === "guests" ? t("How many guests?") : m === "budget" ? t("Budget in taka (use K / LAKH)") : t("Event date: DD MM YY"));
  };
  const cycle = <T,>(list: T[], current: T | null): T => list[(current == null ? 0 : (list.indexOf(current) + 1) % list.length)];
  const pressCategory = () => {
    sfx("func");
    if (mode && entry) commit();
    const next = cycle(cats.map((c) => c.slug), regs.categorySlug);
    setRegs((r) => ({ ...r, categorySlug: next, services: r.services.filter((s) => next !== "food-culinary" || (FOOD_SUBS as readonly string[]).includes(s)) }));
    setMessage(catLabel(next));
    setResult(null);
  };
  const pressCity = () => {
    sfx("func");
    if (mode && entry) commit();
    const next = cycle(CITIES, regs.city);
    setRegs((r) => ({ ...r, city: next }));
    setMessage(cityName(next, lang));
  };
  const pressTheme = () => {
    sfx("func");
    const list = [null, ...THEMES] as Array<string | null>;
    const idx = (list.indexOf(regs.theme) + 1) % list.length;
    setRegs((r) => ({ ...r, theme: list[idx] }));
    setMessage(list[idx] ? themeName(list[idx]!, lang) : t("No theme"));
  };
  const toggleService = (s: string) => {
    sfx("func");
    setRegs((r) => ({ ...r, services: r.services.includes(s) ? r.services.filter((x) => x !== s) : [...r.services, s] }));
    setMessage(subLabel(s));
  };
  const pressBack = () => { sfx("key"); setEntry((e) => e.slice(0, -1)); };
  const pressClear = () => { sfx("func"); setEntry(""); setMode(null); setMessage(t("Cleared")); };
  const pressAllClear = () => {
    sfx("func");
    setRegs(EMPTY); setEntry(""); setMode(null); setResult(null); setDisplay("0"); setMessage(t("Press EVENT to begin"));
  };

  /* Count-up on the LCD, like a mechanical register settling. */
  const countUp = useCallback((target: number) => {
    if (reduce) { setDisplay(fmt(target)); return; }
    const start = performance.now();
    const dur = 1400;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 4);
      setDisplay(fmt(Math.round(target * eased)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [reduce]);

  const pressEquals = async () => {
    sfx("func");
    if (mode && entry && !commit()) return;
    // Use the freshest registers (commit updates state asynchronously).
    const r = { ...regs };
    if (mode === "guests" && entry) r.guests = Number(entry);
    if (mode === "budget" && entry) r.budget = Number(entry);
    if (!r.categorySlug) { flashError(t("Press EVENT to choose a category")); return; }
    setBusy(true);
    setMessage(t("Calculating…"));
    setTape([]);
    setResult(null);
    print([
      { kind: "head", left: "MUHURTO", right: t("EVENT ESTIMATE") },
      { kind: "sub", left: new Date().toLocaleString(lang === "bn" ? "bn-BD" : "en-GB", { dateStyle: "medium", timeStyle: "short" }) },
      { kind: "rule" },
      { kind: "reg", left: t("Event"), right: catLabel(r.categorySlug) },
      ...(r.city ? [{ kind: "reg" as const, left: t("City"), right: cityName(r.city, lang) }] : []),
      ...(r.guests ? [{ kind: "reg" as const, left: t("Guests"), right: fmt(r.guests) }] : []),
      ...(r.budget ? [{ kind: "reg" as const, left: t("Budget"), right: `৳${fmt(r.budget)}` }] : []),
      ...(r.theme ? [{ kind: "reg" as const, left: t("Theme"), right: themeName(r.theme, lang) }] : []),
      { kind: "rule" },
    ]);
    try {
      const res = await fetch("/api/planner", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "recommend", requirements: r }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create a plan.");
      const out = data as PlannerResult;
      setResult(out);
      const name = (id: string, fallback: string) => (lang === "bn" ? SERVICES_BN[id]?.name ?? fallback : fallback);
      setTimeout(() => {
        print([
          ...out.items.map((it) => ({ kind: "item" as const, left: name(it.serviceId, it.line.serviceName), right: fmt(it.line.lineTotal), detail: `${fmt(it.line.quantity)} ${t(unitLabel(it.line.unit, it.line.quantity))} × ${fmt(it.line.unitPrice)}` })),
          { kind: "rule" },
          { kind: "sum", left: t("Subtotal"), right: fmt(out.estimate.subtotal) },
          { kind: "sum", left: t("Platform fee 2%"), right: fmt(out.estimate.platformFee) },
          { kind: "total", left: t("TOTAL"), right: `৳${fmt(out.estimate.total)}` },
          ...(out.budget != null ? [{ kind: "note" as const, left: out.withinBudget ? `✓ ${t("Within budget")}` : `! ${t("Above budget")}` }] : []),
          ...out.notes.slice(0, 3).map((n) => ({ kind: "note" as const, left: `* ${t(n)}` })),
          { kind: "rule" },
          { kind: "foot", left: t("ESTIMATE — NOT A CONFIRMED PRICE") },
          { kind: "foot", left: out.source === "gemini" ? t("Engine: Gemini AI") : t("Engine: smart rules") },
          { kind: "bar" },
          { kind: "foot", left: t("Thank you · ধন্যবাদ") },
        ]);
        setTimeout(() => { countUp(out.estimate.total); sfx("ding"); setMessage(out.budget != null ? (out.withinBudget ? t("Within budget") : t("Above budget")) : t("Estimated total")); }, reduce ? 0 : (out.items.length + 6) * 120);
      }, reduce ? 0 : 1200);
    } catch (e) {
      flashError(t(e instanceof Error ? e.message : "Could not create a plan."));
      print([{ kind: "note", left: `! ${t("Error — try again")}` }]);
    } finally {
      setBusy(false);
    }
  };

  async function describe(e: FormEvent) {
    e.preventDefault();
    const text = note.trim();
    if (!text) return;
    sfx("func");
    setMessage(t("Reading your note…"));
    try {
      const res = await fetch("/api/planner", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "parse", text, requirements: regs }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const next = data.requirements as PlannerRequirements;
      const lines: Array<Omit<TapeLine, "id">> = [];
      if (next.categorySlug && next.categorySlug !== regs.categorySlug) lines.push({ kind: "reg", left: t("Event"), right: catLabel(next.categorySlug) });
      if (next.city && next.city !== regs.city) lines.push({ kind: "reg", left: t("City"), right: cityName(next.city, lang) });
      if (next.guests && next.guests !== regs.guests) lines.push({ kind: "reg", left: t("Guests"), right: fmt(next.guests) });
      if (next.budget && next.budget !== regs.budget) lines.push({ kind: "reg", left: t("Budget"), right: `৳${fmt(next.budget)}` });
      if (next.date && next.date !== regs.date) lines.push({ kind: "reg", left: t("Date"), right: next.date });
      if (next.theme && next.theme !== regs.theme) lines.push({ kind: "reg", left: t("Theme"), right: themeName(next.theme, lang) });
      setRegs({ ...next, preferences: [regs.preferences, text].filter(Boolean).join(" · ").slice(0, 1000) });
      setNote("");
      if (lines.length) { print(lines); setMessage(t("Got it — press = to calculate")); }
      else setMessage(t("No details found — use the keys"));
    } catch {
      flashError(t("Couldn't read that note"));
    }
  }

  function addAll(to: "/customize" | "/booking") {
    if (!result) return;
    for (const it of result.items) {
      const svc = svcMap.get(it.serviceId);
      if (svc) plan.add(svc, { quantity: it.quantity, optionIds: it.optionIds, openDrawer: false });
    }
    plan.setEvent({ categorySlug: regs.categorySlug ?? undefined, date: regs.date ?? undefined, city: regs.city ?? undefined, guests: regs.guests ?? undefined, theme: regs.theme ?? undefined, notes: regs.preferences ?? undefined });
    router.push(to);
  }

  function tearOff() {
    sfx("tear");
    setTearing(true);
    setTimeout(() => { setTape([]); setTearing(false); setResult(null); setDisplay("0"); }, reduce ? 0 : 700);
  }

  /* Physical keyboard support. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (/^[0-9]$/.test(e.key)) { e.preventDefault(); pressDigit(e.key); }
      else if (e.key === "Backspace") { e.preventDefault(); pressBack(); }
      else if (e.key === "Enter" || e.key === "=") { e.preventDefault(); void pressEquals(); }
      else if (e.key === "Escape") pressClear();
      else if (e.key.toLowerCase() === "k") pressMultiplier(1000);
      else if (e.key.toLowerCase() === "l") pressMultiplier(100000);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const lcdMain = mode ? (mode === "date" ? (entry.padEnd(6, "_").replace(/^(..)(..)(..)$/, "$1-$2-$3")) : entry ? fmt(Number(entry)) : "0") : display;
  const subs = regs.categorySlug === "food-culinary" ? [...FOOD_SUBS] : [...EVENT_SUBS, ...FOOD_SUBS];
  const indicators: Array<[string, boolean]> = [[t("EVT"), !!regs.categorySlug], [t("CITY"), !!regs.city], [t("DATE"), !!regs.date], [t("GST"), !!regs.guests], ["৳", !!regs.budget], [t("THM"), !!regs.theme], ["AI", aiEnabled]];

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,460px)_1fr] lg:gap-14">
      {/* ── Calculator body ── */}
      <motion.div
        initial={reduce ? false : { rotateX: 35, y: 80, opacity: 0 }}
        animate={{ rotateX: 0, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 70, damping: 16 }}
        style={{ transformPerspective: 1400 }}
        className="relative mx-auto w-full max-w-[460px]"
      >
        <div className="rounded-[30px] bg-[linear-gradient(160deg,#3a352f_0%,#211d19_55%,#16130f_100%)] p-5 shadow-[0_40px_80px_-30px_rgb(23_19_15/.75),0_2px_0_#4d463e_inset,0_-3px_0_#0b0908_inset] sm:p-6">
          {/* brand plate + solar cells */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-display text-lg tracking-[0.3em] text-[#e7d9bd]">MUHURTO</p>
              <p className="font-lcd text-[0.6rem] tracking-[0.25em] text-[#9b8f7d]">EVENT PLANNER · EP-26</p>
            </div>
            <div aria-hidden className="grid h-7 w-28 grid-cols-4 gap-[2px] rounded-sm bg-[#1d1915] p-[3px] shadow-[inset_0_1px_2px_rgb(0_0_0/.8)]">
              {Array.from({ length: 4 }).map((_, i) => <span key={i} className="rounded-[1px] bg-[linear-gradient(180deg,#3d2f34,#24191d)]" />)}
            </div>
          </div>

          {/* LCD */}
          <div ref={lcdScope} className={cn("relative overflow-hidden rounded-xl border-4 border-[#14110e] bg-[linear-gradient(180deg,#c9d1b5,#b7c0a1)] px-4 pb-3 pt-2 shadow-[inset_0_3px_8px_rgb(0_0_0/.35)]", error && "bg-[linear-gradient(180deg,#e2b8a8,#d19f8c)]")} role="status" aria-live="polite">
            <div className="flex flex-wrap gap-x-2 font-lcd text-[0.58rem] tracking-wider">
              {indicators.map(([k, on]) => <span key={k} className={on ? "text-[#1c2416]" : "text-[#1c2416]/20"}>{k}</span>)}
              <span className={cn("ml-auto", mode ? "text-[#1c2416]" : "text-[#1c2416]/20")}>{mode ? t(mode === "guests" ? "GUESTS" : mode === "budget" ? "BUDGET" : "DATE") : "—"}</span>
            </div>
            <div className="relative mt-1 h-14 text-right font-lcd text-[2.6rem] leading-[3.5rem] text-[#1c2416] sm:text-5xl">
              <span aria-hidden className="absolute inset-0 text-[#1c2416]/[0.07]">88,88,88,888</span>
              <span className="relative">{lcdMain}</span>
            </div>
            <p className="truncate text-right text-xs font-medium text-[#1c2416]/80">{message || " "}</p>
          </div>

          {/* Note field — like a dot-matrix input slot */}
          <form onSubmit={describe} className="mt-4 flex gap-2">
            <label className="sr-only" htmlFor="calc-note">{t("Describe your event")}</label>
            <input id="calc-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} placeholder={t("Or type: wedding in Rajshahi, 400 guests, 3 lakh")} className="h-10 min-w-0 flex-1 rounded-lg border border-[#0d0b09] bg-[#1b1814] px-3 text-xs text-[#efe6d6] placeholder:text-[#8d8273] outline-none focus:ring-2 focus:ring-gold/50" />
            <button type="submit" aria-label={t("Read note")} className="grid h-10 w-10 place-items-center rounded-lg bg-gold text-ink shadow-[0_3px_0_#7d6234]"><Wand2 className="h-4 w-4" /></button>
          </form>

          {/* Function keys */}
          <div className="mt-4 grid grid-cols-3 gap-2.5 text-[0.7rem]">
            <Key tone="fn" className="h-11" onPress={pressCategory} label={t("Event type")}>{t("EVENT")} ▸</Key>
            <Key tone="fn" className="h-11" onPress={pressCity} label={t("City")}>{t("CITY")} ▸</Key>
            <Key tone="fn" className="h-11" onPress={pressTheme} label={t("Theme")}>{t("THEME")} ▸</Key>
            <Key tone="op" className="h-11" onPress={() => pressMode("date")} label={t("Date")}>{t("DATE")}</Key>
            <Key tone="op" className="h-11" onPress={() => pressMode("guests")} label={t("Guests")}>{t("GUESTS")}</Key>
            <Key tone="op" className="h-11" onPress={() => pressMode("budget")} label={t("Budget")}>{t("BUDGET")} ৳</Key>
          </div>

          {/* Service toggle keys */}
          <p className="mt-4 mb-2 font-lcd text-[0.6rem] tracking-[0.25em] text-[#9b8f7d]">{t("SERVICES")}</p>
          <div className="grid grid-cols-3 gap-2 text-[0.66rem] leading-tight">
            {subs.map((s) => (
              <Key key={s} tone="svc" className="h-11 px-1.5" led active={regs.services.includes(s)} onPress={() => toggleService(s)} label={subLabel(s)}>{subLabel(s)}</Key>
            ))}
          </div>

          {/* Keypad */}
          <div className="mt-5 grid grid-cols-4 gap-2.5 text-lg">
            {["7", "8", "9"].map((d) => <Key key={d} className="h-12" onPress={() => pressDigit(d)}>{d}</Key>)}
            <Key tone="fn" className="h-12 text-sm" onPress={pressBack} label={t("Backspace")}>⌫</Key>
            {["4", "5", "6"].map((d) => <Key key={d} className="h-12" onPress={() => pressDigit(d)}>{d}</Key>)}
            <Key tone="op" className="h-12 text-sm" onPress={() => pressMultiplier(1000)} label={t("Thousand")}>K</Key>
            {["1", "2", "3"].map((d) => <Key key={d} className="h-12" onPress={() => pressDigit(d)}>{d}</Key>)}
            <Key tone="op" className="h-12 text-xs" onPress={() => pressMultiplier(100000)} label={t("Lakh")}>{t("LAKH")}</Key>
            <Key tone="clear" className="h-12 text-sm" onPress={pressClear} label={t("Clear entry")}>C</Key>
            <Key className="h-12" onPress={() => pressDigit("0")}>0</Key>
            <Key className="h-12" onPress={() => pressDigit("00")}>00</Key>
            <Key tone="eq" className="h-12 text-2xl" onPress={() => void pressEquals()} label={t("Calculate plan")}>{busy ? "…" : "="}</Key>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <Key tone="clear" className="h-8 px-4 text-[0.65rem]" onPress={pressAllClear} label={t("All clear")}>AC</Key>
            <button type="button" onClick={() => { const v = !sound; setSound(v); try { localStorage.setItem("muhurto.calc.sound", v ? "on" : "off"); } catch { /* ignore */ } }} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.65rem] text-[#9b8f7d] hover:text-[#efe6d6]" aria-pressed={sound}>
              {sound ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />} {sound ? t("Sound on") : t("Sound off")}
            </button>
          </div>
        </div>
        {/* rubber feet shadow */}
        <div aria-hidden className="mx-auto mt-2 h-4 w-[85%] rounded-[50%] bg-ink/25 blur-md" />
      </motion.div>

      {/* ── Receipt printer ── */}
      <div className="relative mx-auto w-full max-w-md lg:mx-0">
        <div className="relative z-20 rounded-t-2xl bg-[linear-gradient(180deg,#2d2924,#1b1814)] px-5 pb-3 pt-4 shadow-[0_10px_30px_-10px_rgb(0_0_0/.6)]">
          <div className="flex items-center justify-between">
            <p className="font-lcd text-[0.6rem] tracking-[0.25em] text-[#9b8f7d]">RECEIPT · PRINTER</p>
            <span className={cn("h-2 w-2 rounded-full", busy || tape.length ? "bg-[#7dff9a] shadow-[0_0_8px_#7dff9a]" : "bg-[#3a3530]")} aria-hidden />
          </div>
          <div aria-hidden className="mt-3 h-2 rounded-full bg-[#0b0908] shadow-[inset_0_2px_3px_rgb(0_0_0/.9)]" />
        </div>
        <div className="relative -mt-2 overflow-hidden px-4" style={{ perspective: 900 }}>
          <motion.div
            animate={tearing ? { y: 180, x: 40, rotate: 9, opacity: 0 } : { y: 0, x: 0, rotate: 0, opacity: 1 }}
            transition={{ duration: tearing ? 0.65 : 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="relative origin-top"
          >
            <div className={cn("relative min-h-24 bg-[#fdfbf6] px-5 pb-8 pt-5 font-lcd text-[0.78rem] text-[#2a2520] shadow-[0_18px_30px_-18px_rgb(23_19_15/.5)]", lang === "bn" && "font-sans")} style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent 0 23px, rgb(176 141 87 / .07) 23px 24px)" }}>
              {tape.length === 0 && !busy && (
                <div className="py-10 text-center font-sans text-sm text-muted">
                  <Sparkles className="mx-auto h-6 w-6 text-gold" />
                  <p className="mt-3">{t("Your printed plan appears here.")}</p>
                  <p className="mt-1 text-xs">{t("Choose an EVENT, add guests and budget, then press =")}</p>
                </div>
              )}
              <AnimatePresence initial={false}>
                {tape.map((l) => (
                  <motion.div key={l.id} initial={reduce ? false : { opacity: 0, height: 0, y: -8 }} animate={{ opacity: 1, height: "auto", y: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
                    <TapeRow line={l} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {/* torn zig-zag edge */}
            <div aria-hidden className="h-3 w-full" style={{ background: "linear-gradient(-45deg, transparent 6px, #fdfbf6 0) 0 0 / 12px 12px repeat-x, linear-gradient(45deg, transparent 6px, #fdfbf6 0) 0 0 / 12px 12px repeat-x" }} />
          </motion.div>
        </div>
        {result && !tearing && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduce ? 0 : (result.items.length + 7) * 0.12 + 1.2 }} className="mt-6 flex flex-wrap gap-2 px-4">
            <Button variant="accent" onClick={() => addAll("/booking")}>{t("Book this plan")} <ArrowRight className="h-4 w-4" /></Button>
            <Button variant="outline" onClick={() => addAll("/customize")}>{t("Customize first")}</Button>
            <Button variant="ghost" onClick={tearOff}><Scissors className="h-4 w-4" /> {t("Tear off")}</Button>
          </motion.div>
        )}
        {result && (
          <ul className="mt-6 space-y-2 px-4 text-xs text-ink-soft">
            {result.items.map((it) => (
              <li key={it.serviceId}><span className="font-semibold text-ink">{lang === "bn" ? SERVICES_BN[it.serviceId]?.name ?? it.line.serviceName : it.line.serviceName}:</span> {t(it.reason)}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function TapeRow({ line: l }: { line: TapeLine }) {
  if (l.kind === "rule") return <div className="my-2 border-t border-dashed border-[#2a2520]/40" />;
  if (l.kind === "bar") return <div aria-hidden className="mx-auto my-3 h-8 w-48" style={{ background: "repeating-linear-gradient(90deg,#2a2520 0 2px,transparent 2px 4px,#2a2520 4px 5px,transparent 5px 8px,#2a2520 8px 11px,transparent 11px 12px)" }} />;
  if (l.kind === "head") return <div className="flex items-end justify-between"><span className="font-display text-lg tracking-[0.25em]">{l.left}</span><span className="text-[0.65rem] tracking-widest">{l.right}</span></div>;
  if (l.kind === "sub" || l.kind === "foot") return <p className={cn("text-[0.68rem] opacity-70", l.kind === "foot" && "text-center")}>{l.left}</p>;
  if (l.kind === "note") return <p className="mt-1 text-[0.7rem] leading-snug">{l.left}</p>;
  if (l.kind === "total") return <div className="mt-1 flex items-baseline justify-between border-y-2 border-double border-[#2a2520] py-1.5 text-base font-bold"><span>{l.left}</span><span>{l.right}</span></div>;
  return (
    <div className="py-[3px]">
      <div className={cn("flex justify-between gap-3", l.kind === "sum" && "opacity-80")}>
        <span className="min-w-0">{l.left}</span>
        <span className="shrink-0 tabular-nums">{l.right}</span>
      </div>
      {l.detail && <p className="text-[0.66rem] opacity-60">{l.detail}</p>}
    </div>
  );
}
