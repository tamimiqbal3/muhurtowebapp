import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { FAQS } from "@/data/content";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "FAQ", description: "Answers about pricing, the 2% platform fee, payments, Monitoring Agents and customisation on MUHURTO." };

export default function FaqPage() {
  const jsonLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageHero crumbs={[{ label: "Home", href: "/" }, { label: "FAQ" }]} eyebrow="Help" title="Frequently asked questions" bn="সাধারণ জিজ্ঞাসা" />
      <div className="container-x max-w-3xl pt-12">
        <div className="divide-y divide-line border-y border-line">
          {FAQS.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-2xl">
                {f.q}
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line font-sans text-lg transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 max-w-2xl text-ink-soft">{f.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-12 text-center"><ButtonLink href="/contact" variant="outline">Still have questions? Contact us</ButtonLink></div>
      </div>
    </>
  );
}
