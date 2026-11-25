"use client";

import { AnimatePresence, motion } from "motion/react";
import { X, Trash2, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { lineEstimate, usePlan, usePlanItemName } from "./PlanProvider";
import { useT } from "../i18n/LanguageProvider";
import { QuantityInput } from "./QuantityInput";
import { ButtonLink } from "../ui/Button";
import { SafeImage } from "../ui/SafeImage";
import { formatBDT } from "@/lib/format";

export function PlanDrawer() {
  const plan = usePlan();
  const pathname = usePathname();
  const { drawerOpen, setDrawerOpen } = plan;
  const t = useT();
  const itemName = usePlanItemName();

  useEffect(() => setDrawerOpen(false), [pathname, setDrawerOpen]);
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen, setDrawerOpen]);

  return (
    <AnimatePresence>
      {drawerOpen && (
        <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label={t("Your event plan")}>
          <motion.button aria-label={t("Close plan")} className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawerOpen(false)} />
          <motion.aside
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-ivory shadow-[var(--shadow-lift)]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
          >
            <header className="flex items-center justify-between border-b border-line px-6 py-5">
              <div>
                <p className="eyebrow">{t("Your event plan")}</p>
                <h2 className="text-2xl">{t(plan.items.length === 1 ? "{n} service" : "{n} services", { n: plan.items.length })}</h2>
              </div>
              <button className="grid h-10 w-10 place-items-center rounded-full hover:bg-sand" onClick={() => setDrawerOpen(false)} aria-label={t("Close")}>
                <X className="h-5 w-5" />
              </button>
            </header>
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              {plan.items.length === 0 && (
                <div className="py-16 text-center">
                  <p className="mt-4 font-display text-2xl">{t("Your plan is empty")}</p>
                  <p className="mt-1 text-sm text-ink-soft">{t("Add services from any category, or let the planner calculator suggest a combination.")}</p>
                  <ButtonLink href="/event-planner" variant="outline" size="sm" className="mt-6">{t("Open the planner")}</ButtonLink>
                </div>
              )}
              {plan.items.map((item) => (
                <div key={item.serviceId} className="flex gap-4 rounded-2xl border border-line bg-paper p-3">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-sand">
                    {item.snapshot.image && <SafeImage src={item.snapshot.image} alt="" fill sizes="80px" className="object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-2 text-sm font-semibold">{itemName(item)}</p>
                      <button className="text-muted hover:text-danger" aria-label={t("Remove {name}", { name: itemName(item) })} onClick={() => plan.remove(item.serviceId)}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <QuantityInput compact value={item.quantity} min={item.snapshot.minQuantity} unit={item.snapshot.unit} onChange={(n) => plan.update(item.serviceId, { quantity: n })} />
                      <span className="text-sm font-semibold">{formatBDT(lineEstimate(item))}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {plan.items.length > 0 && (
              <footer className="space-y-3 border-t border-line bg-paper px-6 py-5">
                <dl className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-ink-soft"><dt>{t("Estimated services")}</dt><dd>{formatBDT(plan.estimate.subtotal)}</dd></div>
                  <div className="flex justify-between text-ink-soft"><dt>{t("Platform fee (2%)")}</dt><dd>{formatBDT(plan.estimate.platformFee)}</dd></div>
                  <div className="flex justify-between text-base font-semibold"><dt>{t("Estimated total")}</dt><dd>{formatBDT(plan.estimate.total)}</dd></div>
                </dl>
                <p className="text-[0.7rem] text-muted">{t("Estimate only. Final prices are confirmed at booking.")}</p>
                <div className="grid grid-cols-2 gap-2">
                  <ButtonLink href="/customize" variant="outline">{t("Customize")}</ButtonLink>
                  <ButtonLink href="/booking" variant="accent">{t("Review & book")} <ArrowRight className="h-4 w-4" /></ButtonLink>
                </div>
              </footer>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
