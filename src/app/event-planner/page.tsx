import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { PlannerCalculator } from "@/components/planner/PlannerCalculator";
import { getPublicServices } from "@/lib/server/catalog";
import { isGeminiConfigured } from "@/lib/server/gemini";
import { getT } from "@/lib/i18n/server";
import { localizeService } from "@/data/i18n-data";
import { Reveal } from "@/components/motion/Reveal";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Event Planner"), description: t("A planning calculator for Bangladeshi events: key in guests, budget and services, press = and get a printed estimate built from real MUHURTO listings.") };
}
export const dynamic = "force-dynamic";

export default async function EventPlannerPage() {
  const { t, lang } = await getT();
  const services = (await getPublicServices()).map((s) => localizeService(s, lang));
  const steps = [
    [t("Press EVENT"), t("Cycle through Wedding, Birthday, Corporate, Family or Food.")],
    [t("Key in the numbers"), t("Tap GUESTS, BUDGET or DATE, type the value. K adds thousands, LAKH adds lakhs.")],
    [t("Light up services"), t("Toggle the services you need, or leave them off and we'll suggest a mix.")],
    [t("Press ="), t("The printer runs off an itemised estimate from real listings, with the 2% fee included.")],
  ];
  return (
    <>
      <PageHero crumbs={[{ label: t("Home"), href: "/" }, { label: t("Event Planner") }]} eyebrow={t("Event planner")} title={t("Plan it like you'd calculate it")} description={t("A real calculator for real celebrations. Every number and every line on the receipt comes from MUHURTO's actual listings — estimates only until you book.")} />
      <div className="container-x pt-14">
        <ol className="mb-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(([title, body], i) => (
            <Reveal as="li" key={i} variant="drop" delay={i * 0.1} className="card p-5">
              <span className="font-display text-3xl text-gold">0{i + 1}</span>
              <p className="mt-2 font-semibold">{title}</p>
              <p className="mt-1 text-sm text-ink-soft">{body}</p>
            </Reveal>
          ))}
        </ol>
        <PlannerCalculator services={services} aiEnabled={isGeminiConfigured()} />
        <p className="mt-10 text-center text-xs text-muted">{t("Keyboard works too: digits, Enter for =, Backspace, Esc to clear, K for thousand, L for lakh.")}</p>
      </div>
    </>
  );
}
