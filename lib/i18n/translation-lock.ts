import { createHash } from "node:crypto";

/** "writing/slug" → 번역 당시 원문의 sha256 */
export type TranslationLock = Record<string, string>;

export type TranslationStatus = "fresh" | "stale" | "missing";

export const hashSource = (source: string): string =>
  createHash("sha256").update(source).digest("hex");

export const translationStatus = ({
  key,
  hash,
  exists,
  lock,
}: {
  key: string;
  hash: string;
  exists: boolean;
  lock: TranslationLock;
}): TranslationStatus => {
  if (!exists) return "missing";
  return lock[key] === hash ? "fresh" : "stale";
};
