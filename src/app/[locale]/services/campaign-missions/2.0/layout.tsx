import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { localizedPageMetadata, serviceJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import type { Locale } from "@/i18n/routing";

const PATH = "/services/campaign-missions/2.0";

type Props = { children: ReactNode; params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "campaign20" });
  return localizedPageMetadata({
    locale: locale as Locale,
    path: PATH,
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default async function Layout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "campaign20" });
  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: t("metaTitle"),
          description: t("metaDescription"),
          path: PATH,
          locale: locale as Locale,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: t("breadcrumb.home"), path: "/" },
            { name: t("breadcrumb.services"), path: "/#services" },
            { name: t("breadcrumb.campaign"), path: "/services/campaign-missions" },
            { name: t("breadcrumb.current"), path: PATH },
          ],
          locale as Locale,
        )}
      />
      {children}
    </>
  );
}
