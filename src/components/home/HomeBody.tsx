"use client";

import type { ReactNode } from "react";
import { useSiteSettings } from "../SiteSettingsProvider";
import { ClosingInvite, PlannerTeaser } from "./Cinematic";
import { FeaturedServices, HomeFaq, InspirationGallery, Testimonials } from "./HomeSections";
import { EventProcess } from "./EventProcess";
import { CustomSection } from "./CustomSection";
import type { BuiltInSection } from "@/lib/home-content";
import { SectionScene, SectionThread } from "../motion/SectionScene";

const BUILT_IN: Record<BuiltInSection, () => ReactNode> = {
  featured: () => <FeaturedServices />,
  process: () => <EventProcess />,
  planner: () => <PlannerTeaser />,
  gallery: () => <InspirationGallery />,
  testimonials: () => <Testimonials />,
  faq: () => <HomeFaq />,
  closing: () => <ClosingInvite />,
};

/** Sections with sticky, scroll-pinned scenes: wrapping them would fight their own scroll animation. */
const PINNED = new Set<string>(["process"]);

/** Everything below the hero, in the order and visibility set in Admin → Homepage sections. */
export function HomeBody() {
  const { home } = useSiteSettings();
  let customIndex = 0;
  return (
    <>
      {home.sections.filter((s) => s.visible).map((s, i) => {
        let content: ReactNode = null;
        if (s.id.startsWith("custom:")) {
          const c = home.custom.find((x) => `custom:${x.id}` === s.id);
          content = c ? <CustomSection section={c} flip={customIndex++ % 2 === 1} /> : null;
        } else {
          const render = BUILT_IN[s.id as BuiltInSection];
          content = render ? render() : null;
        }
        if (!content) return null;
        // Sections whose own animation pins them to the screen keep their scroll behaviour untouched.
        const pinned = PINNED.has(s.id);
        return (
          <div key={s.id}>
            {i > 0 && <SectionThread />}
            {pinned ? content : <SectionScene>{content}</SectionScene>}
          </div>
        );
      })}
    </>
  );
}
