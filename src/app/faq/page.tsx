import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { getFaqs } from "@/data/content";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("FAQ"), description: t("Answers about pricing, the 2% platform fee, payments, Monitoring Agents and customisation on MUHURTO.") };
}

export default async function FaqPage() {
  const { t, lang } = await getT();
  const faqs = getFaqs(lang);
  const jsonLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageHero crumbs={[{ label: t("Home"), href: "/" }, { label: t("FAQ") }]} eyebrow={t("Help")} title={t("Frequently asked questions")} />
      <div className="container-x max-w-3xl pt-12">
        <div className="divide-y divide-line border-y border-line">
          {faqs.map((f, i) => (
            <Reveal key={f.q} variant="unfold" delay={i * 0.05}>
              <details className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-2xl">
                  {f.q}
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line font-sans text-lg transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-2xl text-ink-soft">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
        <div className="mt-12 text-center"><ButtonLink href="/contact" variant="outline">{t("Still have questions? Contact us")}</ButtonLink></div>
      </div>
    </>
  );
}
