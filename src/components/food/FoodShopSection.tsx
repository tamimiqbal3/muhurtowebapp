"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ShoppingBasket, Minus, Plus, X, ArrowRight } from "lucide-react";
import type { Service } from "@/lib/types";
import { suggestedQuantity, unitLabel } from "@/lib/pricing";
import { formatBDT } from "@/lib/format";
import { usePlan, lineEstimate } from "../plan/PlanProvider";
import { useLang } from "../i18n/LanguageProvider";
import { FoodShop, type FoodPick } from "./FoodShop";
import { RollingNumber } from "../motion/RollingNumber";
import { ButtonLink } from "../ui/Button";

/** Food & Culinary page: the shop counter wired to the event plan, with a tray that totals as you pick. */
export function FoodShopSection({ services }: { services: Service[] }) {
  const { t, lang } = useLang();
  const plan = usePlan();
  const router = useRouter();
  const trayRef = useRef<HTMLDivElement>(null);
  const guests = plan.event.guests ?? 100;
  const byId = new Map(services.map((s) => [s.id, s]));
  const tray = plan.items.filter((i) => byId.has(i.serviceId));
  const trayTotal = tray.reduce((s, i) => s + lineEstimate(i), 0);

  const getPick = (id: string): FoodPick | null => {
    const it = plan.items.find((i) => i.serviceId === id);
    return it ? { qty: it.quantity, optionIds: it.optionIds } : null;
  };
  const add = (s: Service, p: FoodPick) => plan.add(s, { quantity: p.qty, optionIds: p.optionIds, openDrawer: false });
  const order = (s: Service, p: FoodPick) => { add(s, p); router.push("/booking"); };
  function setGuests(n: number) {
    const g = Math.max(10, Math.min(20000, Math.round(n)));
    plan.setEvent({ guests: g });
    for (const it of tray) {
      const s = byId.get(it.serviceId);
      if (s && s.unit !== "event" && s.unit !== "hour") plan.update(s.id, { quantity: suggestedQuantity(s, g) });
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <FoodShop services={services} guests={guests} getPick={getPick} onAdd={add} onRemove={plan.remove} onOrder={order} />

      {/* Tray */}
      <div ref={trayRef} className="lg:sticky lg:top-28">
        <div className="overflow-hidden rounded-[26px] bg-[linear-gradient(180deg,#a8713f,#7b4d24)] p-2.5 shadow-[0_24px_40px_-20px_rgb(74_47_20/.8)]">
          <div className="rounded-[20px] bg-paper p-5">
            <div className="flex items-center gap-2">
              <ShoppingBasket className="h-5 w-5 text-brand" />
              <p className="font-display text-2xl">{t("Your order")}</p>
              <span className="ml-auto rounded-full bg-sand px-2.5 py-0.5 text-xs font-semibold">{t("{n} items", { n: tray.length })}</span>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl bg-sand/70 px-3 py-2">
              <span className="text-sm font-medium">{t("Guests")}</span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => setGuests(guests - 25)} className="grid h-8 w-8 place-items-center rounded-full bg-paper shadow-sm hover:bg-brand hover:text-paper" aria-label={t("Fewer guests")}><Minus className="h-3.5 w-3.5" /></button>
                <input type="number" inputMode="numeric" min={10} max={20000} value={guests} onChange={(e) => setGuests(Number(e.target.value) || 10)} className="h-8 w-20 rounded-lg border border-line bg-paper text-center text-sm font-semibold" aria-label={t("Guests")} />
                <button type="button" onClick={() => setGuests(guests + 25)} className="grid h-8 w-8 place-items-center rounded-full bg-paper shadow-sm hover:bg-brand hover:text-paper" aria-label={t("More guests")}><Plus className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            <ul className="mt-4 space-y-2">
              <AnimatePresence initial={false}>
                {tray.map((i) => (
                  <motion.li key={i.serviceId} layout initial={{ opacity: 0, x: 30, height: 0 }} animate={{ opacity: 1, x: 0, height: "auto" }} exit={{ opacity: 0, x: -30, height: 0 }} transition={{ type: "spring", stiffness: 300, damping: 26 }} className="flex items-center gap-3 overflow-hidden">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{byId.get(i.serviceId)?.name ?? i.snapshot.name}</span>
                      <span className="block text-xs text-muted">{i.quantity} {t(unitLabel(i.snapshot.unit, i.quantity))}</span>
                    </span>
                    <span className="text-sm font-semibold tabular-nums">{formatBDT(lineEstimate(i))}</span>
                    <button type="button" onClick={() => plan.remove(i.serviceId)} className="grid h-7 w-7 place-items-center rounded-full text-muted hover:bg-sand hover:text-danger" aria-label={t("Remove {name}", { name: byId.get(i.serviceId)?.name ?? i.snapshot.name })}><X className="h-3.5 w-3.5" /></button>
                  </motion.li>
                ))}
              </AnimatePresence>
              {!tray.length && <li className="rounded-xl border border-dashed border-line px-3 py-6 text-center text-sm text-muted">{t("Your order is empty — tap any dish in the case to see it and order.")}</li>}
            </ul>
            <div className="mt-5 flex items-end justify-between border-t border-dashed border-line pt-4">
              <span className="text-sm text-muted">{t("Food estimate")}</span>
              <RollingNumber value={formatBDT(trayTotal)} bangla={lang === "bn"} className="font-display text-3xl font-semibold text-brand" />
            </div>
            <p className="mt-1 text-[0.7rem] text-muted">{t("Estimate before the 2% platform fee. Final prices are confirmed when you book.")}</p>
            <div className="mt-4 grid gap-2">
              <ButtonLink href="/booking" variant="accent" className={tray.length ? "" : "pointer-events-none opacity-50"}>{t("Review & book")} <ArrowRight className="h-4 w-4" /></ButtonLink>
              <ButtonLink href="/event-planner" variant="outline">{t("Plan the whole event")}</ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
