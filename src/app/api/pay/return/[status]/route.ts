import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/** SSLCOMMERZ posts the shopper back here; we forward to the result page, which validates server-side. */
async function back(req: NextRequest, { params }: { params: Promise<{ status: string }> }) {
  const { status } = await params;
  let fields: Record<string, string> = {};
  try {
    if (req.method === "POST") fields = Object.fromEntries([...(await req.formData()).entries()].map(([k, v]) => [k, String(v)]));
  } catch {
    /* no body */
  }
  const q = new URLSearchParams();
  const get = (k: string) => fields[k] ?? req.nextUrl.searchParams.get(k) ?? "";
  q.set("status", ["success", "fail", "cancel"].includes(status) ? status : "fail");
  for (const k of ["tran_id", "val_id", "value_a", "value_c"]) if (get(k)) q.set(k, get(k).slice(0, 80));
  return NextResponse.redirect(new URL(`/payment/result?${q}`, req.nextUrl.origin), 303);
}

export const POST = back;
export const GET = back;
