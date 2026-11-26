"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/** Customer-facing header, footer and plan drawer; hidden inside the independent admin panel and printable invoices. */
export function SiteChrome({ header, footer, drawer, children }: { header: ReactNode; footer: ReactNode; drawer: ReactNode; children: ReactNode }) {
  const path = usePathname() ?? "/";
  const bare = path.startsWith("/admin") || path.startsWith("/invoice");
  if (bare) return <main id="main">{children}</main>;
  return (
    <>
      {header}
      <main id="main" className="min-h-[70vh]">{children}</main>
      {footer}
      {drawer}
    </>
  );
}
