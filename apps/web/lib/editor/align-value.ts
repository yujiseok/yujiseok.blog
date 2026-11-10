export const ALIGNS = ["left", "center", "right"] as const;

export type Align = (typeof ALIGNS)[number];

export const toAlign = (value: unknown): Align | null =>
  ALIGNS.find((align) => align === value) ?? null;
