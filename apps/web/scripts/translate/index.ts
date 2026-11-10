/*
 * content/writing/*.mdx → *.en.mdx 번역. 사용법:
 *   bun run translate [--only <slug>] [--force]
 * VERCEL·CI 에서는 번역하지 않고 오래된/없는 번역만 경고한다(종료 코드 0).
 */
import fs from "node:fs/promises";
import path from "node:path";

import { isPublished, parsePost } from "@/lib/content/document";
import {
  listLocaleFiles,
  toTranslationPath,
} from "@/lib/content/translation-path";
import { errorMessage } from "@/lib/error-message";
import { translatePost } from "@/lib/i18n/translate-post";
import {
  hashSource,
  translationStatus,
  type TranslationLock,
} from "@/lib/i18n/translation-lock";

import { callClaude } from "./claude";

const CONTENT_DIR = path.join(process.cwd(), "content");
const LOCK_PATH = path.join(CONTENT_DIR, ".translations.json");
// 번역 대상은 writing 만이다
const TYPES = ["writing"] as const;
const CONCURRENCY = 3;

interface Target {
  key: string;
  slug: string;
  sourcePath: string;
  outPath: string;
}

const parseArgs = (argv: string[]) => {
  const onlyIndex = argv.indexOf("--only");
  const value = onlyIndex === -1 ? undefined : argv[onlyIndex + 1];
  return {
    force: argv.includes("--force"),
    // `--only --force` 에서 --force 를 slug 로 읽지 않는다
    only: value?.startsWith("--") ? undefined : value,
  };
};

const readLock = async (): Promise<TranslationLock> => {
  try {
    return JSON.parse(await fs.readFile(LOCK_PATH, "utf8")) as TranslationLock;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return {};
    throw error;
  }
};

const writeLock = async (lock: TranslationLock) => {
  const sorted = Object.fromEntries(
    Object.entries(lock).sort(([a], [b]) => a.localeCompare(b)),
  );
  await fs.writeFile(LOCK_PATH, `${JSON.stringify(sorted, null, 2)}\n`);
};

const exists = (p: string) =>
  fs.access(p).then(
    () => true,
    () => false,
  );

const collectTargets = async (only?: string): Promise<Target[]> => {
  const targets: Target[] = [];
  for (const type of TYPES) {
    const dir = path.join(CONTENT_DIR, type);
    const sources = listLocaleFiles((await fs.readdir(dir)).sort(), "ko");
    for (const { file, slug } of sources) {
      if (only && slug !== only) continue;
      const sourcePath = path.join(dir, file);
      try {
        const { metadata } = parsePost(await fs.readFile(sourcePath, "utf8"));
        if (!isPublished(metadata)) continue;
      } catch (error) {
        console.warn(`건너뜀 ${type}/${file}: ${errorMessage(error)}`);
        continue;
      }
      targets.push({
        key: `${type}/${slug}`,
        slug,
        sourcePath,
        outPath: toTranslationPath(sourcePath),
      });
    }
  }
  return targets;
};

const runPool = async <T>(
  items: T[],
  size: number,
  fn: (item: T) => Promise<void>,
) => {
  const queue = [...items];
  await Promise.all(
    Array.from({ length: Math.min(size, queue.length) }, async () => {
      for (let item = queue.shift(); item; item = queue.shift()) await fn(item);
    }),
  );
};

type Pending = Target & { hash: string; source: string };

const findPending = async (
  targets: Target[],
  lock: TranslationLock,
  force: boolean,
) => {
  const pending: Pending[] = [];
  for (const target of targets) {
    const source = await fs.readFile(target.sourcePath, "utf8");
    const hash = hashSource(source);
    const status = translationStatus({
      key: target.key,
      hash,
      exists: await exists(target.outPath),
      lock,
    });
    if (status !== "fresh" || force) pending.push({ ...target, hash, source });
  }
  return pending;
};

const reportCi = (pending: Pending[]) => {
  for (const t of pending) {
    console.warn(`경고: ${t.key} 의 영어 번역이 없거나 원문과 어긋나 있습니다`);
  }
  console.log(`번역 건너뜀(CI/Vercel). 확인 필요 ${pending.length}편`);
};

const translateAll = async (pending: Pending[], lock: TranslationLock) => {
  const written: string[] = [];
  const failures: { key: string; issues: string[] }[] = [];
  // 동시에 끝난 편들이 파일을 겹쳐 쓰지 않도록 쓰기를 한 줄로 잇는다
  let lockWrites = Promise.resolve();

  await runPool(pending, CONCURRENCY, async (t) => {
    const started = Date.now();
    try {
      const result = await translatePost(t.source, { claude: callClaude });
      const seconds = Math.round((Date.now() - started) / 1000);
      if (!result.ok) {
        failures.push({ key: t.key, issues: result.issues });
        console.error(`실패 ${t.key} (${seconds}s)`);
        return;
      }
      await fs.writeFile(t.outPath, result.translation);
      lock[t.key] = t.hash;
      // 앞선 쓰기가 실패해도 체인이 거부 상태로 굳지 않게 끊는다. 그 실패는 그 편이 이미 받았다.
      lockWrites = lockWrites.catch(() => {}).then(() => writeLock(lock));
      await lockWrites;
      written.push(path.relative(process.cwd(), t.outPath));
      console.log(`완료 ${t.key} (리뷰 ${result.score}/5, ${seconds}s)`);
    } catch (error) {
      failures.push({ key: t.key, issues: [errorMessage(error)] });
      console.error(`오류 ${t.key}: ${errorMessage(error)}`);
    }
  });

  return { written, failures };
};

const main = async () => {
  const { force, only } = parseArgs(process.argv.slice(2));
  // 빈 값을 "지정 안 함"으로 읽으면 한 편만 돌리려다 전체를 번역하게 된다
  if (process.argv.includes("--only") && !only) {
    console.error("--only 에는 slug 를 지정해야 합니다");
    process.exit(1);
  }
  const targets = await collectTargets(only);
  if (only && targets.length === 0) {
    console.error(`발행된 글 중 slug "${only}" 를 찾지 못했습니다`);
    process.exit(1);
  }

  const lock = await readLock();
  const pending = await findPending(targets, lock, force);

  if (process.env.VERCEL || process.env.CI) return reportCi(pending);

  if (pending.length === 0) {
    console.log(`번역할 글이 없습니다 (대상 ${targets.length}편, 모두 최신)`);
    return;
  }
  console.log(`번역 ${pending.length}편 시작 (동시 ${CONCURRENCY})`);

  const { written, failures } = await translateAll(pending, lock);

  if (written.length > 0) {
    console.log("\n커밋할 파일:");
    for (const f of written.sort()) console.log(`  ${f}`);
    console.log("  content/.translations.json");
  }
  if (failures.length > 0) {
    console.error("\n실패 목록 (기존 번역은 그대로 둡니다):");
    for (const f of failures) {
      console.error(`- ${f.key}`);
      for (const issue of f.issues) console.error(`    ${issue}`);
    }
    process.exit(1);
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
