"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { Spinner } from "../ui/misc";

/** Client-side gate used in demo mode (no Firebase): requires a demo sign-in. */
export function DemoGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (!loading && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, user, router, pathname]);
  if (loading || !user) return <div className="flex min-h-[60vh] items-center justify-center"><Spinner /></div>;
  return <>{children}</>;
}
