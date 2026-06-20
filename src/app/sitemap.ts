import type { MetadataRoute } from "next";
import { localeUrl, hreflangAlternates } from "@/lib/seo";
import { routing } from "@/i18n/routing";

// Public, indexable routes only — admin/api/order are excluded (noindex).
const PATHS = [
  "/",
  "/events",
  "/referral",
  "/guarantee",
  "/services/wn8-boost",
  "/services/credit-farm",
  "/services/campaign-missions",
  "/services/campaign-missions/1.0",
  "/services/campaign-missions/2.0",
  "/services/campaign-missions/3.0",
  "/services/mark-of-excellence",
  "/services/onslaught",
  "/services/tier-leveling",
  "/services/exp-farm",
  "/services/ace-tanker",
  "/services/battle-pass",
  "/services/arcade-cabinet",
  "/services/referral-program",
  "/cookies",
  "/privacy",
  "/terms",
];

// One sitemap entry per (path × locale), each carrying the full set of
// hreflang alternates (en / de / x-default) so search engines discover both
// language versions. en stays un-prefixed; de is served under /de.
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  for (const path of PATHS) {
    const changeFrequency = path.startsWith("/services") ? "weekly" : "monthly";
    const priority = path === "/" ? 1 : path.startsWith("/services") ? 0.8 : 0.5;
    const languages = hreflangAlternates(path);
    for (const locale of routing.locales) {
      entries.push({
        url: localeUrl(locale, path),
        changeFrequency,
        priority,
        alternates: { languages },
      });
    }
  }
  return entries;
}
