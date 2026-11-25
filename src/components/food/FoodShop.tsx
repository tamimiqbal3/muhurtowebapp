"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Minus, Plus, X, ShoppingBag, ArrowRight, Star, ExternalLink } from "lucide-react";
import type { Service } from "@/lib/types";
import { formatBDT } from "@/lib/format";
import { suggestedQuantity, unitLabel } from "@/lib/pricing";
import { FOOD_SUBS, SUB_LABELS } from "@/lib/planner/constants";
import { useLang } from "../i18n/LanguageProvider";
import { SafeImage } from "../ui/SafeImage";
import { RollingNumber } from "../motion/RollingNumber";
import { cn } from "@/lib/utils";

const SHELF_TITLE: Record<string, string> = { platter: "Platters & set menus", fuchka: "Fuchka & street counters", "cha-coffee": "Cha & coffee bar" };

export interface FoodPick { qty: number; optionIds: string[] }

/**
 * A bakery-style glass display case. Each dish sits on its own tray behind the glass with a
 * black price label in front, shelf by shelf. Tapping a tray opens the dish's details, where
 * the customer sets quantity and add-ons and orders it.
 */
export function FoodShop({ services, guests, getPick, onAdd, onRemove, onOrder, className }: {
  services: Service[];
  guests: number;
  getPick: (id: string) => FoodPick | null;
  onAdd: (service: Service, pick: FoodPick) => void;
  onRemove: (id: string) => void;
  /** When given, the details sheet shows "Order now" (add + go to booking). */
  onOrder?: (service: Service, pick: FoodPick) => void;
  className?: string;
}) {
  const { t } = useLang();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<Service | null>(null);
  const shelves = FOOD_SUBS.map((sub) => ({ sub, items: services.filter((s) => s.subcategorySlug === sub) })).filter((s) => s.items.length);

  return (
    <div className={cn("relative min-w-0", className)}>
      {/* ── The cabinet ── */}
      <div className="relative rounded-t-[22px] bg-[linear-gradient(180deg,#2b2f36,#16181d)] p-2.5 pb-0 shadow-[0_40px_70px_-35px_rgb(10_22_51/.8)] sm:p-3.5 sm:pb-0">
        {/* top light strip */}
        <motion.div
          aria-hidden
          className="absolute inset-x-6 top-1 h-1.5 rounded-full bg-[#fff3d6] shadow-[0_0_18px_6px_rgb(255_214_150/.7)]"
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: [0, 1, 0.3, 1, 0.6, 1] }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, times: [0, 0.15, 0.25, 0.4, 0.5, 1] }}
        />
        <div className="relative overflow-hidden rounded-t-[14px] bg-[linear-gradient(180deg,#fff6e6_0%,#f6e4c6_55%,#eed6af_100%)]">
          {/* warm interior glow */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_60%_at_50%_0%,rgb(255_236_200/.95),transparent_60%)]"
            initial={reduce ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.3 }}
          />
          {/* back mirror tiles */}
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[.18] [background:repeating-linear-gradient(90deg,transparent_0_120px,rgb(120_90_50/.5)_120px_121px)]" />

          <div className="relative divide-y divide-transparent">
            {shelves.map(({ sub, items }, si) => (
              <section key={sub} aria-label={t(SHELF_TITLE[sub] ?? SUB_LABELS[sub] ?? sub)} className="relative px-3 pt-6 pb-0 sm:px-5">
                {/* brass shelf plate */}
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-[4px] bg-[linear-gradient(180deg,#e9cf8f,#b48a3c)] px-2.5 py-0.5 text-[0.65rem] font-bold tracking-[0.16em] text-[#3a2508] uppercase shadow-[0_1px_0_#fff8,0_2px_4px_rgb(0_0_0/.25)]">{t(SHELF_TITLE[sub] ?? SUB_LABELS[sub] ?? sub)}</span>
                </div>
                <ul className="scrollbar-none -mx-3 flex snap-x gap-3 overflow-x-auto px-3 pb-1 sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-4 sm:overflow-visible sm:px-0">
                  {items.map((s, i) => (
                    <Tray key={s.id} service={s} pick={getPick(s.id)} index={i} shelf={si} onOpen={() => setOpen(s)} />
                  ))}
                </ul>
                {/* glass shelf with chrome edge */}
                <div aria-hidden className="relative -mx-3 mt-1 h-3 sm:-mx-5">
                  <div className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,#c9ced6,#ffffff,#aeb5bf,#ffffff,#c9ced6)]" />
                  <div className="absolute inset-x-0 top-[3px] h-2.5 bg-[linear-gradient(180deg,rgb(160_200_210/.55),rgb(160_200_210/.1))]" />
                </div>
              </section>
            ))}
          </div>
          <div className="h-4" />

          {/* front glass reflections */}
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,transparent_18%,rgb(255_255_255/.28)_22%,transparent_27%,transparent_62%,rgb(255_255_255/.16)_66%,transparent_70%)]" />
          {!reduce && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 w-1/3 bg-[linear-gradient(105deg,transparent,rgb(255_255_255/.35),transparent)]"
              initial={{ x: "-120%" }}
              whileInView={{ x: "380%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, delay: 0.8, ease: "easeInOut" }}
            />
          )}
        </div>
      </div>
      {/* counter base */}
      <div aria-hidden className="relative h-10 rounded-b-[18px] bg-[linear-gradient(180deg,#3a3f48,#1d2026)] shadow-[0_20px_30px_-20px_rgb(0_0_0/.8)]">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,#8d939c,#e6e9ee,#8d939c)]" />
        <div className="absolute inset-x-[12%] bottom-3 h-[2px] rounded bg-[#0f1115]" />
      </div>

      <DishSheet service={open} guests={guests} pick={open ? getPick(open.id) : null} onClose={() => setOpen(null)} onAdd={onAdd} onRemove={onRemove} onOrder={onOrder} />
    </div>
  );
}

