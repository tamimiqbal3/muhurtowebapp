// Custom next/image loader: delegates resizing to the image CDN (Pexels /
// Unsplash) so responsive srcsets work without Vercel optimisation quota.
export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }): string {
  if (src.startsWith("/")) return src;
  try {
    const url = new URL(src);
    if (url.hostname === "images.pexels.com") {
      url.searchParams.set("auto", "compress");
      url.searchParams.set("cs", "tinysrgb");
      url.searchParams.set("w", String(width));
      url.searchParams.delete("h");
      url.searchParams.delete("dpr");
      return url.toString();
    }
    if (url.hostname === "images.unsplash.com") {
      url.searchParams.set("auto", "format");
      url.searchParams.set("fit", "crop");
      url.searchParams.set("w", String(width));
      url.searchParams.set("q", String(quality ?? 72));
      return url.toString();
    }
    return src;
  } catch {
    return src;
  }
}
