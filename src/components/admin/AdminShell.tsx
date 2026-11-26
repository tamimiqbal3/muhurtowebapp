"use client";

import type { ReactNode } from "react";
import { LayoutDashboard, CalendarRange, Store, Users, CreditCard, Layers, MessagesSquare, Radar, Star, Settings } from "lucide-react";
import { Shell } from "../dashboard/Shell";
import { useT } from "../i18n/LanguageProvider";

export function AdminShell({ children }: { children: ReactNode }) {
  const t = useT();
  return (
    <Shell
      title={t("Admin")}
      subtitle={t("MUHURTO operations")}
      links={[
        { href: "/admin", label: t("Overview"), icon: <LayoutDashboard className="h-4 w-4" /> },
        { href: "/admin/bookings", label: t("Bookings"), icon: <CalendarRange className="h-4 w-4" /> },
        { href: "/admin/customizations", label: t("Customisations"), icon: <MessagesSquare className="h-4 w-4" /> },
        { href: "/admin/services", label: t("Services & categories"), icon: <Layers className="h-4 w-4" /> },
        { href: "/admin/vendors", label: t("Vendors"), icon: <Store className="h-4 w-4" /> },
        { href: "/admin/agents", label: t("Monitoring agents"), icon: <Radar className="h-4 w-4" /> },
        { href: "/admin/customers", label: t("Customers"), icon: <Users className="h-4 w-4" /> },
        { href: "/admin/payments", label: t("Payments"), icon: <CreditCard className="h-4 w-4" /> },
        { href: "/admin/reviews", label: t("Reviews"), icon: <Star className="h-4 w-4" /> },
        { href: "/admin/settings", label: t("Site settings"), icon: <Settings className="h-4 w-4" /> },
      ]}
    >
      {children}
    </Shell>
  );
}

export function AdminTable({ head, children, min = 720 }: { head: string[]; children: ReactNode; min?: number }) {
  const t = useT();
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm" style={{ minWidth: min }}>
        <thead>
          <tr className="border-b border-line text-left text-xs text-muted">{head.map((h) => <th key={h} className="px-4 py-3 font-medium">{t(h)}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}
