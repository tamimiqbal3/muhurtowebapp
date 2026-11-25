import type { Metadata } from "next";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
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
    { icon: MapPin, t: t("Visit"), b: t("House 12, Road 7, Banani, Dhaka 1213") },
    { icon: Phone, t: t("Call"), b: "+880 9600-000000" },
    { icon: Mail, t: t("Email"), b: "hello@muhurto.app" },
    { icon: Clock, t: t("Hours"), b: t("Saturday–Thursday, 10am–8pm") },
  ];
  return (
    <>
      <PageHero crumbs={[{ label: t("Home"), href: "/" }, { label: t("Contact") }]} eyebrow={t("Contact")} title={t("Let's talk about your moment")} description={t("Questions about a booking, a custom package or joining as a vendor — we reply within one working day.")} />
      <div className="container-x grid gap-10 pt-12 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          {rows.map((x, i) => (
            <Reveal key={x.t} variant="slide" delay={i * 0.08} className="flex gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sand text-sindoor"><x.icon className="h-5 w-5" /></span>
              <div><p className="text-sm font-semibold">{x.t}</p><p className="text-sm text-ink-soft">{x.b}</p></div>
            </Reveal>
          ))}
          <p className="text-xs text-muted">{t("Address and numbers are placeholders until launch.")}</p>
        </div>
        <Reveal variant="unfold" className="card p-6 sm:p-8"><ContactForm /></Reveal>
      </div>
    </>
  );
}
