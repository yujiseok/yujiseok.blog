import type { Locale } from "@/lib/i18n/locales";

import { en } from "./en";
import { ko } from "./ko";

type Widen<T> = T extends string
  ? string
  : T extends (...args: never[]) => unknown
    ? T
    : T extends readonly (infer U)[]
      ? readonly Widen<U>[]
      : { [K in keyof T]: Widen<T[K]> };

/** ko가 기준이다. en은 `satisfies Dictionary`라 키가 빠지면 타입 오류가 난다. */
export type Dictionary = Widen<typeof ko>;

const dictionaries = { ko, en } as const satisfies Record<Locale, Dictionary>;

export const getDictionary = (locale: Locale): Dictionary =>
  dictionaries[locale];
