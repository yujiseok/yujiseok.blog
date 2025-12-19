import { ImageResponse } from "next/og";
import { getAllWritings } from "@/lib/utils";

export const alt = "Yujiseok's Blog Post";
export const size = {
  width: 1920,
  height: 1080,
};
export const contentType = "image/png";

const getWritingBySlug = (slug: string) => {
  const writings = getAllWritings();
  return writings.find((writing) => writing.slug === slug);
};

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const writing = getWritingBySlug(slug);

  if (!writing) {
    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "white",
          fontSize: 48,
        }}
      >
        Post not found
      </div>,
      {
        ...size,
      },
    );
  }

  const postTitle = writing.metadata.title;

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
        {postTitle}
      </div>
    </div>,
    {
      ...size,
    },
  );
}
