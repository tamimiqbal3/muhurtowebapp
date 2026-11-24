import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getCatalog, getCategoryContent } from "@/lib/server/catalog";
import type { CategorySlug } from "@/lib/types";
import { PageHero } from "../layout/PageHero";
import { ButtonLink } from "../ui/Button";
import { DemoTag, JamdaniRule, Notice, SectionHeading } from "../ui/misc";
import { ServiceGrid } from "./ServiceGrid";
import { SafeImage } from "../ui/SafeImage";
import { Reveal } from "../motion/Reveal";
import { formatBDT } from "@/lib/format";

export async function CategoryLanding({ slug }: { slug: CategorySlug }) {
  const category = await getCategoryContent(slug);
  if (!category) notFound();
  const { services, vendors, source } = await getCatalog();
  const list = services.filter((s) => s.categorySlug === slug && s.active !== false);

  return (
    <>
      <PageHero
        image={category.hero}
        accent={category.accent}
        crumbs={[{ label: "Home", href: "/" }, { label: category.name }]}
        eyebrow={`${list.length} services · ${category.subcategories.length} sections`}
        title={category.name}
        bn={category.nameBn}
        description={category.description}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href={`/services/${slug}`} variant="light" size="lg">Browse all {category.name.toLowerCase()} services</ButtonLink>
          <ButtonLink href={`/customize?category=${slug}`} variant="accent" size="lg">Customize your event <ArrowRight className="h-4 w-4" /></ButtonLink>
        </div>
      </PageHero>

      {/* Subsection navigation */}
      <nav aria-label={`${category.name} sections`} className="sticky top-[72px] z-30 border-b border-line bg-ivory/90 backdrop-blur-xl">
        <ul className="container-x scrollbar-none flex gap-2 overflow-x-auto py-3">
          {category.subcategories.map((sub) => (
            <li key={sub.slug} className="shrink-0">
              <a href={`#${sub.slug}`} className="inline-flex h-9 items-center rounded-full border border-line bg-paper px-4 text-xs font-semibold text-ink-soft transition hover:border-ink hover:text-ink">
                {sub.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="container-x pt-16">
        {source === "demo" && <Notice title="Sample listings" className="mb-10">These listings, vendors, ratings and reviews are demo data for this pre-launch build. Prices are indicative starting prices.</Notice>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {category.subcategories.map((sub, i) => {
            const items = list.filter((s) => s.subcategorySlug === sub.slug);
            const min = items.length ? Math.min(...items.map((s) => s.startingPrice)) : null;
            const img = items[0]?.images[0] ?? category.card;
            return (
              <Reveal key={sub.slug} delay={i * 0.05}>
                <Link href={`/services/${slug}?sub=${sub.slug}`} className="group card flex h-full items-center gap-4 p-3 pr-5 transition hover:shadow-[var(--shadow-lift)]">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                    <SafeImage src={img.src} alt="" fill sizes="80px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="bn text-xs text-gold">{sub.nameBn}</p>
                    <h2 className="text-2xl leading-tight">{sub.name}</h2>
                    <p className="text-xs text-muted">{items.length} services{min != null && ` · from ${formatBDT(min)}`}</p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-muted transition group-hover:text-sindoor" />
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>

      {category.subcategories.map((sub) => {
        const items = list.filter((s) => s.subcategorySlug === sub.slug);
        return (
          <section key={sub.slug} id={sub.slug} className="container-x scroll-mt-36 pt-20">
            <JamdaniRule className="mb-10 opacity-70" />
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <SectionHeading eyebrow={category.name} title={sub.name} bn={sub.nameBn} description={sub.description} />
              <div className="flex items-center gap-3">
                {source === "demo" && <DemoTag />}
                <ButtonLink href={`/services/${slug}?sub=${sub.slug}`} variant="outline" size="sm">View all {sub.name}</ButtonLink>
              </div>
            </div>
            {items.length ? (
              <ServiceGrid services={items.slice(0, 3)} vendors={vendors} />
            ) : (
              <p className="text-sm text-muted">New {sub.name.toLowerCase()} partners are being onboarded. <Link className="text-sindoor underline" href="/contact">Request a quote</Link> in the meantime.</p>
            )}
          </section>
        );
      })}
    </>
  );
}
