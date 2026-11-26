import type { Metadata } from "next";
import { getCategory } from "@/data/categories";
import { getT } from "@/lib/i18n/server";
import { localizeCategory } from "@/data/i18n-data";
import { CategoryServices } from "@/components/catalog/CategoryServices";

type Props = { params: Promise<{ category: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { category } = await params;
  const sp = await searchParams;
  const { t, lang } = await getT();
  const base = getCategory(category);
  if (!base) return { title: t("Services") };
  const cat = localizeCategory(base, lang);
  const sub = cat.subcategories.find((s) => s.slug === sp.sub);
  const title = sub ? `${sub.name} — ${cat.name}` : t("{cat} services", { cat: cat.name });
  return { title, description: sub?.description ?? cat.description, alternates: { canonical: `/services/${cat.slug}${sub ? `?sub=${sub.slug}` : ""}` } };
}

export default async function ServicesByCategory({ params }: Props) {
  const { category } = await params;
  return <CategoryServices slug={category} />;
}
