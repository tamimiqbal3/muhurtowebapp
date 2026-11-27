import type { Metadata } from "next";
import { getT } from "@/lib/i18n/server";
import { CategoryLanding } from "@/components/services/CategoryLanding";


export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  const title = t("Family Events");
  const description = t("Aqiqah, anniversary, Eid and family gathering decor, seating, lighting and photography.");
  return { title, description, alternates: { canonical: "/family-events" }, openGraph: { title: `${title} · ${t("MUHURTO")}`, description } };
}

export default function Page() {
  return <CategoryLanding slug="family-events" />;
}
