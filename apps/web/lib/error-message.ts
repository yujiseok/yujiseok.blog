/** catch로 받은 unknown 값을 보여줄 문구로 바꾼다. Error가 아니면 fallback, 없으면 값 자체를 문자열로. */
export const errorMessage = (error: unknown, fallback?: string): string =>
  error instanceof Error ? error.message : (fallback ?? String(error));
