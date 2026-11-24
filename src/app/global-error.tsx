"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#f7f3ec", color: "#17130f", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 500 }}>MUHURTO is temporarily unavailable</h1>
          <p>Please refresh the page in a moment.</p>
          <button onClick={reset} style={{ marginTop: 16, padding: "10px 22px", borderRadius: 999, border: 0, background: "#9b2226", color: "#fff", cursor: "pointer" }}>Try again</button>
        </div>
      </body>
    </html>
  );
}
