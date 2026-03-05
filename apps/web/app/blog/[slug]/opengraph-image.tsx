import { ImageResponse } from "next/og";
import { getPostBySlug } from "../posts";

export const runtime = "edge";
export const alt = "Applying Myself Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  const title = post?.title ?? "Blog";
  const category = post?.category ?? "Article";

  return new ImageResponse(
    (
      <div
        style={{
          background:
            "linear-gradient(135deg, #140f0a 0%, #1a1410 50%, #1c1612 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            right: "10%",
            width: "350px",
            height: "350px",
            background:
              "radial-gradient(circle, rgba(217, 119, 6, 0.1) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Category badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                background: "rgba(217, 119, 6, 0.15)",
                border: "1px solid rgba(217, 119, 6, 0.3)",
                borderRadius: "20px",
                padding: "6px 16px",
                fontSize: "14px",
                color: "#d97706",
                fontWeight: 600,
              }}
            >
              {category}
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: "52px",
              fontWeight: 700,
              color: "#f0e6d6",
              lineHeight: 1.15,
              maxWidth: "900px",
              fontFamily: "serif",
            }}
          >
            {title}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "22px",
              fontStyle: "italic",
              color: "#f0e6d6",
              fontFamily: "serif",
            }}
          >
            applying myself
          </span>
          <span
            style={{
              fontSize: "28px",
              color: "#d97706",
              marginLeft: "2px",
              lineHeight: 1,
            }}
          >
            .
          </span>
          <span
            style={{
              fontSize: "16px",
              color: "#8a7e72",
              marginLeft: "16px",
            }}
          >
            applyingmyself.com/blog
          </span>
        </div>

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
