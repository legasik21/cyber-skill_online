import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

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

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((path) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    changeFrequency: path.startsWith("/services") ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path.startsWith("/services") ? 0.8 : 0.5,
  }));
}
