import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { localizedPageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

// Post-checkout utility pages (success/error) should not be indexed.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "order" });
  return localizedPageMetadata({
    locale: locale as Locale,
    path: "/order",
    title: t("metaTitle"),
    description: t("metaDescription"),
    noindex: true,
  });
}

export default async function OrderLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return children;
}
