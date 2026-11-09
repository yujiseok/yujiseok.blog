"use client";

import Link from "next/link";

import { useLocaleContext } from "@/app/_components/locale-provider";
import { localizedPath, stripLocale } from "@/lib/i18n/locales";

// 본문의 내부 링크(`/posts/x`)는 접두사 없이 적혀 있다. 읽는 언어로 붙여 준다(이미 붙어 있으면 갈아 끼운다).
export const LocalizedLink = ({
  href,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => {
  const { locale } = useLocaleContext();

  return <Link {...props} href={localizedPath(locale, stripLocale(href))} />;
};
