import type { Metadata } from "next";
import { getT } from "@/lib/i18n/server";
import { CategoryLanding } from "@/components/services/CategoryLanding";


export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  const title = t("Wedding");
  const description = t("Bangladeshi wedding decor, holud stages, photography, lighting and sound.");
  return { title, description, alternates: { canonical: "/wedding" }, openGraph: { title: `${title} · ${t("MUHURTO")}`, description } };
}

export default function Page() {
  return <CategoryLanding slug="wedding" />;
}
