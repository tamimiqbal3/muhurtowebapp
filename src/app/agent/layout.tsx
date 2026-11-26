import type { Metadata } from "next";
import type { ReactNode } from "react";
import { isAdminConfigured } from "@/lib/firebase/admin";
import { requirePageRole } from "@/lib/server/auth";
import { Forbidden } from "@/components/dashboard/Shell";
import { FirebaseSetupNotice } from "@/components/ui/SetupNotice";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Agent workspace", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AgentLayout({ children }: { children: ReactNode }) {
  const { t } = await getT();
  if (!isAdminConfigured()) return <FirebaseSetupNotice feature={t("The agent workspace")} />;
  const user = await requirePageRole(["agent"], "/agent");
  if (user === "forbidden") return <Forbidden area={t("Monitoring Agent workspace")} />;
  return <div className="container-x pt-24 lg:pt-28">{children}</div>;
}
