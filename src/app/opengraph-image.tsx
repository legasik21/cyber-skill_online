import { ImageResponse } from "next/og";

// Default social-share card for the whole site (Next applies it as og:image /
// twitter:image where pages don't define their own). Generated at build time,
// so it needs no static asset and no production domain.
export const alt = "CyberSkill — Professional World of Tanks Boosting Services";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a12 0%, #16101f 60%, #1c1330 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
          padding: "0 96px",
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", fontSize: 96, fontWeight: 800, letterSpacing: "-2px" }}>
          <span style={{ color: "#ffffff" }}>Cyber</span>
          <span style={{ color: "#8b5cf6" }}>Skill</span>
        </div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 40, color: "#c7c3d6", fontWeight: 500 }}>
          Professional World of Tanks Boosting
        </div>
        <div style={{ display: "flex", marginTop: 40, fontSize: 26, color: "#8b5cf6", fontWeight: 600 }}>
          WN8 · Credits · Campaign Missions · Marks of Excellence
        </div>
      </div>
    ),
    size,
  );
}
