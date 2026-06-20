import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

// Localized 404 for unmatched routes inside a locale (rendered within the
// locale layout, so it inherits <html lang> and styling).
export default function LocaleNotFound() {
  const t = useTranslations("notFound");
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <p className="text-muted-foreground">{t("description")}</p>
      <Link href="/" className="text-primary underline underline-offset-4">
        {t("backHome")}
      </Link>
    </div>
  );
}
