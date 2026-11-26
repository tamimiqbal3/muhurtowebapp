import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { ContactForm } from "@/components/ContactForm";
import { Reveal } from "@/components/motion/Reveal";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Contact"), description: t("Talk to MUHURTO about your event, a booking, or becoming a vendor partner.") };
}

export default async function ContactPage() {
  const { t } = await getT();
  const rows = [
    { t: t("Visit"), b: t("House 12, Road 7, Banani, Dhaka 1213") },
    { t: t("Call"), b: "+880 9600-000000" },
    { t: t("Email"), b: "hello@muhurto.app" },
    { t: t("Hours"), b: t("Saturday–Thursday, 10am–8pm") },
  ];
  return (
    <>
      <PageHero crumbs={[{ label: t("Home"), href: "/" }, { label: t("Contact") }]} eyebrow={t("Contact")} title={t("Let's talk about your moment")} description={t("Questions about a booking, a custom package or joining as a vendor — we reply within one working day.")} />
      <div className="container-x grid gap-10 pt-12 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          {rows.map((x, i) => (
            <Reveal key={x.t} variant="slide" delay={i * 0.08} className="border-t border-line pt-4">
              <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-muted uppercase">{x.t}</p><p className="mt-1 text-lg">{x.b}</p>
            </Reveal>
          ))}
        </div>
        <Reveal variant="unfold" className="card p-6 sm:p-8"><ContactForm /></Reveal>
      </div>
    </>
  );
}
