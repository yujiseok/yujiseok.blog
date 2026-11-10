import { spawn } from "node:child_process";
import { tmpdir } from "node:os";

import type { ClaudeCall } from "@/lib/i18n/translate-post";

export const MODEL = "claude-sonnet-5-5";
const TIMEOUT_MS = 10 * 60 * 1000;

/**
 * `claude -p` 를 부른다. 프로젝트의 CLAUDE.md·도구가 번역에 끼어들지 않도록
 * 임시 디렉터리에서 도구 없이 실행한다.
 */
export const callClaude: ClaudeCall = ({ system, input }) =>
  new Promise((resolve, reject) => {
    const child = spawn(
      "claude",
      [
        "-p",
        "--model",
        MODEL,
        "--system-prompt",
        system,
        "--tools",
        "",
        "--no-session-persistence",
      ],
      { cwd: tmpdir(), stdio: ["pipe", "pipe", "pipe"] },
    );

    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`claude 호출이 ${TIMEOUT_MS / 1000}초를 넘겼습니다`));
    }, TIMEOUT_MS);

    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve(stdout);
      else reject(new Error(`claude 종료 코드 ${code}: ${stderr.trim()}`));
    });

    child.stdin.end(input);
  });
