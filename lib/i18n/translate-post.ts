import { checkTranslation } from "./translation-check";

export const MIN_REVIEW_SCORE = 4;

export interface ClaudeRequest {
  kind: "translate" | "review";
  system: string;
  input: string;
}

/** claude CLI 호출 경계. 테스트는 가짜를, 스크립트는 실제 CLI 를 넘긴다 */
export type ClaudeCall = (request: ClaudeRequest) => Promise<string>;

export interface Review {
  score: number;
  issues: string[];
}

export type TranslatePostResult =
  | { ok: true; translation: string; score: number; issues: [] }
  | { ok: false; translation?: string; issues: string[] };

export const TRANSLATE_SYSTEM = `You translate a Korean personal tech blog post (MDX file) into English.
Output ONLY the full content of the translated .mdx file. No preface, no explanation, no surrounding \`\`\` fence.

Rules:
- Keep \`export const metadata = {...}\` as valid JSON with the same keys in the same order. Translate only "title" and "summary". Leave every other value (publishedAt, published, image) exactly as is.
- Never alter fenced code blocks or inline code, byte for byte, including Korean strings and comments inside them.
- Keep JSX components and their props as they are. Translate only the \`alt\` prop.
- Keep every link href and image src unchanged. Translate link text.
- Keep the heading structure (count and levels) identical.
- Preserve the author's first-person blog voice: natural, conversational English, not stiff or machine-like. Keep emoji.
- Do not leave Korean text outside code. Proper nouns may be romanized.`;

export const REVIEW_SYSTEM = `You review an English translation of a Korean blog post (MDX).
The input has the Korean source and the English translation. Check for omissions, mistranslation, and awkward or unnatural English.
Reply with ONLY a JSON object: {"score": <integer 1-5>, "issues": ["..."]}
5 = faithful and natural, 4 = minor nits, 3 or below = real omissions/mistranslations. issues must be an empty array when there is nothing to fix.`;

export const stripCodeFence = (output: string): string => {
  const match = output.match(/^\s*```[\w-]*\n([\s\S]*?)\n```\s*$/);
  return match ? `${match[1]}\n` : output;
};

export const parseReview = (output: string): Review | null => {
  const start = output.indexOf("{");
  const end = output.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    const data = JSON.parse(output.slice(start, end + 1)) as Partial<Review>;
    if (
      typeof data.score !== "number" ||
      !Number.isInteger(data.score) ||
      data.score < 1 ||
      data.score > 5
    ) {
      return null;
    }
    const issues = Array.isArray(data.issues)
      ? data.issues.filter((i): i is string => typeof i === "string")
      : [];
    return { score: data.score, issues };
  } catch {
    return null;
  }
};

const withFeedback = (source: string, issues: string[]) =>
  `${source}\n\n---\n[REVIEWER FEEDBACK] The previous attempt had these problems. Fix them and output the full file again:\n${issues.map((i) => `- ${i}`).join("\n")}\n`;

const attempt = async (
  source: string,
  claude: ClaudeCall,
  feedback: string[] | undefined,
): Promise<{ translation: string; issues: string[]; score?: number }> => {
  const raw = await claude({
    kind: "translate",
    system: TRANSLATE_SYSTEM,
    input: feedback ? withFeedback(source, feedback) : source,
  });
  const translation = stripCodeFence(raw);

  const structural = await checkTranslation(source, translation);
  if (structural.length > 0) return { translation, issues: structural };

  const reviewRaw = await claude({
    kind: "review",
    system: REVIEW_SYSTEM,
    input: `<source>\n${source}\n</source>\n\n<translation>\n${translation}\n</translation>`,
  });
  const review = parseReview(reviewRaw);
  if (!review) {
    return { translation, issues: ["리뷰 응답을 JSON 으로 읽지 못했습니다"] };
  }
  if (review.score < MIN_REVIEW_SCORE) {
    return {
      translation,
      score: review.score,
      issues: [`리뷰 점수 ${review.score}/5`, ...review.issues],
    };
  }
  return { translation, score: review.score, issues: [] };
};

/** 번역 → 구조 검사 → LLM 리뷰. 실패하면 issues 를 피드백으로 한 번만 재시도한다 */
export const translatePost = async (
  source: string,
  { claude }: { claude: ClaudeCall },
): Promise<TranslatePostResult> => {
  const first = await attempt(source, claude, undefined);
  if (first.issues.length === 0 && first.score !== undefined) {
    return {
      ok: true,
      translation: first.translation,
      score: first.score,
      issues: [],
    };
  }

  const second = await attempt(source, claude, first.issues);
  if (second.issues.length === 0 && second.score !== undefined) {
    return {
      ok: true,
      translation: second.translation,
      score: second.score,
      issues: [],
    };
  }
  return { ok: false, translation: second.translation, issues: second.issues };
};
