import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { Customizer } from "@/components/plan/Customizer";
import { getCatalog } from "@/lib/server/catalog";
import { getT } from "@/lib/i18n/server";
import { localizeService, localizeVendor } from "@/data/i18n-data";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Customize your event"), description: t("Build your own event plan: choose services, quantities, options and themes, and see estimated pricing.") };
}

export default async function CustomizePage() {
  const { t, lang } = await getT();
  const { services, vendors } = await getCatalog();
  return (
    <>
      <PageHero crumbs={[{ label: t("Home"), href: "/" }, { label: t("Customize") }]} eyebrow={t("Customization")} title={t("Design your event, piece by piece")} description={t("Pick services, adjust quantities and options, set a theme and add special instructions. Book directly, or send it to our team for a tailored proposal.")} />
      <div className="container-x pt-10">
        <Suspense fallback={null}>
          <Customizer services={services.filter((s) => s.active !== false).map((s) => localizeService(s, lang))} vendors={vendors.map((v) => localizeVendor(v, lang))} />
        </Suspense>
      </div>
    </>
  );
}
