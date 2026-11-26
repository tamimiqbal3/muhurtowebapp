import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { ClosingInvite, PlannerTeaser, Polaroids } from "@/components/home/Cinematic";
import { FeaturedServices, HomeFaq, InspirationGallery, Testimonials } from "@/components/home/HomeSections";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedServices />
      <Polaroids />
      <PlannerTeaser />
      <InspirationGallery />
      <Testimonials />
      <HomeFaq />
      <ClosingInvite />
    </>
  );
}
