interface MarkdownSource {
  title: string;
  summary?: string;
  publishedAt: string;
  url: string;
  body: string;
}

/*
 * 에이전트·LLM에게 줄 글 원문. HTML은 내비·스타일·shiki 마크업에 본문이 묻혀
 * 토큰만 먹는다. 원문 MDX 본문을 그대로 쓰되, 파일만 받아도 무슨 글이고 어디서
 * 왔는지 알 수 있게 제목·요약·출처를 머리에 붙인다.
 */
export const toMarkdown = ({
  title,
  summary,
  publishedAt,
  url,
  body,
}: MarkdownSource): string =>
  [
    `# ${title}`,
    "",
    ...(summary ? [`> ${summary}`, ""] : []),
    `- Published: ${publishedAt}`,
    `- Source: ${url}`,
    "",
    body.trim(),
    "",
  ].join("\n");
