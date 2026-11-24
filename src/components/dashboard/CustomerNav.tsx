"use client";

import { LayoutDashboard, CalendarRange, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { Shell } from "./Shell";

export function CustomerShell({ name, children }: { name: string; children: ReactNode }) {
  return (
    <Shell
      title={`Hello, ${name.split(" ")[0]}`}
      subtitle="Customer dashboard"
      links={[
        { href: "/dashboard", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
        { href: "/dashboard/bookings", label: "Bookings", icon: <CalendarRange className="h-4 w-4" /> },
        { href: "/dashboard/profile", label: "Profile", icon: <UserRound className="h-4 w-4" /> },
      ]}
    >
      {children}
    </Shell>
  );
}
