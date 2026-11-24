"use client";

import type { ReactNode } from "react";
import { LayoutDashboard, CalendarRange, Store, Users, CreditCard, Layers, MessagesSquare, Radar, Star } from "lucide-react";
import { Shell } from "../dashboard/Shell";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <Shell
      title="Admin"
      subtitle="MUHURTO operations"
      links={[
        { href: "/admin", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
        { href: "/admin/bookings", label: "Bookings", icon: <CalendarRange className="h-4 w-4" /> },
        { href: "/admin/customizations", label: "Customisations", icon: <MessagesSquare className="h-4 w-4" /> },
        { href: "/admin/services", label: "Services & categories", icon: <Layers className="h-4 w-4" /> },
        { href: "/admin/vendors", label: "Vendors", icon: <Store className="h-4 w-4" /> },
        { href: "/admin/agents", label: "Monitoring agents", icon: <Radar className="h-4 w-4" /> },
        { href: "/admin/customers", label: "Customers", icon: <Users className="h-4 w-4" /> },
        { href: "/admin/payments", label: "Payments", icon: <CreditCard className="h-4 w-4" /> },
        { href: "/admin/reviews", label: "Reviews", icon: <Star className="h-4 w-4" /> },
      ]}
    >
      {children}
    </Shell>
  );
}

export function AdminTable({ head, children, min = 720 }: { head: string[]; children: ReactNode; min?: number }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm" style={{ minWidth: min }}>
        <thead>
          <tr className="border-b border-line text-left text-xs text-muted">{head.map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}
