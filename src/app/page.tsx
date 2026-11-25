import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { ClosingInvite, FounderAbout, PlannerTeaser, Polaroids, ServicesFan, SplitFlapStats, WeddingDoors } from "@/components/home/Cinematic";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function HomePage() {
  return (
    <>
      <Hero />
      <FounderAbout />
      <Polaroids />
      <SplitFlapStats />
      <PlannerTeaser />
      <WeddingDoors />
      <ServicesFan />
      <ClosingInvite />
    </>
  );
}
