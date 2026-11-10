import path from "node:path";

/** 에디터는 로컬 개발 서버 전용이다. 페이지·액션·라우트가 각자 이 판정으로 막는다 */
export const isDevelopment = () => process.env.NODE_ENV === "development";

/**
 * resolve된 경로가 dir 바로 아래 항목인지. 검증을 통과한 이름이라도 디스크에
 * 닿기 직전에 한 번 더 확인해, 경로 조작으로 dir 밖으로 빠지는 길을 막는다.
 */
export const isDirectChild = (dir: string, filePath: string) =>
  path.dirname(filePath) === dir;
