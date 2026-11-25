"use client";

// Rendered outside the root layout (no providers), so it reads the language cookie directly.
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  const bn = typeof document !== "undefined" && /(?:^|;\s*)muhurto_lang=bn/.test(document.cookie);
  return (
    <html lang={bn ? "bn" : "en"}>
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#f4f7fc", color: "#0a1633", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 500 }}>{bn ? "মুহূর্ত সাময়িকভাবে অনুপলব্ধ" : "MUHURTO is temporarily unavailable"}</h1>
          <p>{bn ? "কিছুক্ষণ পর পৃষ্ঠাটি রিফ্রেশ করুন।" : "Please refresh the page in a moment."}</p>
          <button onClick={reset} style={{ marginTop: 16, padding: "10px 22px", borderRadius: 999, border: 0, background: "#015fff", color: "#fff", cursor: "pointer" }}>{bn ? "আবার চেষ্টা করুন" : "Try again"}</button>
        </div>
      </body>
    </html>
  );
}
