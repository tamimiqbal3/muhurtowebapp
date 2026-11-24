import "server-only";
import { NextResponse } from "next/server";
import { SITE_URL } from "../config";

export async function readGatewayForm(req: Request): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  try {
    const form = await req.formData();
    form.forEach((v, k) => {
      if (typeof v === "string") out[k] = v;
    });
  } catch {
    const url = new URL(req.url);
    url.searchParams.forEach((v, k) => (out[k] = v));
  }
  return out;
}

/** 303 so the browser follows the gateway's POST with a GET. */
export function redirectTo(path: string) {
  return NextResponse.redirect(`${SITE_URL}${path}`, 303);
}
