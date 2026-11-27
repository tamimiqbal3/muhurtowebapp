"use client";

import Link from "next/link";
import { MapPin, BadgeCheck, SlidersHorizontal, Check } from "lucide-react";
import type { Service } from "@/lib/types";
import { formatBDT } from "@/lib/format";
import { priceSuffix } from "@/lib/pricing";
import { SafeImage } from "../ui/SafeImage";
import { Badge, Rating } from "../ui/misc";
import { usePlan } from "../plan/PlanProvider";
import { cn } from "@/lib/utils";
import { useLang } from "../i18n/LanguageProvider";
import { cityName } from "@/data/i18n-data";

export interface ServiceCardProps {
  service: Service;
  vendorName?: string;
  vendorVerified?: boolean;
  priority?: boolean;
  className?: string;
  /** "print": the photo floats as a framed print — used for photography, where the work is the composition. */
  variant?: "default" | "print";
}

export function ServiceCard({ service, vendorName, vendorVerified, priority, className, variant = "default" }: ServiceCardProps) {
  const plan = usePlan();
  const inPlan = plan.hydrated && plan.has(service.id);
  const { t, lang } = useLang();
  const img = service.images[0];

  return (
    <div className={cn("h-full", className)}>
      <article className="group card flex h-full flex-col overflow-hidden transition-[box-shadow,transform] duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_24px_48px_-24px_rgb(8_20_48/.35)]">
        <Link href={`/service/${service.id}`} className="relative block aspect-[4/3] overflow-hidden bg-sand" aria-label={t("View {name}", { name: service.name })}>
          {img && variant === "print" ? (
            <span className="absolute inset-0 grid place-items-center bg-[radial-gradient(120%_90%_at_50%_0%,#eef4ff,#dfe8f8)] p-6">
              <span className="relative block h-full w-full -rotate-2 rounded-[6px] bg-paper p-2 pb-6 shadow-[0_24px_40px_-18px_rgb(8_20_48/.45)] transition-transform duration-700 ease-out group-hover:-translate-y-2 group-hover:rotate-0">
                <span className="relative block h-full w-full overflow-hidden rounded-[3px]">
                  <SafeImage src={img.src} alt={img.alt} fill priority={priority} sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw" className="object-cover" />
                </span>
              </span>
            </span>
          ) : img ? (
            <SafeImage src={img.src} alt={img.alt} fill priority={priority} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.07]" />
          ) : null}
        </Link>
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-center justify-between gap-2">
            <Rating value={service.rating} count={service.reviewCount} />
            <span className="inline-flex min-w-0 items-center gap-1 text-xs text-muted">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{cityName("Dhaka", lang)}</span>
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
                  <span className="ml-1 font-sans text-xs font-normal text-muted">{t(priceSuffix(service.unit))}</span>
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
    </div>
  );
}
