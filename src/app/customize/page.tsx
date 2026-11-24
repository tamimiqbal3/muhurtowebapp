import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { Customizer } from "@/components/plan/Customizer";
import { getCatalog } from "@/lib/server/catalog";

export const metadata: Metadata = { title: "Customize your event", description: "Build your own event plan: choose services, quantities, options and themes, and see estimated pricing." };

export default async function CustomizePage() {
  const { services, vendors } = await getCatalog();
  return (
    <>
      <PageHero crumbs={[{ label: "Home", href: "/" }, { label: "Customize" }]} eyebrow="Customization" title="Design your event, piece by piece" bn="নিজের মতো সাজান" description="Pick services, adjust quantities and options, set a theme and add special instructions. Book directly, or send it to our team for a tailored proposal." />
      <div className="container-x pt-10">
        <Suspense fallback={null}>
          <Customizer services={services.filter((s) => s.active !== false)} vendors={vendors} />
        </Suspense>
      </div>
    </>
  );
}
