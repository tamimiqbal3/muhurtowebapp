import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "MUHURTO — Every Moment Deserves to Be Extraordinary";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const logo = `data:image/png;base64,${(await readFile(join(process.cwd(), "public/brand/muhurto-logo-192.png"))).toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "linear-gradient(120deg, #0a1633 0%, #015fff 60%, #00befe 100%)", color: "#fbfcff", fontFamily: "Georgia, serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 84, height: 84, borderRadius: 999, background: "#fbfcff", display: "flex", alignItems: "center", justifyContent: "center" }}><img src={logo} width={76} height={76} alt="" /></div>
          <div style={{ fontSize: 44, letterSpacing: 10 }}>MUHURTO</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, lineHeight: 1.05, maxWidth: 900 }}>Every Moment Deserves to Be Extraordinary.</div>
          <div style={{ marginTop: 24, fontSize: 28, color: "#ffe6a3", fontFamily: "sans-serif" }}>Weddings · Birthdays · Corporate · Family · Food — Bangladesh</div>
        </div>
      </div>
    ),
    size,
  );
}
