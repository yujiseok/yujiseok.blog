// Tiptap 의 attrs 는 스키마가 타입을 보장하지 않는 Record<string, any> 다.
// 읽는 쪽에서 한 번만 좁힌다.
export const asString = (value: unknown): string | null =>
  typeof value === "string" ? value : null;

export const asNumber = (value: unknown): number | null =>
  typeof value === "number" ? value : null;

export const asBoolean = (value: unknown): boolean | null =>
  typeof value === "boolean" ? value : null;
