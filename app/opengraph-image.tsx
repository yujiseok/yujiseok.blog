import { ImageResponse } from "next/og";

export const alt = "Yujiseok's Blog";
export const size = {
  width: 1920,
  height: 1080,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        backgroundImage: "url(https://yujiseok.blog/og-bg.png)",
      }}
    >
      <div
        style={{
          marginLeft: 205,
          marginRight: 205,
          marginBottom: 205,
          display: "flex",
          fontSize: 105,
          letterSpacing: "-0.025em",
          fontStyle: "normal",
          color: "white",
          lineHeight: "110px",
          whiteSpace: "pre-wrap",
        }}
      >
        Yujiseok's Blog
      </div>
    </div>,
    {
      ...size,
    },
  );
}
