import type { Metadata } from "next";
import { CategoryLanding } from "@/components/services/CategoryLanding";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Birthday",
  description: "Birthday décor, balloon styling, photo booths, DJs and photography in Bangladesh.",
  alternates: { canonical: "/birthday" },
  openGraph: { title: "Birthday · MUHURTO", description: "Birthday décor, balloon styling, photo booths, DJs and photography in Bangladesh." },
};

export default function Page() {
  return <CategoryLanding slug="birthday" />;
}
