import { ImageResponse } from "next/og";

import { SITE_URL } from "@/lib/constants";

export const ogCard = (
  title: string,
  size: { width: number; height: number },
) =>
  new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        backgroundImage: `url(${SITE_URL}/og-bg.png)`,
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
        {title}
      </div>
    </div>,
    { ...size },
  );
