import type { Metadata } from "next";
import { reviews, reviewStats, type Locale as ReviewLocale } from "@/lib/reviews";
import { routing } from "@/i18n/routing";

/**
 * Production origin used to build absolute canonical / Open Graph / sitemap /
 * JSON-LD URLs.
 *
 * DEFERRED — set at deploy: point NEXT_PUBLIC_SITE_URL at the real domain
 * (e.g. https://cyberskill.online). The localhost fallback exists only so local
 * production builds resolve cleanly; it must NOT be treated as the canonical
 * production domain. See docs/SEO_AUDIT_REPORT.md (DEFERRED checklist).
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

export const SITE_NAME = "CyberSkill";

export const SOCIAL_LINKS = [
  "https://www.instagram.com/cyberskill.pro/",
  "https://x.com/cyberskill_pro",
  "https://youtube.com/@cyberskill_pro",
  "https://www.tiktok.com/@cyberskill.pro",
];

type Locale = (typeof routing.locales)[number];

const abs = (path: string): string =>
  path.startsWith("http") ? path : `${SITE_URL}${path === "/" ? "" : path}`;

/**
 * Build the public URL for a locale-agnostic path in a given locale.
 * en (default) stays un-prefixed (localePrefix: "as-needed"); de gets "/de".
 *   localeUrl("en", "/services/wn8-boost") -> https://site/services/wn8-boost
 *   localeUrl("de", "/services/wn8-boost") -> https://site/de/services/wn8-boost
 *   localeUrl("de", "/")                   -> https://site/de
 */
export function localeUrl(locale: Locale, path: string): string {
  const clean = path === "/" ? "" : path;
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  return `${SITE_URL}${prefix}${clean}`;
}

/** OpenGraph locale tag for a given app locale. */
export function ogLocale(locale: Locale): string {
  return locale === "de" ? "de_DE" : "en_US";
}

/**
 * hreflang alternates for a locale-agnostic path: every locale's URL plus an
 * x-default pointing at the non-prefixed (en) URL. Used by every public page.
 */
export function hreflangAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = localeUrl(locale, path);
  }
  languages["x-default"] = localeUrl(routing.defaultLocale, path);
  return languages;
}

/**
 * Locale-aware per-page metadata. `title` is the page-specific part only — the
 * localized root layout applies the `%s | CyberSkill` template. Produces the
 * correct per-locale canonical, full hreflang alternate set (en / de / x-default)
 * and locale-specific OpenGraph tags.
 */
export function localizedPageMetadata(opts: {
  locale: Locale;
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
}): Metadata {
  const { locale, title, description, path, noindex } = opts;
  const canonical = localeUrl(locale, path);
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: hreflangAlternates(path),
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: ogLocale(locale),
      title,
      description,
      url: canonical,
      // Re-reference the generated OG image: a per-route openGraph override
      // otherwise drops the inherited file-convention image.
      images: ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
    ...(noindex ? { robots: { index: false, follow: false } } : null),
  };
}

/**
 * Legacy locale-agnostic metadata helper. Retained for non-localized, noindex
 * utility areas (e.g. /admin) where hreflang/canonical alternates are not wanted.
 */
export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
}): Metadata {
  const { title, description, path, noindex } = opts;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_US",
      title,
      description,
      url: path,
      images: ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
    ...(noindex ? { robots: { index: false, follow: false } } : null),
  };
}

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/cyber-skill_logo.svg`,
    description:
      "Professional World of Tanks boosting services — WN8, credits, campaign missions, Marks of Excellence and more.",
    sameAs: SOCIAL_LINKS,
  };
}

export function websiteJsonLd(locale: Locale = routing.defaultLocale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: localeUrl(locale, "/") + "/",
    name: SITE_NAME,
    inLanguage: locale,
    publisher: { "@id": ORG_ID },
  };
}

export function serviceJsonLd(opts: {
  name: string;
  description: string;
  path: string;
  priceFrom?: number;
  locale?: Locale;
}) {
  const { name, description, path, priceFrom, locale = routing.defaultLocale } = opts;
  const url = localeUrl(locale, path);
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    serviceType: name,
    url,
    inLanguage: locale,
    provider: { "@id": ORG_ID },
    areaServed: "Worldwide",
  };
  if (typeof priceFrom === "number") {
    data.offers = {
      "@type": "Offer",
      priceCurrency: "USD",
      price: priceFrom,
      availability: "https://schema.org/InStock",
      url,
    };
  }
  return data;
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
  locale: Locale = routing.defaultLocale,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: localeUrl(locale, item.path),
    })),
  };
}

/**
 * Homepage Product + AggregateRating + Review schema. Modeled as a Product
 * (most reliably eligible for review-snippet stars) representing the overall
 * boosting offering, with the honest on-page aggregate (≈4.7 / 15 reviews).
 * Review bodies follow the active locale so the structured data matches the
 * on-page reviews.
 */
export function boostingReviewsJsonLd(locale: Locale = routing.defaultLocale) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "CyberSkill World of Tanks Boosting Services",
    description:
      "Professional World of Tanks boosting — WN8, credit farming, campaign missions, Marks of Excellence, tier leveling and more.",
    brand: { "@type": "Brand", name: SITE_NAME },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: reviewStats.average,
      reviewCount: reviewStats.count,
      bestRating: 5,
      worstRating: 1,
    },
    review: reviews.map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.name },
      datePublished: r.date,
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.stars,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: r.body[locale as ReviewLocale] ?? r.body[routing.defaultLocale],
    })),
  };
}
