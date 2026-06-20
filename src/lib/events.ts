/* ------------------------------------------------------------------ *
 *  Shared World of Tanks event data — single source of truth.          *
 *                                                                      *
 *  Verified against official WoT EU/NA news (worldoftanks.eu / .com).  *
 *  Current as of 2026-06-16. Both the /events page and the homepage    *
 *  "Current Events" section read this data through useEvents() so the   *
 *  two can never drift apart.                                          *
 *                                                                      *
 *  i18n NOTE: the localized event copy now lives in messages/<locale>  *
 *  under the "events.data" namespace (en + de). Update events THERE     *
 *  (both locales). This module only keeps the Tailwind accent class map *
 *  (needs to be statically present so Tailwind detects the classes),    *
 *  the types, and the useEvents() hook that reads the active locale.    *
 * ------------------------------------------------------------------ */

import { useTranslations } from "next-intl";

// Full literal class strings per accent so Tailwind can statically detect them.
export const ACCENTS = {
  red: { border: "border-red-500/50", grad: "from-red-500/10", badge: "bg-red-500", text: "text-red-400", btn: "bg-red-600 hover:bg-red-700" },
  cyan: { border: "border-cyan-500/50", grad: "from-cyan-500/10", badge: "bg-cyan-500", text: "text-cyan-400", btn: "bg-cyan-600 hover:bg-cyan-700" },
  amber: { border: "border-amber-500/50", grad: "from-amber-500/10", badge: "bg-amber-500", text: "text-amber-400", btn: "bg-amber-600 hover:bg-amber-700" },
  emerald: { border: "border-emerald-500/50", grad: "from-emerald-500/10", badge: "bg-emerald-500", text: "text-emerald-400", btn: "bg-emerald-600 hover:bg-emerald-700" },
} as const

export type Accent = keyof typeof ACCENTS

export type FeatureEvent = {
  emoji: string
  title: string
  description: string
  accent: Accent
  badge: string
  details: { icon: string; text: string }[]
  boostTitle: string
  offers: { label: string; price: string; note: string }[]
  ctaLabel: string
  ctaHref: string
}

export type PastEvent = {
  emoji: string
  title: string
  description: string
  ended: string
}

/**
 * Reads the localized event data for the active locale. Must be called from a
 * Client Component (both the homepage and /events page are client components).
 */
export function useEvents(): {
  active: FeatureEvent[]
  upcoming: FeatureEvent[]
  past: PastEvent[]
} {
  const t = useTranslations("events")
  return {
    active: t.raw("data.active") as FeatureEvent[],
    upcoming: t.raw("data.upcoming") as FeatureEvent[],
    past: t.raw("data.past") as PastEvent[],
  }
}
