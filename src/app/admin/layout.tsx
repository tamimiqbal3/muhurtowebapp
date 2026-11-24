import type { Metadata } from "next";
import type { ReactNode } from "react";
import { isAdminConfigured } from "@/lib/firebase/admin";
import { requirePageRole } from "@/lib/server/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { Forbidden } from "@/components/dashboard/Shell";
import { FirebaseSetupNotice } from "@/components/ui/SetupNotice";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Server-side role gate: customers visiting /admin URLs get a 403 view and no data. */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  if (!isAdminConfigured()) return <FirebaseSetupNotice feature="The admin dashboard" />;
  const user = await requirePageRole(["admin"], "/admin");
  if (user === "forbidden") return <Forbidden area="admin dashboard" />;
  return <AdminShell>{children}</AdminShell>;
}
