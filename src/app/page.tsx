import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { AboutInvitation, ClosingInvite, PlannerTeaser, Polaroids, ServicesFan, SplitFlapStats, WeddingDoors } from "@/components/home/Cinematic";
import { Scene } from "@/components/motion/Cinema";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function HomePage() {
  return (
    <>
      <Hero />
      <Scene><AboutInvitation /></Scene>
      <Polaroids />
      <SplitFlapStats />
      <Scene><PlannerTeaser /></Scene>
      <WeddingDoors />
      <Scene><ServicesFan /></Scene>
      <Scene tilt={12}><ClosingInvite /></Scene>
    </>
  );
}
