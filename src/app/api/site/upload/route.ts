import { NextResponse } from "next/server";
import { handle } from "@/lib/server/api";
import { ApiError } from "@/lib/server/auth";
import { isAdminConfigured } from "@/lib/firebase/admin";
import { isAdminRequest } from "@/lib/server/admin-auth";
import { saveImage } from "@/lib/server/site-store";

export const dynamic = "force-dynamic";

const TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

/** Admin image upload → Firebase Storage. Returns a permanent public URL. */
export const POST = handle(async (req: Request) => {
  if (!(await isAdminRequest())) throw new ApiError(401, "Your admin session has ended. Please sign in again.");
  if (!isAdminConfigured()) throw new ApiError(503, "Firebase server access is not set up yet.");
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) throw new ApiError(400, "No image received.");
  if (!TYPES.has(file.type)) throw new ApiError(400, "Upload a JPEG, PNG or WebP image.");
  if (file.size > 8 * 1024 * 1024) throw new ApiError(413, "That image is too large (8 MB max).");
  const url = await saveImage(Buffer.from(await file.arrayBuffer()), file.type);
  return NextResponse.json({ url });
});