/* ─── One tray behind the glass ─── */
function Tray({ service, pick, index, shelf, onOpen }: { service: Service; pick: FoodPick | null; index: number; shelf: number; onOpen: () => void }) {
  const { t } = useLang();
  const reduce = useReducedMotion();
  const img = service.images[0];
  const on = Boolean(pick);
  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, y: 24, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ type: "spring", stiffness: 170, damping: 18, delay: 0.15 + index * 0.08 + shelf * 0.05 }}
      className="w-[46%] shrink-0 snap-start sm:w-auto"
    >
      <motion.button
        type="button"
        onClick={onOpen}
        aria-label={t("See details for {name}", { name: service.name })}
        whileHover={reduce ? undefined : { y: -5 }}
        whileTap={{ scale: 0.97 }}
        animate={{ y: on ? -4 : 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 20 }}
        className="group relative block w-full text-left outline-offset-4"
      >
        {/* tray */}
        <span className={cn("relative block rounded-[6px] bg-[linear-gradient(180deg,#d9c39b,#a88752)] p-[5px] shadow-[0_10px_14px_-8px_rgb(60_40_10/.6)] transition-shadow", on && "shadow-[0_0_0_3px_#00befe,0_14px_22px_-8px_rgb(1_95_255/.55)]")}>
          <motion.span layoutId={reduce ? undefined : `dish-${service.id}`} className="relative block aspect-[4/3] overflow-hidden rounded-[3px] bg-[#e9dcc4]">
            {img && <SafeImage src={img.src} alt={img.alt} fill sizes="(max-width:640px) 46vw, 220px" className="object-cover transition duration-700 group-hover:scale-[1.06] group-hover:brightness-110" />}
            <span aria-hidden className="absolute inset-0 shadow-[inset_0_6px_10px_rgb(0_0_0/.25)]" />
          </motion.span>
          <AnimatePresence>
            {on && (
              <motion.span initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 500, damping: 20 }} className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-brand-gradient text-paper shadow-lg">
                <Check className="h-4 w-4" strokeWidth={3} />
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        {/* black price label, front and centre — like a bakery case */}
        <span className="relative z-10 mx-auto -mt-2.5 block w-fit max-w-[90%] min-w-[60%] rounded-[3px] bg-[#111214] px-2 py-0.5 text-center shadow-[0_3px_6px_rgb(0_0_0/.35)] ring-1 ring-white/10">
          <span className="block truncate text-[0.58rem] leading-tight font-medium text-white/75">{service.name}</span>
          <span className="block whitespace-nowrap font-lcd text-[0.88rem] leading-tight text-white">
            {formatBDT(service.startingPrice)}<span className="text-[0.6rem] text-white/60"> / {t(unitLabel(service.unit))}</span>
          </span>
        </span>
      </motion.button>
    </motion.li>
  );
}

