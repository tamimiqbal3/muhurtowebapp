import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Radar, SlidersHorizontal, LockKeyhole, Headphones, Quote } from "lucide-react";
import { CATEGORIES } from "@/data/categories";
import { GALLERY, STEPS, TESTIMONIALS } from "@/data/content";
import { IMG } from "@/data/images";
import type { Service, Vendor } from "@/lib/types";
import { SafeImage } from "../ui/SafeImage";
import { DemoTag, JamdaniRule, SectionHeading } from "../ui/misc";
import { ButtonLink } from "../ui/Button";
import { Reveal } from "../motion/Reveal";
import { Tilt } from "../motion/Tilt";
import { ServiceCard } from "../services/ServiceCard";
import { cn } from "@/lib/utils";

export function CategoryGrid() {
  return (
    <section id="categories" className="container-x scroll-mt-24 pt-28">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <SectionHeading eyebrow="Explore categories" title={<>Five ways to <em className="italic text-sindoor">celebrate</em></>} bn="আপনার অনুষ্ঠান বেছে নিন" />
        <p className="max-w-sm text-sm text-ink-soft">Each category has its own décor, seating, lighting, photography, booth and sound specialists — or, for food, platters, fuchka and cha.</p>
      </div>
      <div className="mt-12 grid auto-rows-[260px] gap-4 sm:grid-cols-2 lg:auto-rows-[300px] lg:grid-cols-6">
        {CATEGORIES.map((c, i) => (
          <Reveal key={c.slug} delay={i * 0.06} className={cn(i === 0 ? "sm:col-span-2 lg:col-span-3 lg:row-span-2" : i === 1 ? "lg:col-span-3" : "lg:col-span-2", i === 4 && "sm:col-span-2 lg:col-span-2")}>
            <Tilt className="h-full" max={5}>
              <Link href={c.route} className="group relative flex h-full flex-col justify-end overflow-hidden rounded-[var(--radius-card)] p-6 text-paper shadow-[var(--shadow-soft)]">
                <SafeImage src={c.card.src} alt={c.card.alt} fill sizes={i === 0 ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 640px) 100vw, 33vw"} className="-z-10 object-cover transition-transform duration-[1.4s] group-hover:scale-110" />
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/90 via-ink/35 to-transparent" />
                <span className="absolute left-0 top-0 h-1 w-full origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100" style={{ background: c.accent }} />
                <div className="[transform:translateZ(40px)]">
                  <p className="bn text-sm text-gold-soft">{c.nameBn}</p>
                  <h3 className={cn("mt-1 text-paper", i === 0 ? "text-5xl" : "text-3xl")}>{c.name}</h3>
                  <p className={cn("mt-2 max-w-md text-sm text-paper/80", i !== 0 && "line-clamp-2")}>{c.description}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase">
                    Explore <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </Tilt>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function FeaturedServices({ services, vendors }: { services: Service[]; vendors: Vendor[] }) {
  return (
    <section className="container-x pt-28">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <SectionHeading eyebrow="Featured services" title="Loved by Bangladeshi families" description="A hand-picked selection across every category. Prices are starting prices in BDT." />
        <ButtonLink href="/search" variant="outline">Browse all services</ButtonLink>
      </div>
      <div className="scrollbar-none -mx-5 mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-6 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
        {services.map((s, i) => {
          const v = vendors.find((x) => x.id === s.vendorId);
          return (
            <Reveal key={s.id} delay={(i % 3) * 0.08} className="w-[82%] shrink-0 snap-start sm:w-auto">
              <ServiceCard service={s} vendorName={v?.name} vendorVerified={v?.verified} />
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section className="relative mt-28 overflow-hidden bg-ink py-24 text-paper">
      <div className="jamdani absolute inset-0 opacity-[0.07]" aria-hidden />
      <div className="container-x relative">
        <SectionHeading eyebrow="How it works" title={<span className="text-paper">From idea to <em className="italic text-gold-soft">mehfil</em>, in four steps</span>} className="[&_.eyebrow]:text-paper/60" />
        <ol className="mt-14 grid gap-px overflow-hidden rounded-[var(--radius-card)] bg-paper/10 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.n} delay={i * 0.1} className="bg-ink p-8">
              <span className="font-display text-6xl text-gold/80">{s.n}</span>
              <h3 className="mt-6 text-2xl text-paper">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-paper/65">{s.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

const WHY = [
  { icon: ShieldCheck, title: "Verified Service Providers", body: "Vendors are reviewed for quality, reliability and fair pricing before they are listed." },
  { icon: Radar, title: "Centralized Event Monitoring", body: "A dedicated Monitoring Agent coordinates every vendor and updates your dashboard." },
  { icon: SlidersHorizontal, title: "Customizable Packages", body: "Mix services, quantities and add-ons, or request a tailored plan from our team." },
  { icon: LockKeyhole, title: "Secure Payments", body: "Pay through SSLCommerz with bKash, Nagad, cards and banking. 2% fee, shown upfront." },
  { icon: Headphones, title: "Dedicated Support", body: "Real people to help in Bangla or English — before, during and after your event." },
];

export function WhyChoose() {
  return (
    <section className="container-x grid items-center gap-14 pt-28 lg:grid-cols-2">
      <Reveal className="relative order-2 h-[460px] lg:order-1 lg:h-[560px]">
        <div className="absolute left-0 top-0 h-[78%] w-[68%] overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-lift)]">
          <SafeImage src={IMG.wChattogram.src} alt={IMG.wChattogram.alt} fill sizes="(max-width: 1024px) 70vw, 35vw" className="object-cover" />
        </div>
        <div className="absolute bottom-0 right-0 h-[56%] w-[54%] overflow-hidden rounded-[var(--radius-card)] border-8 border-ivory shadow-[var(--shadow-lift)]">
          <SafeImage src={IMG.chaPour.src} alt={IMG.chaPour.alt} fill sizes="(max-width: 1024px) 55vw, 28vw" className="object-cover" />
        </div>
        <div className="absolute right-6 top-8 rounded-2xl bg-paper p-4 shadow-[var(--shadow-soft)] sm:right-10">
          <p className="eyebrow">Monitoring</p>
          <p className="font-display text-3xl">Live</p>
          <p className="text-xs text-ink-soft">updates from your agent</p>
        </div>
      </Reveal>
      <div className="order-1 lg:order-2">
        <SectionHeading eyebrow="Why choose MUHURTO" title={<>One platform. <em className="italic text-sindoor">Zero</em> vendor-chasing.</>} bn="কেন মুহূর্ত?" />
        <ul className="mt-10 space-y-6">
          {WHY.map((w, i) => (
            <Reveal as="li" key={w.title} delay={i * 0.06} className="flex gap-5">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sand text-sindoor"><w.icon className="h-5 w-5" /></span>
              <div>
                <h3 className="font-sans text-base font-semibold">{w.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{w.body}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Gallery() {
  return (
    <section className="container-x pt-28">
      <SectionHeading align="center" eyebrow="Gallery" title="Moments from across Bangladesh" bn="উৎসবের ছবি" />
      <JamdaniRule className="mx-auto mt-6 max-w-xs" />
      <div className="mt-12 grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[220px] md:grid-cols-4">
        {GALLERY.map((g, i) => (
          <Reveal key={g.src} delay={(i % 4) * 0.05} className={cn("group relative overflow-hidden rounded-2xl", g.span === "tall" && "row-span-2", g.span === "wide" && "col-span-2")}>
            <SafeImage src={g.src} alt={g.alt} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition-transform duration-[1.2s] group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-80" />
            <p className="absolute bottom-3 left-4 text-sm font-semibold text-paper">{g.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Testimonials() {
  return (
    <section className="container-x pt-28">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <SectionHeading eyebrow="Testimonials" title="Kind words from our hosts" />
        <DemoTag />
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {TESTIMONIALS.map((t, i) => (
          <Reveal key={t.name} delay={i * 0.08} className="card flex flex-col p-6">
            <Quote className="h-6 w-6 text-gold" />
            <p className="mt-4 flex-1 font-display text-xl leading-snug">{t.quote}</p>
            <div className="mt-6 border-t border-line pt-4">
              <p className="text-sm font-semibold">{t.name}</p>
              <p className="text-xs text-muted">{t.event} · {t.city}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted">Testimonials are sample content for this pre-launch build.</p>
    </section>
  );
}

export function PlannerCta() {
  return (
    <section className="container-x pt-28">
      <Reveal className="relative overflow-hidden rounded-[2rem] bg-sindoor px-8 py-16 text-paper sm:px-14">
        <div className="jamdani absolute inset-0 opacity-20" aria-hidden />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="eyebrow text-paper/70">AI event planner</p>
            <h2 className="mt-3 text-4xl text-paper sm:text-5xl">Tell us your plan in one sentence.</h2>
            <p className="mt-4 max-w-xl text-paper/80">“A wedding reception in Rajshahi for 400 guests, budget ৳3 lakh.” Our Gemini-powered planner turns it into a shortlist of real MUHURTO services with an estimated total.</p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <ButtonLink href="/event-planner" variant="light" size="lg">Start planning</ButtonLink>
            <ButtonLink href="/customize" variant="outline" size="lg" className="border-paper/40 text-paper hover:border-paper hover:bg-paper hover:text-sindoor">Build it yourself</ButtonLink>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
