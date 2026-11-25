import type { Metadata } from "next";
import { getT } from "@/lib/i18n/server";
import { CategoryLanding } from "@/components/services/CategoryLanding";


export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  const title = t("Birthday");
  const description = t("Birthday décor, balloon styling, photo booths, DJs and photography in Bangladesh.");
  return { title, description, alternates: { canonical: "/birthday" }, openGraph: { title: `${title} · ${t("MUHURTO")}`, description } };
}

export default function Page() {
  return <CategoryLanding slug="birthday" />;
}
