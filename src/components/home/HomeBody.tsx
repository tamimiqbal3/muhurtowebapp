"use client";

import type { ReactNode } from "react";
import { useSiteSettings } from "../SiteSettingsProvider";
import { ClosingInvite, PlannerTeaser } from "./Cinematic";
import { FeaturedServices, HomeFaq, InspirationGallery, Testimonials, ValueTicker } from "./HomeSections";
import { EventProcess } from "./EventProcess";
import { CustomSection } from "./CustomSection";
import type { BuiltInSection } from "@/lib/home-content";

const BUILT_IN: Record<BuiltInSection, () => ReactNode> = {
  ticker: () => <ValueTicker />,
  featured: () => <FeaturedServices />,
  process: () => <EventProcess />,
  planner: () => <PlannerTeaser />,
  gallery: () => <InspirationGallery />,
  testimonials: () => <Testimonials />,
  faq: () => <HomeFaq />,
  closing: () => <ClosingInvite />,
};

/** Everything below the hero, in the order and visibility set in Admin → Homepage sections. */
export function HomeBody() {
  const { home } = useSiteSettings();
  let customIndex = 0;
  return (
    <>
      {home.sections.filter((s) => s.visible).map((s) => {
        if (s.id.startsWith("custom:")) {
          const c = home.custom.find((x) => `custom:${x.id}` === s.id);
          return c ? <CustomSection key={s.id} section={c} flip={customIndex++ % 2 === 1} /> : null;
        }
        const render = BUILT_IN[s.id as BuiltInSection];
        return render ? <div key={s.id} className="contents">{render()}</div> : null;
      })}
    </>
  );
}
