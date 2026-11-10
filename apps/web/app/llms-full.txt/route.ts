import { llmsFullResponse } from "@/lib/seo/responses";

// 접두사 없는 주소는 한국어 원문이다. 번역본은 /en/llms-full.txt.
export const GET = () => llmsFullResponse("ko");
