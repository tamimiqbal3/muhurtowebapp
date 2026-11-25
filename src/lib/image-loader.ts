// Custom next/image loader: delegates resizing to the image CDN (Pexels /
// Unsplash) so responsive srcsets work without Vercel optimisation quota.
export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }): string {
  if (src.startsWith("/")) return src;
  try {
    const url = new URL(src);
    if (url.hostname === "images.pexels.com") {
      // Full-quality sRGB (no "compress"/"tinysrgb"), and a little extra width so slow
      // camera moves (Ken Burns, parallax, scene zooms) never upscale the photo.
      url.searchParams.delete("auto");
      url.searchParams.set("cs", "srgb");
      url.searchParams.set("w", String(Math.min(Math.round(width * 1.25), 4000)));
      url.searchParams.set("fit", "crop");
      url.searchParams.delete("h");
      url.searchParams.delete("dpr");
      return url.toString();
    }
    if (url.hostname === "images.unsplash.com") {
      url.searchParams.set("auto", "format");
      url.searchParams.set("fit", "crop");
      url.searchParams.set("w", String(width));
      url.searchParams.set("q", String(quality ?? 90));
      return url.toString();
    }
    return src;
  } catch {
    return src;
  }
}
