"use client";

import Link from "next/link";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";
import type { Service } from "@/lib/types";
import { formatBDT } from "@/lib/format";
import { unitLabel } from "@/lib/pricing";
import { FOOD_SUBS, SUB_LABELS } from "@/lib/planner/constants";
import { useLang } from "../i18n/LanguageProvider";
import { SafeImage } from "../ui/SafeImage";
import { cn } from "@/lib/utils";

const SHELF_TITLE: Record<string, string> = { platter: "Platters & set menus", fuchka: "Fuchka & street counters", "cha-coffee": "Cha & coffee bar" };

/**
 * A food shop counter: an awning, a chalkboard sign and glass-fronted shelves.
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
  const shelves = FOOD_SUBS.map((sub) => ({ sub, items: services.filter((s) => s.subcategorySlug === sub) })).filter((s) => s.items.length);

  return (
    <div className={cn("relative overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#fff8ea,#fdf1d8)] shadow-[0_30px_60px_-30px_rgb(10_22_51/.45)] ring-1 ring-[#ecd9b0]", className)}>
      {/* Awning */}
      <div aria-hidden className="relative h-16 sm:h-20">
        <motion.div
          className="absolute inset-0 origin-top bg-[repeating-linear-gradient(90deg,#015fff_0_42px,#fbfcff_42px_84px)]"
          initial={reduce ? false : { scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: "spring", stiffness: 120, damping: 14 }}
        />
        <div className="absolute inset-x-0 -bottom-3 h-6 bg-[radial-gradient(circle_at_21px_0,#015fff_20px,transparent_21px)] bg-[length:84px_24px] bg-repeat-x" />
        <div className="absolute inset-x-0 -bottom-3 h-6 bg-[radial-gradient(circle_at_63px_0,#fbfcff_20px,transparent_21px)] bg-[length:84px_24px] bg-repeat-x" />
        <div className="absolute inset-x-0 top-0 h-3 bg-[#0047c4]" />
      </div>

      {/* Chalkboard sign */}
      <div className="relative px-5 pt-8 sm:px-8">
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
                    <Dish key={s.id} service={s} picked={picked(s.id)} onPick={onPick} onItemEl={onItemEl} index={i + si * 4} />
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

function Dish({ service, picked, onPick, onItemEl, index }: { service: Service; picked: boolean; onPick: (s: Service, el: HTMLElement | null) => void; onItemEl?: (id: string, el: HTMLElement | null) => void; index: number }) {
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
