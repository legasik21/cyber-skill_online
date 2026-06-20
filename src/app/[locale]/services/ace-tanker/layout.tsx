import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { localizedPageMetadata, serviceJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import type { Locale } from "@/i18n/routing";

const PATH = "/services/ace-tanker";

type Props = { children: ReactNode; params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "aceTanker" });
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
  const t = await getTranslations({ locale, namespace: "aceTanker" });
  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: t("metaTitle"),
          description: t("metaDescription"),
          path: PATH,
          priceFrom: 10,
          locale: locale as Locale,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: t("breadcrumb.home"), path: "/" },
            { name: t("breadcrumb.services"), path: "/#services" },
            { name: t("breadcrumb.current"), path: PATH },
          ],
          locale as Locale,
        )}
      />
      {children}
    </>
  );
}