/* ─── Details sheet: pick quantity & add-ons, then order ─── */
function DishSheet({ service, guests, pick, onClose, onAdd, onRemove, onOrder }: {
  service: Service | null;
  guests: number;
  pick: FoodPick | null;
  onClose: () => void;
  onAdd: (s: Service, p: FoodPick) => void;
  onRemove: (id: string) => void;
  onOrder?: (s: Service, p: FoodPick) => void;
}) {
  const { t, lang } = useLang();
  const reduce = useReducedMotion();
  const [qty, setQty] = useState(1);
  const [opts, setOpts] = useState<string[]>([]);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!service) return;
    setQty(pick?.qty ?? suggestedQuantity(service, guests));
    setOpts(pick?.optionIds ?? []);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    setTimeout(() => closeRef.current?.focus(), 50);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service?.id]);

  const s = service;
  const extra = s ? s.options.filter((o) => opts.includes(o.id)).reduce((a, o) => a + o.priceDelta, 0) : 0;
  const unitPrice = s ? s.startingPrice + extra : 0;
  const total = unitPrice * qty;
  const step = s?.unit === "event" || s?.unit === "hour" ? 1 : 10;
  const setQ = (v: number) => s && setQty(Math.max(s.minQuantity, Math.min(5000, Math.round(v) || s.minQuantity)));
  const current: FoodPick = { qty, optionIds: opts };

  return (
    <AnimatePresence>
      {s && (
        <motion.div key="sheet" className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="dish-title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.button type="button" aria-label={t("Close")} onClick={onClose} className="absolute inset-0 bg-ink/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div
            className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[28px] bg-paper shadow-2xl sm:rounded-[28px] md:flex-row"
            initial={reduce ? { opacity: 0 } : { y: 60, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { y: 60, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            <motion.div layoutId={reduce ? undefined : `dish-${s.id}`} className="relative h-56 shrink-0 bg-sand md:h-auto md:w-[46%]">
              {s.images[0] && <SafeImage src={s.images[0].src} alt={s.images[0].alt} fill sizes="(max-width:768px) 100vw, 360px" className="object-cover" />}
              <span className="absolute bottom-3 left-3 rounded-[3px] bg-[#111214] px-2.5 py-1 font-lcd text-sm text-white shadow">{formatBDT(s.startingPrice)} / {t(unitLabel(s.unit))}</span>
            </motion.div>

            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex items-start gap-3 p-5 pb-0 sm:p-6 sm:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="eyebrow">{t(SUB_LABELS[s.subcategorySlug] ?? s.subcategorySlug)}</p>
                  <h3 id="dish-title" className="mt-1 text-3xl leading-tight">{s.name}</h3>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted"><Star className="h-3.5 w-3.5 fill-sunflower text-sunflower" /> {s.rating.toFixed(1)} · {t("{n} reviews", { n: s.reviewCount })}</p>
                </div>
                <button ref={closeRef} type="button" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sand hover:bg-line" aria-label={t("Close")}><X className="h-4 w-4" /></button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
                <p className="text-sm text-ink-soft">{s.description}</p>
                {s.includes.length > 0 && (
                  <>
                    <p className="mt-4 text-xs font-semibold tracking-wide text-muted uppercase">{t("What's included")}</p>
                    <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                      {s.includes.map((x) => <li key={x} className="flex items-start gap-1.5 text-sm"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />{x}</li>)}
                    </ul>
                  </>
                )}
                {s.options.length > 0 && (
                  <fieldset className="mt-5">
                    <legend className="text-xs font-semibold tracking-wide text-muted uppercase">{t("Add-ons")}</legend>
                    <div className="mt-2 space-y-2">
                      {s.options.map((o) => {
                        const on = opts.includes(o.id);
                        return (
                          <label key={o.id} className={cn("flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 ring-1 transition", on ? "bg-brand/5 ring-brand" : "ring-line hover:ring-sky")}>
                            <input type="checkbox" checked={on} onChange={() => setOpts((cur) => (on ? cur.filter((x) => x !== o.id) : [...cur, o.id]))} className="h-4 w-4 accent-[#015fff]" />
                            <span className="flex-1 text-sm">{o.label}</span>
                            <span className="text-xs font-semibold text-ink-soft">+{formatBDT(o.priceDelta)}{s.unit !== "event" && ` / ${t(unitLabel(s.unit))}`}</span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                )}
                {s.unit !== "event" && (
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-sand/60 px-3 py-2.5">
                    <span className="text-sm font-semibold">{t("How many {unit}?", { unit: t(unitLabel(s.unit, 2)) })}</span>
                    <span className="inline-flex items-center gap-1">
                      <button type="button" onClick={() => setQ(qty - step)} className="grid h-9 w-9 place-items-center rounded-full bg-paper ring-1 ring-line hover:bg-brand hover:text-paper" aria-label={t("Decrease quantity")}><Minus className="h-3.5 w-3.5" /></button>
                      <input type="number" inputMode="numeric" value={qty} min={s.minQuantity} onChange={(e) => setQ(Number(e.target.value))} className="h-9 w-20 rounded-lg border border-line bg-paper text-center font-semibold" aria-label={t("Quantity")} />
                      <button type="button" onClick={() => setQ(qty + step)} className="grid h-9 w-9 place-items-center rounded-full bg-paper ring-1 ring-line hover:bg-brand hover:text-paper" aria-label={t("Increase quantity")}><Plus className="h-3.5 w-3.5" /></button>
                    </span>
                    {s.minQuantity > 1 && <span className="w-full text-[0.7rem] text-muted">{t("Minimum {n} {unit}", { n: s.minQuantity, unit: t(unitLabel(s.unit, s.minQuantity)) })}</span>}
                  </div>
                )}
                <Link href={`/service/${s.id}`} className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline">{t("Open the full page")} <ExternalLink className="h-3 w-3" /></Link>
              </div>

              <div className="border-t border-line bg-ivory/60 p-5 sm:p-6">
                <div className="flex items-end justify-between">
                  <span className="text-xs text-muted">{s.unit === "event" ? t("Price") : `${qty} × ${formatBDT(unitPrice)}`}</span>
                  <RollingNumber value={formatBDT(total)} bangla={lang === "bn"} className="font-display text-3xl font-semibold text-brand" />
                </div>
                <div className={cn("mt-4 grid gap-2", onOrder ? "sm:grid-cols-2" : "")}>
                  {onOrder && (
                    <button type="button" onClick={() => { onOrder(s, current); onClose(); }} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-gradient text-sm font-semibold text-paper shadow-[0_10px_24px_-10px_rgb(0_190_254/.9)] transition hover:brightness-110">
                      {t("Order now")} <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                  <button type="button" onClick={() => { onAdd(s, current); onClose(); }} className={cn("inline-flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition", onOrder ? "bg-paper text-ink ring-1 ring-line hover:ring-brand" : "bg-brand-gradient text-paper hover:brightness-110")}>
                    <ShoppingBag className="h-4 w-4" /> {pick ? t("Update order") : onOrder ? t("Add to order") : t("Add to plan")}
                  </button>
                </div>
                {pick && <button type="button" onClick={() => { onRemove(s.id); onClose(); }} className="mt-3 w-full text-center text-xs font-semibold text-danger hover:underline">{t("Remove from order")}</button>}
                <p className="mt-2 text-center text-[0.65rem] text-muted">{t("Estimate before the 2% platform fee. Final prices are confirmed when you book.")}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
