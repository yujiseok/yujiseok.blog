import { ImageResponse } from "next/og";
import { getWritingBySlug } from "@/lib/content/repository";
import { SITE_NAME } from "@/lib/constants";
import { ogCard } from "@/lib/og-card";
import { requireLocale } from "@/lib/i18n/params";

export const alt = `${SITE_NAME} Post`;
export const size = {
  width: 1920,
  height: 1080,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: PageProps<"/[locale]/posts/[slug]">) {
  const locale = await requireLocale(params);
  const { slug } = await params;
  const writing = await getWritingBySlug(slug, locale);

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

  return ogCard(writing.metadata.title, size);
}
