import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware navigation APIs. Use these everywhere internal links/navigation
 * are needed instead of the bare `next/link` + `next/navigation` equivalents,
 * so the active locale is carried automatically:
 *
 *   import { Link, useRouter, usePathname, redirect, getPathname } from "@/i18n/navigation";
 *
 * Hrefs stay locale-agnostic (e.g. "/services/wn8-boost"); next-intl prefixes
 * "/de" only when the active locale is German (localePrefix: "as-needed").
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
