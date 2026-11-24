import type { Metadata } from "next";
import { CategoryLanding } from "@/components/services/CategoryLanding";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Family Events",
  description: "Aqiqah, anniversary, Eid and family gathering décor, seating, lighting and photography.",
  alternates: { canonical: "/family-events" },
  openGraph: { title: "Family Events · MUHURTO", description: "Aqiqah, anniversary, Eid and family gathering décor, seating, lighting and photography." },
};

export default function Page() {
  return <CategoryLanding slug="family-events" />;
}
