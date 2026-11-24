import { ImageResponse } from "next/og";

export const alt = "MUHURTO — Every Moment Deserves to Be Extraordinary";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "linear-gradient(120deg, #17130f 0%, #3a1416 60%, #9b2226 100%)", color: "#fcfaf6", fontFamily: "Georgia, serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 56, height: 56, transform: "rotate(45deg)", border: "3px solid #b08d57", display: "flex" }} />
          <div style={{ fontSize: 44, letterSpacing: 10 }}>MUHURTO</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, lineHeight: 1.05, maxWidth: 900 }}>Every Moment Deserves to Be Extraordinary.</div>
          <div style={{ marginTop: 24, fontSize: 28, color: "#eadbc0", fontFamily: "sans-serif" }}>Weddings · Birthdays · Corporate · Family · Food — Bangladesh</div>
        </div>
      </div>
    ),
    size,
  );
}
