import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { AboutInvitation, ClosingInvite, PlannerTeaser, Polaroids, SplitFlapStats, WeddingDoors } from "@/components/home/Cinematic";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutInvitation />
      <Polaroids />
      <SplitFlapStats />
      <PlannerTeaser />
      <WeddingDoors />
      <ClosingInvite />
    </>
  );
}
