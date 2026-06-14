import type { Metadata } from "next";
import { reviews, reviewStats } from "@/lib/reviews";

/**
 * Production origin used to build absolute canonical / Open Graph / sitemap /
 * JSON-LD URLs.
 *
 * DEFERRED — set at deploy: point NEXT_PUBLIC_SITE_URL at the real domain
 * (e.g. https://cyberskill.pro). The localhost fallback exists only so local
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

const abs = (path: string): string =>
  path.startsWith("http") ? path : `${SITE_URL}${path === "/" ? "" : path}`;

/**
 * Per-page metadata. `title` is the page-specific part only — the root layout
 * applies the `%s | CyberSkill` template. Canonical/OG URLs are relative and
 * resolved to absolute by Next via `metadataBase` (set in the root layout).
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

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    inLanguage: "en",
    publisher: { "@id": ORG_ID },
  };
}

export function serviceJsonLd(opts: {
  name: string;
  description: string;
  path: string;
  priceFrom?: number;
}) {
  const { name, description, path, priceFrom } = opts;
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    serviceType: name,
    url: abs(path),
    provider: { "@id": ORG_ID },
    areaServed: "Worldwide",
  };
  if (typeof priceFrom === "number") {
    data.offers = {
      "@type": "Offer",
      priceCurrency: "USD",
      price: priceFrom,
      availability: "https://schema.org/InStock",
      url: abs(path),
    };
  }
  return data;
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: abs(item.path),
    })),
  };
}

/**
 * Homepage Product + AggregateRating + Review schema. Modeled as a Product
 * (most reliably eligible for review-snippet stars) representing the overall
 * boosting offering, with the honest on-page aggregate (≈4.7 / 15 reviews).
 */
export function boostingReviewsJsonLd() {
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
      reviewBody: r.review,
    })),
  };
}
