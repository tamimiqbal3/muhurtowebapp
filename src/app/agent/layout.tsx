import type { Metadata } from "next";
import type { ReactNode } from "react";
import { isAdminConfigured } from "@/lib/firebase/admin";
import { requirePageRole } from "@/lib/server/auth";
import { Forbidden } from "@/components/dashboard/Shell";
import { FirebaseSetupNotice } from "@/components/ui/SetupNotice";

export const metadata: Metadata = { title: "Agent workspace", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AgentLayout({ children }: { children: ReactNode }) {
  if (!isAdminConfigured()) return <FirebaseSetupNotice feature="The agent workspace" />;
  const user = await requirePageRole(["agent"], "/agent");
  if (user === "forbidden") return <Forbidden area="Monitoring Agent workspace" />;
  return <div className="container-x pt-28">{children}</div>;
}
