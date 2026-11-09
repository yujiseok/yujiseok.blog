import { notFound } from "next/navigation";

import { isLocale } from "@/lib/i18n/locales";
import { llmsFullResponse } from "@/lib/seo/responses";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return llmsFullResponse(locale);
}
