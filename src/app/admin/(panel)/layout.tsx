import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { isAdminRequest } from "@/lib/server/admin-auth";
import { AdminFrame } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Every admin page is verified on the server before it renders. */
export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  if (!(await isAdminRequest())) redirect("/admin/login");
  return <AdminFrame>{children}</AdminFrame>;
}
