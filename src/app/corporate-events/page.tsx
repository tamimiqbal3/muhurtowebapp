import type { Metadata } from "next";
import { CategoryLanding } from "@/components/services/CategoryLanding";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Corporate Events",
  description: "Conference staging, seating, AV, lighting and coverage for corporate events in Bangladesh.",
  alternates: { canonical: "/corporate-events" },
  openGraph: { title: "Corporate Events · MUHURTO", description: "Conference staging, seating, AV, lighting and coverage for corporate events in Bangladesh." },
};

export default function Page() {
  return <CategoryLanding slug="corporate-events" />;
}
