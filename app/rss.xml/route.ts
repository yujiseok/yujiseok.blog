import { rssResponse } from "@/lib/seo/responses";

// 기존 구독자를 위해 한국어 피드는 옛 주소를 그대로 둔다. 영어는 /en/rss.xml.
export const GET = () => rssResponse("ko");
