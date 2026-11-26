import { NextResponse } from "next/server";
import { ADMIN_COOKIE, checkCredentials } from "@/lib/server/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { username?: unknown; password?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    /* empty */
  }
  const username = typeof body.username === "string" ? body.username.slice(0, 120) : "";
  const password = typeof body.password === "string" ? body.password.slice(0, 200) : "";
  const token = username && password ? checkCredentials(username, password) : null;
  if (!token) {
    await new Promise((r) => setTimeout(r, 700)); // slow down guessing
    return NextResponse.json({ error: "The username or password is incorrect." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 60 * 60 * 12 });
  return res;
}
