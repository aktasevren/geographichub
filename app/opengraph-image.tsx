import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "GeographicHub — A Hub of Interactive Maps";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "linear-gradient(135deg, #0b0b0c 0%, #1a1a1c 50%, #0b0b0c 100%)",
          color: "#fff",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            fontSize: 22,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#e8c36a",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "2px solid #e8c36a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#e8c36a",
              }}
            />
          </div>
          GeographicHub
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 110, lineHeight: 1, letterSpacing: "-0.02em" }}>
            One hub.
          </div>
          <div
            style={{
              fontSize: 110,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              fontStyle: "italic",
              color: "#e8c36a",
            }}
          >
            Many maps.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 20,
            color: "#ffffffaa",
            textTransform: "uppercase",
            letterSpacing: "0.2em",
          }}
        >
          <span>Interactive cartography</span>
          <span>Built on open data</span>
        </div>
      </div>
    ),
    size
  );
}
