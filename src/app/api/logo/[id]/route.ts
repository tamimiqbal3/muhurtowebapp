import { PAYMENT_METHODS, remoteLogos } from "@/data/payments";

/**
 * Serves a payment provider's official logo from our own domain. The first request fetches the provider's
 * published file; after that the CDN keeps it for a year, so logos appear instantly instead of waiting on
 * slow third-party hosts and redirects.
 */
export const runtime = "nodejs";

const TYPES = new Set(["image/svg+xml", "image/png", "image/jpeg", "image/webp"]);

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const method = PAYMENT_METHODS.find((m) => m.id === id);
  if (!method) return new Response("Not found", { status: 404 });

  for (const url of remoteLogos(method)) {
    try {
      const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(6000), next: { revalidate: 60 * 60 * 24 * 30 } } as RequestInit);
      const type = (res.headers.get("content-type") ?? "").split(";")[0].trim();
      if (!res.ok || !TYPES.has(type)) continue;
      const body = await res.arrayBuffer();
      if (body.byteLength > 1_500_000) continue;
      return new Response(body, {
        headers: {
          "Content-Type": type,
          "Cache-Control": "public, max-age=604800, s-maxage=31536000, stale-while-revalidate=604800",
          // SVGs are shown as images only; never let them run anything.
          "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
        },
      });
    } catch { /* try the next source */ }
  }
  return new Response("No logo", { status: 404, headers: { "Cache-Control": "public, s-maxage=3600" } });
}
