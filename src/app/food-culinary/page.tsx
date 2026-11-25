import type { Metadata } from "next";
import { getT } from "@/lib/i18n/server";
import { CategoryLanding } from "@/components/services/CategoryLanding";


export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  const title = t("Food & Culinary");
  const description = t("Catering platters, live fuchka counters and cha / coffee stations for events in Bangladesh.");
  return { title, description, alternates: { canonical: "/food-culinary" }, openGraph: { title: `${title} · ${t("MUHURTO")}`, description } };
}

export default function Page() {
  return <CategoryLanding slug="food-culinary" />;
}
