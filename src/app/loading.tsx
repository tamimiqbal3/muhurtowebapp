import { getT } from "@/lib/i18n/server";
import { StageLoader } from "@/components/ui/StageLoader";

export default async function Loading() {
  const { t } = await getT();
  return <StageLoader label={t("Setting the stage")} />;
}
