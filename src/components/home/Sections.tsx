import { getGallery, getSteps, getTestimonials } from "@/data/content";
import { IMG } from "@/data/images";
import { SafeImage } from "../ui/SafeImage";
import { DemoTag, JamdaniRule, SectionHeading } from "../ui/misc";
import { Reveal } from "../motion/Reveal";
import { getT } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

export async function HowItWorks() {
  const { t, lang } = await getT();
  return (
    <section className="relative mt-28 overflow-hidden bg-ink py-24 text-paper">
      <div className="container-x relative">
        <SectionHeading eyebrow={t("How it works")} title={<span className="text-paper">{t("From idea to celebration, in four steps")}</span>} className="[&_.eyebrow]:text-paper/60" />
        <ol className="mt-10 grid gap-px overflow-hidden rounded-[var(--radius-card)] bg-paper/10 sm:grid-cols-2 lg:grid-cols-4 [perspective:1200px]">
          {getSteps(lang).map((s, i) => (
            <Reveal as="li" key={s.n} variant="unfold" delay={i * 0.12} className="bg-ink p-8">
              <span className="font-lcd text-sm tracking-[0.3em] text-sky">{s.n}</span>
              <h3 className="mt-4 text-2xl text-paper">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-paper/65">{s.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

export async function WhyChoose() {
  const { t } = await getT();
  const why = [
    { title: t("Verified Service Providers"), body: t("Vendors are reviewed for quality, reliability and fair pricing before they are listed.") },
    { title: t("Centralized Event Monitoring"), body: t("A dedicated Monitoring Agent coordinates every vendor and updates your dashboard.") },
    { title: t("Customizable Packages"), body: t("Mix services, quantities and add-ons, or request a tailored plan from our team.") },
    { title: t("Secure Payments"), body: t("Pay with bKash, Nagad, Rocket, Visa or Mastercard through SSLCommerz. 2% fee, shown upfront.") },
    { title: t("Dedicated Support"), body: t("Real people to help in Bangla or English — before, during and after your event.") },
  ];
  return (
    <section className="container-x grid items-center gap-14 pt-28 lg:grid-cols-2">
      <Reveal variant="swing" className="relative order-2 h-[460px] lg:order-1 lg:h-[560px]">
        <div className="absolute left-0 top-0 h-[78%] w-[68%] overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-lift)]">
          <SafeImage src={IMG.wChattogram.src} alt={IMG.wChattogram.alt} fill sizes="(max-width: 1024px) 70vw, 35vw" className="animate-kenburns object-cover" />
        </div>
        <div className="absolute bottom-0 right-0 h-[56%] w-[54%] overflow-hidden rounded-[var(--radius-card)] border-8 border-ivory shadow-[var(--shadow-lift)]">
          <SafeImage src={IMG.chaPour.src} alt={IMG.chaPour.alt} fill sizes="(max-width: 1024px) 55vw, 28vw" className="object-cover" />
        </div>
      </Reveal>
      <div className="order-1 lg:order-2">
        <SectionHeading eyebrow={t("Why choose MUHURTO")} title={t("One platform. Zero vendor-chasing.")} />
        <ul className="mt-10 space-y-5">
          {why.map((w, i) => (
            <Reveal as="li" key={w.title} variant="slide" delay={i * 0.08} className="border-t border-line pt-5">
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

export async function Gallery() {
  const { t, lang } = await getT();
  return (
    <section className="container-x pt-28">
      <SectionHeading align="center" eyebrow={t("Gallery")} title={t("Moments from across Bangladesh")} />
      <JamdaniRule className="mx-auto mt-6 max-w-xs" />
      <div className="mt-12 grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[220px] md:grid-cols-4">
        {getGallery(lang).map((g, i) => (
          <Reveal key={g.src} variant={i % 3 === 0 ? "focus" : i % 3 === 1 ? "drop" : "tilt"} delay={(i % 4) * 0.06} className={cn("group relative overflow-hidden rounded-2xl", g.span === "tall" && "row-span-2", g.span === "wide" && "col-span-2")}>
            <SafeImage src={g.src} alt={g.alt} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition-transform duration-[1.2s] group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-80" />
            <p className="absolute bottom-3 left-4 text-sm font-semibold text-paper">{g.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export async function Testimonials() {
  const { t, lang } = await getT();
  return (
    <section className="container-x pt-28">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <SectionHeading eyebrow={t("Testimonials")} title={t("Kind words from our hosts")} />
        <DemoTag />
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {getTestimonials(lang).map((x, i) => (
          <Reveal key={x.name} variant="deal" delay={i * 0.1} className="card flex flex-col p-6">
            <p className="mt-4 flex-1 font-display text-xl leading-snug">{x.quote}</p>
            <div className="mt-6 border-t border-line pt-4">
              <p className="text-sm font-semibold">{x.name}</p>
              <p className="text-xs text-muted">{x.event} · {x.city}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted">{t("Testimonials are sample content for this pre-launch build.")}</p>
    </section>
  );
}
