import type { Metadata } from "next";
import type { ReactNode } from "react";
import { isAdminConfigured } from "@/lib/firebase/admin";
import { requirePageUser } from "@/lib/server/auth";
import { CustomerShell } from "@/components/dashboard/CustomerNav";
import { FirebaseSetupNotice } from "@/components/ui/SetupNotice";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  if (!isAdminConfigured()) {
    return <FirebaseSetupNotice feature="Accounts" />;
  }
  const user = await requirePageUser("/dashboard");
  return <CustomerShell name={user.name}>{children}</CustomerShell>;
}
