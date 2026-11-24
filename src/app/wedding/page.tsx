import type { Metadata } from "next";
import { CategoryLanding } from "@/components/services/CategoryLanding";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Wedding",
  description: "Bangladeshi wedding décor, holud stages, photography, lighting and sound.",
  alternates: { canonical: "/wedding" },
  openGraph: { title: "Wedding · MUHURTO", description: "Bangladeshi wedding décor, holud stages, photography, lighting and sound." },
};

export default function Page() {
  return <CategoryLanding slug="wedding" />;
}
