import { defineRouting } from "next-intl/routing";

/**
 * Locale routing config (shared by the middleware, the navigation APIs and the
 * request config). English is the default and is served WITHOUT a prefix so the
 * existing indexed URLs and live Google Ads landing pages stay byte-for-byte
 * identical (e.g. /services/wn8-boost). German is served under /de/... .
 *
 * `localePrefix: "as-needed"` => default locale (en) has no prefix; non-default
 * locales (de) are prefixed. `localeDetection` lets first-time visitors get
 * redirected based on their Accept-Language header (default en), and the choice
 * is persisted in the NEXT_LOCALE cookie thereafter.
 */
export const routing = defineRouting({
  locales: ["en", "de"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  localeDetection: true,
});

export type Locale = (typeof routing.locales)[number];
