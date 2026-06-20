"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = { en: "EN", de: "DE" };

/**
 * DE / EN language switcher. Uses next-intl's locale-aware navigation so the
 * current path is preserved when switching (only the locale prefix changes),
 * and the choice is persisted via next-intl's NEXT_LOCALE cookie (written by
 * the middleware on the resulting navigation).
 */
export default function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function switchTo(next: string) {
    if (next === locale) return;
    startTransition(() => {
      // `pathname` is locale-agnostic; router applies the new locale prefix.
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border border-border/60 bg-secondary/30 p-0.5",
        className,
      )}
      role="group"
      aria-label="Language"
    >
      {routing.locales.map((loc) => {
        const active = loc === locale;
        return (
          <button
            key={loc}
            type="button"
            onClick={() => switchTo(loc)}
            disabled={isPending}
            aria-current={active ? "true" : undefined}
            lang={loc}
            className={cn(
              "px-2 py-1 text-xs font-semibold rounded-[5px] transition-colors disabled:opacity-50",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {LABELS[loc] ?? loc.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
