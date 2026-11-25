import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { SafeImage } from "@/components/ui/SafeImage";
import { JamdaniRule, SectionHeading } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { Gallery, HowItWorks, Testimonials, WhyChoose } from "@/components/home/Sections";
import { Scene } from "@/components/motion/Cinema";
import { IMG } from "@/data/images";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("About"), description: t("MUHURTO is a Bangladeshi event marketplace with transparent pricing and dedicated event monitoring.") };
}

export default async function AboutPage() {
  const { t } = await getT();
  const values = [
    { t: t("Rooted in Bangladesh"), b: t("From gaye holud marigolds to mezban and tong-er cha, we design around the rituals and flavours families actually celebrate.") },
    { t: t("Transparent by default"), b: t("Starting prices on every listing, a clear 2% platform fee at checkout, and no hidden charges.") },
    { t: t("Someone on your side"), b: t("Every paid event gets a Monitoring Agent who coordinates vendors so hosts can be guests at their own celebration.") },
  ];
  return (
    <>
      <PageHero image={IMG.wVenueFloral} crumbs={[{ label: t("Home"), href: "/" }, { label: t("About") }]} eyebrow={t("About MUHURTO")} title={t("We plan the logistics. You keep the memories.")} description={t("MUHURTO means “moment”. We built a single place to discover, customise, book and monitor every part of an event in Bangladesh.")} />
      <section className="container-x grid items-center gap-12 pt-24 lg:grid-cols-2">
        <Reveal variant="slide">
          <SectionHeading eyebrow={t("Our story")} title={t("Celebrations shouldn't require a project manager")} />
          <div className="mt-6 space-y-4 text-ink-soft">
            <p>{t("Anyone who has organised a Bangladeshi wedding knows the reality: a dozen vendors, a hundred phone calls and a family WhatsApp group that never sleeps. Hosts spend the big day chasing decorators and caterers instead of being with their guests.")}</p>
            <p>{t("MUHURTO brings décor, seating, lighting, photography, photo booths, sound and food into one marketplace — then assigns a Monitoring Agent after payment to oversee every vendor until the last guest leaves.")}</p>
          </div>
        </Reveal>
        <Reveal variant="swing" className="relative h-[420px] overflow-hidden rounded-[var(--radius-card)]">
          <SafeImage src={IMG.fElders.src} alt={IMG.fElders.alt} fill sizes="(max-width: 1024px) 100vw, 50vw" className="animate-kenburns object-cover" />
        </Reveal>
      </section>
      <section className="container-x pt-24">
        <JamdaniRule className="mb-14" />
        <div className="grid gap-6 md:grid-cols-3">
          {values.map((v, i) => (
            <Reveal key={v.t} variant="drop" delay={i * 0.12} className="card p-8">
              <span className="font-display text-5xl text-gold">0{i + 1}</span>
              <h3 className="mt-4 text-3xl">{v.t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{v.b}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <Scene><HowItWorks /></Scene>
      <Scene><WhyChoose /></Scene>
      <Scene><Gallery /></Scene>
      <Scene><Testimonials /></Scene>
      <div className="container-x mt-16 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/event-planner" variant="accent" size="lg">{t("Plan your event")}</ButtonLink>
        <ButtonLink href="/contact" variant="outline" size="lg">{t("Partner with us")}</ButtonLink>
      </div>
    </>
  );
}
