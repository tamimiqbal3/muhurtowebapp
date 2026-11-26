import type { Metadata } from "next";
import { getT } from "@/lib/i18n/server";
import { SearchResults } from "@/components/catalog/SearchResults";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Search services"), description: t("Search décor, catering, photography, lighting and sound services in Dhaka.") };
}

export default function SearchPage() {
  return <SearchResults />;
}
