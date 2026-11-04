import { ImageResponse } from "next/og";

export const alt = "Lead N — Cold Calling CRM for Sales Teams";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#FFFFFF",
          padding: 80,
          fontFamily: "sans-serif",
          backgroundImage: "radial-gradient(circle at 90% 10%, #FFF7F2 0%, #FFFFFF 60%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              backgroundColor: "#FF6B2C",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 24,
              fontWeight: 800,
            }}
          >
            LN
          </div>
          <span style={{ fontSize: 36, fontWeight: 800, color: "#0F172A", letterSpacing: -1 }}>
            Lead<span style={{ color: "#FF6B2C" }}> N</span>
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 960 }}>
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 800,
              color: "#0F172A",
              lineHeight: 1.1,
              letterSpacing: -2,
            }}
          >
            Know exactly who to call next.
          </div>
          <div style={{ fontSize: 26, color: "#64748B", lineHeight: 1.4, maxWidth: 840 }}>
            Cold-calling CRM for sales teams. Smart queue, one-tap outcome logging, duplicate detection, and automated WhatsApp follow-ups.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 32, fontSize: 18, color: "#475569" }}>
          <span>✓ India-first, Global-ready</span>
          <span>✓ One-tap Outcome Logging</span>
          <span>✓ Bulk WhatsApp & SMS</span>
          <span>✓ Anet Labs</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
