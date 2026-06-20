"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function EventBanner() {
  const t = useTranslations("eventBanner");
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-red-900/95 via-orange-900/95 to-red-900/95 border-b border-red-500/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-2">
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-center">
          <span className="text-sm md:text-base font-semibold text-red-300">
            {t("title")}
          </span>
          <span className="hidden sm:inline text-xs md:text-sm text-muted-foreground">
            {t("dateRange")}
          </span>
          <span className="bg-red-500/30 text-red-300 text-xs px-2 py-0.5 rounded-full font-semibold border border-red-500/50">
            {t("activeNow")}
          </span>
          <Link
            href="/services/onslaught"
            className="text-xs md:text-sm text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors font-medium"
          >
            {t("readMore")}
          </Link>
        </div>
      </div>
    </div>
  );
}
