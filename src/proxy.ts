import { NextResponse, type NextRequest } from "next/server";

/**
 * Fast pre-check for protected areas (Next.js 16 "proxy", formerly
 * middleware). It only checks that a session cookie exists; the real
 * verification and role checks happen server-side in each protected
 * layout and API route using Firebase Admin.
 */
export function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (path.startsWith("/admin")) {
    if (path === "/admin/login" || req.cookies.get("muhurto_admin")?.value) return NextResponse.next();
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  const hasSession = Boolean(req.cookies.get("__session")?.value);
  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin", "/admin/:path*", "/agent/:path*", "/my-bookings", "/checkout", "/booking/:id+"],
};
