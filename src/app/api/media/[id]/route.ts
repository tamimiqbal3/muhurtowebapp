import { adminRtdb, isAdminConfigured } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

/** Serves an image uploaded in the admin panel (stored in Realtime Database). Cached by the CDN forever. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f0-9]{16,64}$/.test(id) || !isAdminConfigured()) return new Response("Not found", { status: 404 });
  const v = (await adminRtdb().ref(`media/${id}`).once("value")).val() as { type?: string; data?: string } | null;
  if (!v?.data || !v.type) return new Response("Not found", { status: 404, headers: { "Cache-Control": "public, s-maxage=60" } });
  return new Response(new Uint8Array(Buffer.from(v.data, "base64")), {
    headers: { "Content-Type": v.type, "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable" },
  });
}
