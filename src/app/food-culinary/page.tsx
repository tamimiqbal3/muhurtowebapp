import type { Metadata } from "next";
import { CategoryLanding } from "@/components/services/CategoryLanding";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Food & Culinary",
  description: "Catering platters, live fuchka counters and cha / coffee stations for events in Bangladesh.",
  alternates: { canonical: "/food-culinary" },
  openGraph: { title: "Food & Culinary · MUHURTO", description: "Catering platters, live fuchka counters and cha / coffee stations for events in Bangladesh." },
};

export default function Page() {
  return <CategoryLanding slug="food-culinary" />;
}
