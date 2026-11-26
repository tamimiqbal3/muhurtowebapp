import { getT } from "@/lib/i18n/server";
import { EventLoader } from "@/components/ui/EventLoader";

export default async function Loading() {
  const { t } = await getT();
  return <EventLoader title={t("Preparing your event")} steps={[t("Arranging the décor"), t("Preparing the menu"), t("Setting up the lighting"), t("Booking the photographer")]} />;
}
