"use client";

import Link from "next/link";
import { BadgeCheck, Check, MapPin, Star } from "lucide-react";
import { Breadcrumbs } from "../layout/PageHero";
import { BookingPanel } from "../services/BookingPanel";
import { ServiceGrid } from "../services/ServiceGrid";
import { SafeImage } from "../ui/SafeImage";
import { Badge, Rating, SectionHeading } from "../ui/misc";
import { NotFoundView } from "../ui/NotFoundView";
import { formatDate } from "@/lib/format";
import { useLang } from "../i18n/LanguageProvider";
import { cityName, localizeCategory, localizeService, localizeVendor } from "@/data/i18n-data";
import { categoryRoute, findCategory, findService, findVendor, useCatalog } from "@/lib/store/catalog";

/** One service: a single main image, details, booking panel, reviews and related items. */
export function ServiceDetail({ id }: { id: string }) {
  const { t, lang } = useLang();
  const data = useCatalog();
  const raw = findService(data, id);
  const rawCat = raw ? findCategory(data, raw.categorySlug) : undefined;
  if (!raw || raw.active === false || !rawCat) return <NotFoundView title={t("Service not found")} />;
  const service = localizeService(raw, lang);
  const rawVendor = findVendor(data, service.vendorId);
  const vendor = rawVendor ? localizeVendor(rawVendor, lang) : undefined;
  const category = localizeCategory(rawCat, lang);
  const sub = category.subcategories.find((x) => x.slug === service.subcategorySlug);
  const reviews = data.reviews.filter((r) => r.serviceId === service.id && !r.hidden);
  const vendors = data.vendors.map((v) => localizeVendor(v, lang));
  const related = data.services
    .filter((s) => s.categorySlug === service.categorySlug && s.id !== service.id && s.active !== false)
    .sort((a, b) => Number(b.subcategorySlug === service.subcategorySlug) - Number(a.subcategorySlug === service.subcategorySlug))
    .slice(0, 3)
    .map((s) => localizeService(s, lang));
  const image = service.images[0];

  return (
    <article className="pt-24 lg:pt-28">
      <div className="container-x">
        <Breadcrumbs items={[{ label: t("Home"), href: "/" }, { label: category.name, href: categoryRoute(category) }, { label: sub?.name ?? "", href: `/services/${category.slug}?sub=${service.subcategorySlug}` }, { label: service.name }]} />
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-14">
          <div className="min-w-0">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-sand">
              {image && <SafeImage src={image.src} alt={image.alt || service.name} fill priority sizes="(max-width: 1024px) 100vw, 58vw" className="object-cover" />}
            </div>
            <div className="mt-8">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="sindoor" className="text-[0.7rem]">{category.name}</Badge>
                {sub && <Badge>{sub.name}</Badge>}
              </div>
              <h1 className="mt-4 text-4xl leading-[1.1] sm:text-5xl">{service.name}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-ink-soft">
                <Rating value={service.rating} count={service.reviewCount} />
                <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {cityName("Dhaka", lang)}</span>
              </div>
              <p className="mt-6 text-lg leading-relaxed text-ink-soft">{service.description}</p>

              <div className="mt-10">
                <h2 className="font-sans text-sm font-semibold tracking-wide uppercase">{t("What's included")}</h2>
                <ul className="mt-4 grid gap-2.5 text-sm sm:grid-cols-2">
                  {service.includes.map((x) => <li key={x} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />{x}</li>)}
                </ul>
              </div>

              {vendor && (
                <div className="card mt-10 flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-ink font-display text-2xl text-paper">{vendor.name.slice(0, 1)}</div>
                  <div className="min-w-0 flex-1">
                    <p className="eyebrow">{t("Service provider")}</p>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-lg font-semibold">{vendor.name}{vendor.verified && <BadgeCheck className="h-5 w-5 text-success" aria-label={t("Verified vendor")} />}</p>
                    <p className="text-sm text-ink-soft">{vendor.tagline} · {vendor.address} · {t("since {year}", { year: vendor.since })}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <BookingPanel service={service} />
            <p className="mt-4 text-center text-xs text-muted">{t("Need something different?")} <Link href="/event-planner" className="font-semibold text-sindoor underline-offset-2 hover:underline">{t("Ask our planning assistant")}</Link></p>
          </aside>
        </div>

        <section className="mt-20" aria-labelledby="reviews">
          <h2 id="reviews" className="text-3xl sm:text-4xl">{t("Reviews")}</h2>
          {reviews.length ? (
            <ul className="mt-8 grid gap-4 md:grid-cols-2">
              {reviews.map((r) => (
                <li key={r.id} className="card p-6">
                  <div className="flex items-center gap-1" aria-label={t("Rated {v} out of 5", { v: r.rating })}>
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={i < r.rating ? "h-4 w-4 fill-gold text-gold" : "h-4 w-4 text-line"} />)}
                  </div>
                  <p className="mt-3 text-lg leading-snug">“{r.comment}”</p>
                  <p className="mt-4 text-xs text-muted">{r.author} · {cityName(r.city, lang)} · {formatDate(r.date, undefined, lang)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-sm text-ink-soft">{t("No written reviews yet. Ratings shown are from {n} ratings.", { n: service.reviewCount })}</p>
          )}
        </section>

        {related.length > 0 && (
          <section className="mt-20">
            <SectionHeading eyebrow={category.name} title={t("You may also like")} />
            <div className="mt-8"><ServiceGrid services={related} vendors={vendors} /></div>
          </section>
        )}
      </div>
    </article>
  );
}
