"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Plus, Trash2, Send, ArrowRight, MessageSquareHeart } from "lucide-react";
import type { CategorySlug, Service, Vendor } from "@/lib/types";
import { CATEGORIES, getCategory } from "@/data/categories";
import { formatBDT } from "@/lib/format";
import { unitLabel } from "@/lib/pricing";
import { lineEstimate, usePlan } from "./PlanProvider";
import { EventDetailsForm } from "./EventDetailsForm";
import { QuantityInput } from "./QuantityInput";
import { Button } from "../ui/Button";
import { SafeImage } from "../ui/SafeImage";
import { Notice, Rating } from "../ui/misc";
import { useAuth } from "../auth/AuthProvider";
import { cn } from "@/lib/utils";
import { useLang } from "../i18n/LanguageProvider";
import { usePlanItemName, usePlanOptionLabel } from "./PlanProvider";
import { cityName, localizeCategory } from "@/data/i18n-data";
import { demoCreateRequest } from "@/lib/demo/store";
import { computeBreakdown } from "@/lib/pricing";

export function Customizer({ services, vendors }: { services: Service[]; vendors: Vendor[] }) {
  const plan = usePlan();
  const { user, demo } = useAuth();
  const { t, lang } = useLang();
  const itemName = usePlanItemName();
  const optLabel = usePlanOptionLabel();
  const router = useRouter();
  const sp = useSearchParams();
  const vendorName = (id: string) => vendors.find((v) => v.id === id)?.name ?? "";

  useEffect(() => {
    const c = sp.get("category");
    if (plan.hydrated && c && CATEGORIES.some((x) => x.slug === c) && !plan.event.categorySlug) plan.setEvent({ categorySlug: c as CategorySlug });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan.hydrated]);

  const rawCat = plan.event.categorySlug ? getCategory(plan.event.categorySlug) : undefined;
  const cat = rawCat ? localizeCategory(rawCat, lang) : undefined;
  const sections = useMemo(() => {
    const list: Array<{ key: string; label: string; categorySlug: CategorySlug; sub: string }> = [];
    if (cat && cat.slug !== "food-culinary") cat.subcategories.forEach((s) => list.push({ key: `${cat.slug}:${s.slug}`, label: s.name, categorySlug: cat.slug, sub: s.slug }));
    localizeCategory(getCategory("food-culinary")!, lang).subcategories.forEach((s) => list.push({ key: `food-culinary:${s.slug}`, label: s.name, categorySlug: "food-culinary", sub: s.slug }));
    return list;
  }, [cat]);
  const [tab, setTab] = useState<string | null>(null);
  const activeTab = sections.find((s) => s.key === tab) ?? sections[0];
  const tabServices = services.filter((s) => s.categorySlug === activeTab?.categorySlug && s.subcategorySlug === activeTab?.sub);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);

  async function requestCustomization() {
    setError(null);
    if (!user) {
      router.push(`/login?next=${encodeURIComponent("/customize")}`);
      return;
    }
    setSubmitting(true);
    try {
      if (demo) {
        const e = plan.event;
        if (!e.categorySlug || !e.date || !e.city || !e.guests) throw new Error("Please complete the event details first.");
        const lines = plan.items.map((i) => {
          const chosen = i.snapshot.options.filter((o) => i.optionIds.includes(o.id));
          const unitPrice = i.snapshot.price + chosen.reduce((s2, o) => s2 + o.priceDelta, 0);
          return { serviceId: i.serviceId, serviceName: i.snapshot.name, categorySlug: i.snapshot.categorySlug, subcategorySlug: i.snapshot.subcategorySlug, vendorId: "", vendorName: "", unit: i.snapshot.unit, basePrice: i.snapshot.price, optionIds: chosen.map((o) => o.id), optionLabels: chosen.map((o) => o.label), unitPrice, quantity: i.quantity, lineTotal: unitPrice * i.quantity };
        });
        const r = demoCreateRequest(user.uid, {
          contact: { name: user.name, email: user.email, phone: user.phone ?? "" },
          event: { categorySlug: e.categorySlug, date: e.date, city: e.city, venue: e.venue || "To be confirmed", guests: e.guests, theme: e.theme ?? "", notes: "" },
          lines, estimate: computeBreakdown(lines.reduce((s2, l) => s2 + l.lineTotal, 0)), specialInstructions: e.notes ?? "",
        });
        setSent(r.id);
        return;
      }
      const res = await fetch("/api/customization-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: plan.items.map((i) => ({ serviceId: i.serviceId, quantity: i.quantity, optionIds: i.optionIds })),
          event: { ...plan.event, venue: plan.event.venue || "To be confirmed", theme: plan.event.theme ?? "", notes: "" },
          specialInstructions: plan.event.notes ?? "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not send your request.");
      setSent(data.id);
    } catch (e) {
      setError(t(e instanceof Error ? e.message : "Something went wrong."));
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="card mx-auto max-w-xl p-10 text-center">
        <MessageSquareHeart className="mx-auto h-10 w-10 text-sindoor" />
        <h2 className="mt-4 text-4xl">{t("Request sent")}</h2>
        <p className="mt-3 text-ink-soft">{t("Our planning team will review your plan and reply with an updated proposal. You'll see it under Customisation requests in your dashboard, where you can approve it before paying.")}</p>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/dashboard#customizations" className="inline-flex h-11 items-center rounded-full bg-ink px-6 text-sm font-semibold text-paper">{t("Go to dashboard")}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-8">
        <section className="card p-6">
          <h2 className="text-3xl">{t("1 · Event details")}</h2>
          <p className="mt-1 text-sm text-ink-soft">{t("These help us suggest quantities and confirm vendor availability.")}</p>
          <div className="mt-6"><EventDetailsForm showVenue /></div>
        </section>

        <section className="card p-6">
          <h2 className="text-3xl">{t("2 · Choose services")}</h2>
          {!cat && <Notice className="mt-4">{t("Choose an event category above to see its décor, seating, lighting, photography, booth and sound services. Food & Culinary is available for every event.")}</Notice>}
          <div className="scrollbar-none -mx-6 mt-5 flex gap-2 overflow-x-auto px-6 pb-1" role="tablist">
            {sections.map((s) => (
              <button key={s.key} role="tab" aria-selected={activeTab?.key === s.key} onClick={() => setTab(s.key)} className={cn("h-9 shrink-0 rounded-full border px-4 text-xs font-semibold", activeTab?.key === s.key ? "border-ink bg-ink text-paper" : "border-line hover:border-ink")}>
                {s.label}
                {plan.items.some((i) => i.snapshot.categorySlug === s.categorySlug && i.snapshot.subcategorySlug === s.sub) && <span className="ml-1.5 text-gold">●</span>}
              </button>
            ))}
          </div>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {tabServices.map((s) => {
              const on = plan.has(s.id);
              return (
                <li key={s.id} className={cn("flex gap-3 rounded-2xl border p-3 transition", on ? "border-ink bg-sand/50" : "border-line bg-paper")}>
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-sand"><SafeImage src={s.images[0].src} alt="" fill sizes="80px" className="object-cover" /></div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/service/${s.id}`} className="line-clamp-1 text-sm font-semibold hover:text-sindoor">{s.name}</Link>
                    <p className="truncate text-xs text-muted">{vendorName(s.vendorId)} · {cityName(s.city, lang)}</p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <Rating value={s.rating} />
                      <span className="text-xs font-semibold">{formatBDT(s.startingPrice)}<span className="font-normal text-muted">/{t(unitLabel(s.unit))}</span></span>
                    </div>
                    <button
                      onClick={() => (on ? plan.remove(s.id) : plan.add(s, { quantity: suggested(s, plan.event.guests), openDrawer: false }))}
                      className={cn("mt-2 inline-flex h-8 items-center gap-1 rounded-full px-3 text-xs font-semibold", on ? "bg-success text-paper" : "bg-ink text-paper hover:bg-sindoor")}
                    >
                      {on ? <><Check className="h-3.5 w-3.5" /> {t("Added")}</> : <><Plus className="h-3.5 w-3.5" /> {t("Add")}</>}
                    </button>
                  </div>
                </li>
              );
            })}
            {!tabServices.length && <li className="text-sm text-muted">{t("No services in this section yet.")}</li>}
          </ul>
        </section>

        <section className="card p-6">
          <h2 className="text-3xl">{t("3 · Adjust quantities & options")}</h2>
          {plan.items.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">{t("Services you add will appear here.")}</p>
          ) : (
            <ul className="mt-5 divide-y divide-line">
              {plan.items.map((item) => (
                <li key={item.serviceId} className="py-5 first:pt-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{itemName(item)}</p>
                      <p className="text-xs text-muted">{formatBDT(item.snapshot.price)} / {t(unitLabel(item.snapshot.unit))}</p>
                    </div>
                    <button onClick={() => plan.remove(item.serviceId)} className="text-muted hover:text-danger" aria-label={t("Remove {name}", { name: itemName(item) })}><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <QuantityInput value={item.quantity} min={item.snapshot.minQuantity} unit={item.snapshot.unit} onChange={(n) => plan.update(item.serviceId, { quantity: n })} />
                    <span className="font-semibold">{formatBDT(lineEstimate(item))}</span>
                  </div>
                  {item.snapshot.options.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.snapshot.options.map((o) => {
                        const on = item.optionIds.includes(o.id);
                        return (
                          <button key={o.id} onClick={() => plan.update(item.serviceId, { optionIds: on ? item.optionIds.filter((x) => x !== o.id) : [...item.optionIds, o.id] })} aria-pressed={on} className={cn("rounded-full border px-3 py-1.5 text-xs", on ? "border-ink bg-ink text-paper" : "border-line hover:border-ink")}>
                            {on && <Check className="mr-1 inline h-3 w-3" />}{optLabel(item.serviceId, o.id, o.label)} <span className={on ? "text-paper/70" : "text-muted"}>+{formatBDT(o.priceDelta)}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="card p-6">
          <p className="eyebrow">{t("Estimated pricing")}</p>
          <dl className="mt-4 space-y-2 text-sm">
            {plan.items.map((i) => (
              <div key={i.serviceId} className="flex justify-between gap-3 text-ink-soft"><dt className="truncate">{itemName(i)}</dt><dd className="shrink-0">{formatBDT(lineEstimate(i))}</dd></div>
            ))}
            <div className="flex justify-between border-t border-line pt-2"><dt>{t("Services subtotal")}</dt><dd>{formatBDT(plan.estimate.subtotal)}</dd></div>
            <div className="flex justify-between text-ink-soft"><dt>{t("Platform fee (2%)")}</dt><dd>{formatBDT(plan.estimate.platformFee)}</dd></div>
            <div className="flex justify-between text-lg font-semibold"><dt>{t("Estimated total")}</dt><dd>{formatBDT(plan.estimate.total)}</dd></div>
          </dl>
          <p className="mt-2 text-[0.7rem] text-muted">{t("Estimates. Final prices are calculated when you book.")}</p>
          {error && <Notice tone="warning" className="mt-4">{error}</Notice>}
          <div className="mt-6 grid gap-2">
            <Button variant="accent" size="lg" disabled={!plan.items.length} onClick={() => router.push("/booking")}>{t("Continue to booking")} <ArrowRight className="h-4 w-4" /></Button>
            <Button variant="outline" size="lg" disabled={!plan.items.length || submitting || !plan.event.categorySlug || !plan.event.date || !plan.event.city || !plan.event.guests} onClick={requestCustomization}>
              <Send className="h-4 w-4" /> {submitting ? t("Sending…") : t("Request Customization")}
            </Button>
          </div>
          <p className="mt-3 text-xs text-ink-soft">{t("Want changes we don't list? Request Customization sends your plan to our team; we'll reply with an updated plan for you to approve before paying.")}</p>
        </div>
      </aside>
    </div>
  );
}

function suggested(s: Service, guests?: number) {
  if (!guests) return s.minQuantity;
  if (s.unit === "guest" || s.unit === "plate") return Math.max(s.minQuantity, guests);
  if (s.unit === "cup") return Math.max(s.minQuantity, Math.ceil(guests * 1.5));
  return s.minQuantity;
}
