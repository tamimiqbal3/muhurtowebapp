import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { PlannerChat } from "@/components/planner/PlannerChat";
import { getPublicServices } from "@/lib/server/catalog";
import { isGeminiConfigured } from "@/lib/server/gemini";

export const metadata: Metadata = { title: "AI Event Planner", description: "Describe your event and get a plan built from real MUHURTO services, with an estimated total." };
export const dynamic = "force-dynamic";

export default async function EventPlannerPage() {
  const services = await getPublicServices();
  return (
    <>
      <PageHero crumbs={[{ label: "Home", href: "/" }, { label: "AI Event Planner" }]} eyebrow="AI event planner" title={<>Plan in a <em className="italic text-sindoor">conversation</em></>} bn="আপনার অনুষ্ঠানের পরিকল্পনা" description="Answer eight quick questions — category, date, location, budget, guests, theme, services and preferences — or just describe your event. Recommendations only ever come from listings in the MUHURTO catalogue." />
      <div className="container-x pt-10">
        <PlannerChat services={services} aiEnabled={isGeminiConfigured()} />
      </div>
    </>
  );
}
