import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Check, MapPin, Palette, Star } from "lucide-react";
import { getCatalog, getReviewsForService, getServiceById } from "@/lib/server/catalog";
import { getCategory, getSubcategory } from "@/data/categories";
import { SERVICES } from "@/data/services";
import { Breadcrumbs } from "@/components/layout/PageHero";
import { ServiceGallery } from "@/components/services/ServiceGallery";
import { BookingPanel } from "@/components/services/BookingPanel";
import { ServiceGrid } from "@/components/services/ServiceGrid";
import { Badge, DemoTag, Rating, SectionHeading } from "@/components/ui/misc";
import { formatDate } from "@/lib/format";
import { SITE_URL } from "@/lib/config";

export const revalidate = 300;
type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return SERVICES.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const found = await getServiceById(id);
  if (!found) return { title: "Service not found" };
  const { service } = found;
  return {
    title: service.name,
    description: service.shortDescription,
    alternates: { canonical: `/service/${service.id}` },
    openGraph: { title: `${service.name} · MUHURTO`, description: service.shortDescription, images: service.images[0] ? [{ url: `${service.images[0].src}?auto=compress&cs=tinysrgb&w=1200` }] : undefined },
  };
}

export default async function ServicePage({ params }: Props) {
  const { id } = await params;
  const found = await getServiceById(id);
  if (!found || found.service.active === false) notFound();
  const { service, vendor } = found;
  const category = getCategory(service.categorySlug)!;
  const sub = getSubcategory(service.categorySlug, service.subcategorySlug);
  const [reviews, { services, vendors }] = await Promise.all([getReviewsForService(service.id), getCatalog()]);
  const related = services.filter((s) => s.categorySlug === service.categorySlug && s.id !== service.id && s.active !== false).sort((a, b) => Number(b.subcategorySlug === service.subcategorySlug) - Number(a.subcategorySlug === service.subcategorySlug)).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    serviceType: `${category.name} — ${sub?.name ?? ""}`,
    areaServed: service.serviceAreas.map((a) => ({ "@type": "Place", name: a === "Nationwide" ? "Bangladesh" : a })),
    provider: vendor ? { "@type": "LocalBusiness", name: vendor.name, address: vendor.address } : undefined,
    offers: { "@type": "Offer", priceCurrency: "BDT", price: service.startingPrice, url: `${SITE_URL}/service/${service.id}` },
  };

  return (
    <article className="pt-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="container-x">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: category.name, href: category.route }, { label: sub?.name ?? "", href: `/services/${category.slug}?sub=${service.subcategorySlug}` }, { label: service.name }]} />
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-14">
          <div>
            <ServiceGallery images={service.images} />
            <div className="mt-10">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="sindoor" className="text-[0.7rem]" >{category.name}</Badge>
                <Badge>{sub?.name}</Badge>
                {service.isDemo && <DemoTag />}
              </div>
              <h1 className="mt-4 text-5xl leading-[1.02] sm:text-6xl">{service.name}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-ink-soft">
                <Rating value={service.rating} count={service.reviewCount} />
                <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {service.city}</span>
              </div>
              <p className="mt-6 text-lg leading-relaxed text-ink-soft">{service.description}</p>

              <div className="mt-10 grid gap-8 sm:grid-cols-2">
                <div>
                  <h2 className="font-sans text-sm font-semibold tracking-wide uppercase">What&apos;s included</h2>
                  <ul className="mt-4 space-y-2.5 text-sm">
                    {service.includes.map((x) => <li key={x} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />{x}</li>)}
                  </ul>
                </div>
                <div className="space-y-6">
                  <div>
                    <h2 className="font-sans text-sm font-semibold tracking-wide uppercase">Service areas</h2>
                    <p className="mt-3 text-sm text-ink-soft">{service.serviceAreas.join(", ")}</p>
                  </div>
                  {service.themes.length > 0 && (
                    <div>
                      <h2 className="inline-flex items-center gap-2 font-sans text-sm font-semibold tracking-wide uppercase"><Palette className="h-4 w-4" /> Themes</h2>
                      <div className="mt-3 flex flex-wrap gap-2">{service.themes.map((t) => <Badge key={t}>{t}</Badge>)}</div>
                    </div>
                  )}
                </div>
              </div>

              {vendor && (
                <div className="card mt-10 flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-ink font-display text-2xl text-paper">{vendor.name.slice(0, 1)}</div>
                  <div className="flex-1">
                    <p className="eyebrow">Service provider</p>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-lg font-semibold">{vendor.name}{vendor.verified && <BadgeCheck className="h-5 w-5 text-success" aria-label="Verified" />}</p>
                    <p className="text-sm text-ink-soft">{vendor.tagline} · {vendor.address} · since {vendor.since}</p>
                  </div>
                  {vendor.isDemo && <DemoTag />}
                </div>
              )}
            </div>
          </div>
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <BookingPanel service={service} />
            <p className="mt-4 text-center text-xs text-muted">Need something different? <Link href={`/customize?category=${service.categorySlug}`} className="font-semibold text-sindoor underline-offset-2 hover:underline">Request a customisation</Link></p>
          </aside>
        </div>

        <section className="mt-20" aria-labelledby="reviews">
          <div className="flex items-end justify-between gap-4">
            <h2 id="reviews" className="text-4xl">Reviews</h2>
            {reviews.some((r) => r.isDemo) && <DemoTag />}
          </div>
          {reviews.length ? (
            <ul className="mt-8 grid gap-4 md:grid-cols-2">
              {reviews.map((r) => (
                <li key={r.id} className="card p-6">
                  <div className="flex items-center gap-1" aria-label={`${r.rating} out of 5`}>
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={i < r.rating ? "h-4 w-4 fill-gold text-gold" : "h-4 w-4 text-line"} />)}
                  </div>
                  <p className="mt-3 font-display text-xl leading-snug">“{r.comment}”</p>
                  <p className="mt-4 text-xs text-muted">{r.author} · {r.city} · {formatDate(r.date)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-sm text-ink-soft">No written reviews yet. Ratings shown are from {service.reviewCount} {service.isDemo ? "sample " : ""}ratings.</p>
          )}
        </section>

        {related.length > 0 && (
          <section className="mt-20">
            <SectionHeading eyebrow={category.name} title="You may also like" />
            <div className="mt-8"><ServiceGrid services={related} vendors={vendors} /></div>
          </section>
        )}
      </div>
    </article>
  );
}
