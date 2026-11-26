import type { Metadata } from "next";
import { getSeedService } from "@/data/services";
import { getT } from "@/lib/i18n/server";
import { localizeService } from "@/data/i18n-data";
import { ServiceDetail } from "@/components/catalog/ServiceDetail";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { t, lang } = await getT();
  const found = getSeedService(id);
  if (!found) return { title: t("Services") };
  const service = localizeService(found, lang);
  return { title: service.name, description: service.shortDescription, alternates: { canonical: `/service/${service.id}` } };
}

export default async function ServicePage({ params }: Props) {
  const { id } = await params;
  return <ServiceDetail id={id} />;
}
