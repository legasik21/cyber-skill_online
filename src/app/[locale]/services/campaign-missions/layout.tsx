import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { localizedPageMetadata, SITE_NAME } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

const PATH = "/services/campaign-missions";

type Props = { children: ReactNode; params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "campaignMissions" });
  return {
    ...localizedPageMetadata({
      locale: locale as Locale,
      path: PATH,
      title: t("metaTitle"),
      description: t("metaDescription"),
    }),
    // Absolute title for this page itself, PLUS a template so the child routes
    // (1.0 / 2.0 / 3.0) still inherit the "%s | CyberSkill" suffix. A plain
    // string title here would swallow the template for descendants.
    title: { absolute: `${t("metaTitle")} | ${SITE_NAME}`, template: `%s | ${SITE_NAME}` },
  };
}

// NOTE: Service/BreadcrumbList JSON-LD for this page lives in page.tsx (not
// here) so it does NOT cascade onto the 1.0/2.0/3.0 child routes.
export default async function Layout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return children;
}
