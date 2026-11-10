import { requireLocale, type LocaleParams } from "@/lib/i18n/params";
import { llmsFullResponse } from "@/lib/seo/responses";

export async function GET(_request: Request, { params }: LocaleParams) {
  const locale = await requireLocale(params);

  return llmsFullResponse(locale);
}
