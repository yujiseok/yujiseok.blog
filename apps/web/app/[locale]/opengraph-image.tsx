import { SITE_NAME } from "@/lib/constants";
import { ogCard } from "@/lib/og-card";

export const alt = SITE_NAME;
export const size = {
  width: 1920,
  height: 1080,
};
export const contentType = "image/png";

export default async function Image() {
  return ogCard(SITE_NAME, size);
}
