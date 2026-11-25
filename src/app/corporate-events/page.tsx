import type { Metadata } from "next";
import { getT } from "@/lib/i18n/server";
import { CategoryLanding } from "@/components/services/CategoryLanding";


export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  const title = t("Corporate Events");
  const description = t("Conference staging, seating, AV, lighting and coverage for corporate events in Bangladesh.");
  return { title, description, alternates: { canonical: "/corporate-events" }, openGraph: { title: `${title} · ${t("MUHURTO")}`, description } };
}

export default function Page() {
  return <CategoryLanding slug="corporate-events" />;
}
