import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { ContactForm } from "@/components/ContactForm";
import { getT } from "@/lib/i18n/server";
import { ContactDetails } from "@/components/ContactDetails";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Contact"), description: t("Talk to MUHURTO about your event, a booking, or becoming a vendor partner.") };
}

export default async function ContactPage() {
  const { t } = await getT();
  return (
    <>
      <PageHero crumbs={[{ label: t("Home"), href: "/" }, { label: t("Contact") }]} eyebrow={t("Contact")} title={t("Let's talk about your moment")} description={t("Questions about a booking, a custom package or joining as a vendor — we reply within one working day.")} />
      <div className="container-x grid gap-10 pt-12 lg:grid-cols-[1fr_1.4fr]">
        <ContactDetails />
        <div className="card p-6 sm:p-8"><ContactForm /></div>
      </div>
    </>
  );
}
