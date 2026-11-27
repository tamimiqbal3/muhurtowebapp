import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { HomeBody } from "@/components/home/HomeBody";

export const metadata: Metadata = { alternates: { canonical: "/" } };

/** The hero, then every section in the order chosen in Admin → Homepage sections. */
export default function HomePage() {
  return (
    <>
      <Hero />
      <HomeBody />
    </>
  );
}
