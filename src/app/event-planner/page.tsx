import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { PlannerChat } from "@/components/planner/PlannerChat";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Event Planner"), description: t("Plan your event in Dhaka through a simple conversation with our planning assistant.") };
}

export default async function EventPlannerPage() {
  const { t } = await getT();
  return (
    <>
      <PageHero crumbs={[{ label: t("Home"), href: "/" }, { label: t("Event Planner") }]} eyebrow={t("Event planner")} title={t("Plan your event in a conversation")} description={t("Tell our assistant what you are celebrating. It asks a few simple questions and builds a priced plan you can book right away.")} />
      <div className="container-x pt-10 pb-24 lg:pb-0">
        <PlannerChat />
      </div>
    </>
  );
}
