import { getT } from "@/lib/i18n/server";
import { TruckLoader } from "@/components/ui/TruckLoader";

export default async function Loading() {
  const { t } = await getT();
  return <TruckLoader label={t("Delivering your moment")} />;
}
