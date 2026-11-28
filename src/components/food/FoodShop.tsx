"use client";

import { useId } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { Check } from "lucide-react";
import type { Service } from "@/lib/types";
import { formatBDT } from "@/lib/format";
import { unitLabel } from "@/lib/pricing";
import { FOOD_SUBS, SUB_LABELS } from "@/lib/planner/constants";
import { useLang } from "../i18n/LanguageProvider";
import { SafeImage } from "../ui/SafeImage";
import { cn } from "@/lib/utils";
import { useCatalog } from "@/lib/store/catalog";

const SHELF_TITLE: Record<string, string> = { platter: "Platters & set menus", bangla: "Traditional Bangla", chinese: "Chinese favourites", drinks: "Fresh juices & drinks", fuchka: "Fuchka & street counters", "cha-coffee": "Cha & coffee bar" };

/**
 * A food shop counter: a canopy with festoon bulbs, a chalkboard sign and glass-fronted shelves.
 * Every dish sits on a plate with a hanging price tag — tap it to put it in your tray.
 */
export function FoodShop({ services, picked, onPick, onItemEl, className }: {
  services: Service[];
  picked: (id: string) => boolean;
  onPick: (service: Service, el: HTMLElement | null) => void;
  /** Lets a parent know where a dish sits on screen (for fly-to-tray animations). */
  onItemEl?: (id: string, el: HTMLElement | null) => void;
  className?: string;
}) {
  const { t } = useLang();
  const reduce = useReducedMotion();
  const vendors = new Map(useCatalog().vendors.map((v) => [v.id, v.name] as const));
  const shelves = FOOD_SUBS.map((sub) => ({ sub, items: services.filter((s) => s.subcategorySlug === sub) })).filter((s) => s.items.length);

  return (
    <div className={cn("relative overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#fff8ea,#fdf1d8)] shadow-[0_30px_60px_-30px_rgb(10_22_51/.45)] ring-1 ring-[#ecd9b0]", className)}>
      <Canopy />

      {/* Chalkboard sign */}
      <div className="relative px-5 pt-2 sm:px-8">
        <motion.div
          initial={reduce ? false : { rotate: -8, y: -30, opacity: 0 }}
          whileInView={{ rotate: -1.5, y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ type: "spring", stiffness: 160, damping: 11, delay: 0.25 }}
          className="mx-auto w-fit max-w-full rounded-xl border-[6px] border-[#8a5a2b] bg-[#14233f] px-6 py-3 text-center shadow-[0_10px_20px_-10px_rgb(0_0_0/.6)]"
        >
          <p className="font-display text-2xl text-[#fdf6e3] sm:text-3xl">{t("MUHURTO food counter")}</p>
          <p className="mt-0.5 text-xs tracking-[0.2em] text-sunflower uppercase">{t("Tap a dish to put it in your tray")}</p>
        </motion.div>
      </div>

      <div className="space-y-9 px-4 pt-8 pb-8 sm:px-8">
        {shelves.map(({ sub, items }, si) => {
          return (
            <section key={sub} aria-label={t(SHELF_TITLE[sub] ?? SUB_LABELS[sub] ?? sub)}>
              <div className="mb-3 flex items-center gap-2">
                <h3 className="font-display text-2xl text-[#4a2f14]">{t(SHELF_TITLE[sub] ?? SUB_LABELS[sub] ?? sub)}</h3>
              </div>
              {/* Glass display case */}
              <div className="relative rounded-2xl bg-[linear-gradient(180deg,rgb(255_255_255/.75),rgb(255_255_255/.35))] p-3 ring-1 ring-white/80 backdrop-blur-[2px] sm:p-4">
                <div aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(115deg,transparent_30%,rgb(255_255_255/.55)_42%,transparent_52%)]" />
                <ul className="relative grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-5 md:grid-cols-4">
                  {items.map((s, i) => (
                    <Dish key={s.id} service={s} vendorName={vendors.get(s.vendorId)} picked={picked(s.id)} onPick={onPick} onItemEl={onItemEl} index={i + si * 4} />
                  ))}
                </ul>
                {/* Wooden shelf */}
                <div aria-hidden className="relative -mx-3 mt-3 h-4 rounded-sm bg-[linear-gradient(180deg,#c48a4f,#8a5a2b)] shadow-[0_8px_14px_-6px_rgb(74_47_20/.7)] sm:-mx-4" />
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function Dish({ service, picked, onPick, onItemEl, index, vendorName }: { service: Service; vendorName?: string; picked: boolean; onPick: (s: Service, el: HTMLElement | null) => void; onItemEl?: (id: string, el: HTMLElement | null) => void; index: number }) {
  const { t } = useLang();
  const reduce = useReducedMotion();
  const img = service.images[0];
  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, y: 30, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ type: "spring", stiffness: 200, damping: 18, delay: (index % 4) * 0.07 }}
      className="relative flex flex-col items-center text-center"
    >
      <motion.button
        type="button"
        ref={(el) => onItemEl?.(service.id, el)}
        onClick={(e) => onPick(service, e.currentTarget)}
        aria-pressed={picked}
        aria-label={picked ? t("Remove {name} from tray", { name: service.name }) : t("Pick {name}", { name: service.name })}
        animate={{ y: picked ? -10 : 0 }}
        whileHover={reduce ? undefined : { y: picked ? -12 : -6, rotate: -1.5 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: "spring", stiffness: 380, damping: 18 }}
        className="group relative w-full max-w-[170px] outline-offset-4"
      >
        {/* Plate */}
        <span className={cn("relative mx-auto block aspect-square w-[82%] rounded-full bg-[radial-gradient(circle,#ffffff_58%,#eef1f6_60%,#ffffff_70%,#dfe4ec_100%)] p-[11%] shadow-[0_14px_18px_-10px_rgb(10_22_51/.45)] transition", picked && "shadow-[0_0_0_4px_#00befe,0_18px_26px_-10px_rgb(1_95_255/.6)]")}>
          <span className="relative block h-full w-full overflow-hidden rounded-full">
            {img && <SafeImage src={img.src} alt={img.alt} fill sizes="160px" className="object-cover transition-transform duration-700 group-hover:scale-110" />}
          </span>
          <AnimatePresence>
            {picked && (
              <motion.span
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 90 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                className="absolute -top-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-brand-gradient text-paper shadow-lg"
              >
                <Check className="h-4 w-4" strokeWidth={3} />
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        {/* Hanging price tag */}
        <motion.span
          className="absolute -left-1 top-[8%] origin-top-right"
          animate={reduce ? undefined : { rotate: [-8, -3, -8] }}
          transition={{ duration: 3.4 + (index % 3) * 0.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <span aria-hidden className="absolute right-3 -top-3 h-4 w-px bg-[#8a5a2b]" />
          <span className={cn("relative block rounded-[6px_6px_6px_14px] px-2 py-1 text-left shadow-md ring-1 transition-colors", picked ? "bg-brand text-paper ring-brand" : "bg-[#fffdf5] text-[#4a2f14] ring-[#e2c99a]")}>
            <span aria-hidden className={cn("absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full", picked ? "bg-paper/70" : "bg-[#d7bd8c]")} />
            <span className="block pr-3 font-display text-[1.05rem] font-semibold leading-none">{formatBDT(service.startingPrice)}</span>
            <span className={cn("block text-[0.6rem] tracking-wide", picked ? "text-paper/80" : "text-[#8a6a43]")}>/ {t(unitLabel(service.unit))}</span>
          </span>
        </motion.span>
      </motion.button>
      <p className="mt-3 line-clamp-2 min-h-[2.5em] text-sm leading-tight font-semibold text-[#3a2612]">{service.name}</p>
      {vendorName && <p className="mt-0.5 truncate text-[0.7rem] font-semibold text-brand">{t("by {name}", { name: vendorName })}</p>}
      <p className="mt-0.5 line-clamp-1 text-[0.7rem] text-[#8a6a43]">{service.shortDescription}</p>
      <div className="mt-1.5 flex items-center gap-2 text-[0.7rem]">
        <span className={cn("rounded-full px-2 py-0.5 font-semibold", picked ? "bg-brand/10 text-brand" : "bg-[#f3e4c4] text-[#6b4a22]")}>{picked ? t("In your tray") : t("Tap to pick")}</span>
        <Link href={`/service/${service.id}`} className="inline-flex items-center gap-0.5 text-[#8a6a43] underline-offset-2 hover:text-brand hover:underline" aria-label={t("View {name}", { name: service.name })}>
          {t("Details")}
        </Link>
      </div>
    </motion.li>
  );
}

/* Canopy: a brand-gradient valance with a soft scalloped edge, and festoon bulbs strung beneath it. */
function canopyPath(scallops: number) {
  const w = 1200 / scallops;
  let d = "M0 0H1200V44";
  for (let i = scallops; i > 0; i--) d += `Q${(i - 0.5) * w} 78 ${(i - 1) * w} 44`;
  return d + "Z";
}
const CANOPY_MOBILE = canopyPath(6);
const CANOPY_WIDE = canopyPath(11);
const BULBS = 9;

function Canopy() {
  const reduce = useReducedMotion();
  const gid = useId().replace(/:/g, "");
  return (
    <div aria-hidden className="relative h-24 sm:h-28">
      <motion.svg
        viewBox="0 0 1200 80"
        preserveAspectRatio="none"
        className="absolute inset-x-0 top-0 h-16 w-full origin-top drop-shadow-[0_10px_14px_rgb(1_71_196/.25)] sm:h-20"
        initial={reduce ? false : { scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ type: "spring", stiffness: 120, damping: 16 }}
      >
        <defs>
          <linearGradient id={`${gid}c`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#0047c4" />
            <stop offset="0.5" stopColor="#015fff" />
            <stop offset="1" stopColor="#00befe" />
          </linearGradient>
          <linearGradient id={`${gid}s`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
            <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g className="sm:hidden">
          <path d={CANOPY_MOBILE} fill={`url(#${gid}c)`} />
          <path d={CANOPY_MOBILE} fill={`url(#${gid}s)`} />
        </g>
        <g className="hidden sm:inline">
          <path d={CANOPY_WIDE} fill={`url(#${gid}c)`} />
          <path d={CANOPY_WIDE} fill={`url(#${gid}s)`} />
        </g>
        <rect width="1200" height="6" fill="#0a1633" opacity="0.35" />
      </motion.svg>
      {/* Festoon string */}
      <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="absolute inset-x-6 top-14 h-8 w-[calc(100%-3rem)] sm:top-[4.5rem]">
        <path d="M0 2 Q50 22 100 2" fill="none" stroke="#4a2f14" strokeOpacity="0.45" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="absolute inset-x-6 top-14 h-8 sm:top-[4.5rem]">
        {Array.from({ length: BULBS }, (_, i) => {
          const x = (i + 0.5) / BULBS;
          const sag = 4 * x * (1 - x); // follows the wire's curve
          return (
            <motion.span
              key={i}
              className="absolute size-2.5 -translate-x-1/2 rounded-full bg-[#ffd46b] shadow-[0_0_10px_3px_rgb(255_196_77/.7)]"
              style={{ left: `${x * 100}%`, top: `${1 + sag * 16}px` }}
              initial={reduce ? false : { opacity: 0, scale: 0.4 }}
              whileInView={{ opacity: [0, 1, 0.75, 1], scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.35 + i * 0.06 }}
            />
          );
        })}
      </div>
    </div>
  );
}
