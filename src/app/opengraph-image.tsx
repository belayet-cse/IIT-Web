import { ImageResponse } from "next/og"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

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
          backgroundColor: "#003366",
          backgroundImage:
            "radial-gradient(circle at 22% 20%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 45%), radial-gradient(circle at 82% 85%, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0) 50%)",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 120,
            height: 120,
            borderRadius: 20,
            backgroundColor: "#ffffff",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <svg width="72" height="72" viewBox="0 0 32 32" fill="none">
            <path d="M8 8H24V10H8V8Z" fill="#003366" />
            <path d="M10 12H14V24H10V12Z" fill="#003366" />
            <path d="M18 12H14V24H18V12Z" fill="#003366" />
            <path d="M22 12H18V24H22V12Z" fill="#003366" />
          </svg>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 56,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: -1,
            textAlign: "center",
          }}
        >
          Institute of International Trade
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#d4af37",
            marginTop: 20,
            fontWeight: 600,
            letterSpacing: 2,
          }}
        >
          IITRADE.ORG
        </div>
      </div>
    ),
    { ...size }
  )
}
