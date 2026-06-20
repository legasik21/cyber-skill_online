import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

/**
 * Per-request i18n config consumed by Server Components and the
 * NextIntlClientProvider. Falls back to the default locale for any unknown
 * `requestLocale` so the build never throws on an unexpected segment.
 *
 * Messages live in single per-locale files (messages/en.json, messages/de.json)
 * organized by namespace; de.json mirrors en.json 1:1.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
