"use client";

import { LayoutDashboard, CalendarRange, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { Shell } from "./Shell";
import { useT } from "../i18n/LanguageProvider";
import { useAuth } from "../auth/AuthProvider";

export function CustomerShell({ name, children }: { name?: string; children: ReactNode }) {
  const t = useT();
  const { user } = useAuth();
  const first = (name ?? user?.name ?? "").split(" ")[0];
  return (
    <Shell
      title={t("Hello, {name}", { name: first })}
      subtitle={t("Customer dashboard")}
      links={[
        { href: "/dashboard", label: t("Overview"), icon: <LayoutDashboard className="h-4 w-4" /> },
        { href: "/dashboard/bookings", label: t("Bookings"), icon: <CalendarRange className="h-4 w-4" /> },
        { href: "/dashboard/profile", label: t("Profile"), icon: <UserRound className="h-4 w-4" /> },
      ]}
    >
      {children}
    </Shell>
  );
}
