import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { PlannerBoard } from "@/components/planner/PlannerBoard";
import { getPublicServices } from "@/lib/server/catalog";
import { isGeminiConfigured } from "@/lib/server/gemini";
import { getT } from "@/lib/i18n/server";
import { localizeService } from "@/data/i18n-data";
import { Reveal } from "@/components/motion/Reveal";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Event Planner"), description: t("Plan your whole event on one page: pick the occasion, details, services and food together and watch the total add up live.") };
}
export const dynamic = "force-dynamic";

export default async function EventPlannerPage() {
  const { t, lang } = await getT();
  const services = (await getPublicServices()).map((s) => localizeService(s, lang));
  const steps = [
    [t("Pick the occasion"), t("Wedding, birthday, corporate, family or food only.")],
    [t("Set the details"), t("Slide guests and budget, choose the date, city and theme.")],
    [t("Tap what you want"), t("Every service and dish is on one page — tap to add, tap again to remove.")],
    [t("Watch it add up"), t("The receipt totals live with the 2% fee. Or let us suggest the best plan.")],
  ];
  return (
    <>
      <PageHero crumbs={[{ label: t("Home"), href: "/" }, { label: t("Event Planner") }]} eyebrow={t("Event planner")} title={t("Your whole event, on one table")} description={t("Everything you can choose is laid out together — like spreading menus and brochures on a desk. Tap to pick, and the receipt adds it up as you go.")} />
      <div className="container-x pt-12 pb-24 lg:pb-0">
        <ol className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(([title, body], i) => (
            <Reveal as="li" key={i} variant="drop" delay={i * 0.08} className="flex gap-3 rounded-2xl bg-paper p-4 ring-1 ring-line">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-gradient font-display text-lg font-semibold text-paper">{i + 1}</span>
              <span>
                <span className="block font-semibold">{title}</span>
                <span className="mt-0.5 block text-sm text-ink-soft">{body}</span>
              </span>
            </Reveal>
          ))}
        </ol>
        <PlannerBoard services={services} aiEnabled={isGeminiConfigured()} />
      </div>
    </>
  );
}
