"use client";

import Link from "next/link";
import { MapPin, BadgeCheck, SlidersHorizontal, Check } from "lucide-react";
import type { Service } from "@/lib/types";
import { formatBDT } from "@/lib/format";
import { unitLabel } from "@/lib/pricing";
import { getCategory, getSubcategory } from "@/data/categories";
import { SafeImage } from "../ui/SafeImage";
import { Badge, Rating } from "../ui/misc";
import { Tilt } from "../motion/Tilt";
import { usePlan } from "../plan/PlanProvider";
import { cn } from "@/lib/utils";
import { useLang } from "../i18n/LanguageProvider";
import { cityName, localizeCategory } from "@/data/i18n-data";

export interface ServiceCardProps {
  service: Service;
  vendorName?: string;
  vendorVerified?: boolean;
  priority?: boolean;
  className?: string;
}

export function ServiceCard({ service, vendorName, vendorVerified, priority, className }: ServiceCardProps) {
  const plan = usePlan();
  const inPlan = plan.hydrated && plan.has(service.id);
  const { t, lang } = useLang();
  const rawCat = getCategory(service.categorySlug);
  const cat = rawCat ? localizeCategory(rawCat, lang) : undefined;
  const sub = cat?.subcategories.find((x) => x.slug === service.subcategorySlug) ?? getSubcategory(service.categorySlug, service.subcategorySlug);
  const img = service.images[0];

  return (
    <Tilt className={cn("h-full", className)} max={4}>
      <article className="group card flex h-full flex-col overflow-hidden transition-shadow duration-500 hover:shadow-[var(--shadow-lift)]">
        <Link href={`/service/${service.id}`} className="relative block aspect-[4/3] overflow-hidden bg-sand" aria-label={t("View {name}", { name: service.name })}>
          {img && (
            <SafeImage src={img.src} alt={img.alt} fill priority={priority} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105" />
          )}
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
            <span className="rounded-full bg-paper/90 px-2.5 py-1 text-[0.65rem] font-semibold tracking-wide backdrop-blur" style={{ color: cat?.accent }}>
              {sub?.name ?? service.subcategorySlug}
            </span>
          </div>
        </Link>
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-center justify-between gap-2">
            <Rating value={service.rating} count={service.reviewCount} />
            <span className="inline-flex min-w-0 items-center gap-1 text-xs text-muted">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{cityName(service.serviceAreas.includes("Nationwide") ? "Nationwide" : service.city, lang)}</span>
            </span>
          </div>
          <h3 className="mt-3 text-[1.45rem] leading-tight">
            <Link href={`/service/${service.id}`} className="hover:text-sindoor">{service.name}</Link>
          </h3>
          {vendorName && (
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-ink-soft">
              {t("by {vendor}", { vendor: vendorName })}
              {vendorVerified && <BadgeCheck className="h-3.5 w-3.5 text-success" aria-label={t("Verified vendor")} />}
            </p>
          )}
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-soft">{service.shortDescription}</p>
          {service.options.length > 0 && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted">
              <SlidersHorizontal className="h-3.5 w-3.5" /> {t("{n} customisation options", { n: service.options.length })}
            </p>
          )}
          <div className="mt-auto pt-5">
            <div className="flex items-end justify-between border-t border-line pt-4">
              <div>
                <p className="text-[0.65rem] font-semibold tracking-[0.18em] text-muted uppercase">{t("Starting from")}</p>
                <p className="font-display text-2xl font-semibold">
                  {formatBDT(service.startingPrice)}
                  <span className="ml-1 font-sans text-xs font-normal text-muted">/ {t(unitLabel(service.unit))}</span>
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link href={`/service/${service.id}`} className="inline-flex h-10 items-center justify-center rounded-full border border-ink/15 text-xs font-semibold transition hover:border-ink hover:bg-ink hover:text-paper">
                {t("View Details")}
              </Link>
              <button
                onClick={() => plan.add(service)}
                className={cn(
                  "inline-flex h-10 items-center justify-center gap-1.5 rounded-full text-xs font-semibold transition",
                  inPlan ? "bg-success text-paper" : "bg-sindoor text-paper hover:bg-sindoor-dark",
                )}
                aria-label={inPlan ? t("{name} is in your plan", { name: service.name }) : t("Book {name}", { name: service.name })}
              >
                {inPlan ? (<><Check className="h-3.5 w-3.5" /> {t("In plan")}</>) : t("Book Now")}
              </button>
            </div>
          </div>
        </div>
      </article>
    </Tilt>
  );
}
