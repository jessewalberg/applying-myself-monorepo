import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Applying Myself - AI-Powered Cover Letters & Job Tracker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #140f0a 0%, #1a1410 50%, #1c1612 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          position: "relative",
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            right: "15%",
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, rgba(217, 119, 6, 0.12) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Logo text */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "40px",
          }}
        >
          <span
            style={{
              fontSize: "28px",
              fontStyle: "italic",
              color: "#f0e6d6",
              fontFamily: "serif",
            }}
          >
            applying myself
          </span>
          <span
            style={{
              fontSize: "36px",
              color: "#d97706",
              marginLeft: "2px",
              lineHeight: 1,
            }}
          >
            .
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: 700,
            color: "#f0e6d6",
            lineHeight: 1.1,
            marginBottom: "24px",
            maxWidth: "700px",
            fontFamily: "serif",
          }}
        >
          Cover letters that sound like{" "}
          <span style={{ color: "#d97706", fontStyle: "italic" }}>you</span>{" "}
          wrote them.
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "24px",
            color: "#8a7e72",
            maxWidth: "600px",
            lineHeight: 1.5,
          }}
        >
          AI-powered cover letters + job application tracking. 30 seconds, not 30 minutes.
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: "0",
            left: "0",
            right: "0",
            height: "4px",
            background: "linear-gradient(90deg, #d97706, #ea580c, #d97706)",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
