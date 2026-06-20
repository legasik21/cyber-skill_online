// Pure deterministic pricing module for the Ace Tanker service.
// Dependency-free: no React, no "use client", no imports.

// Pricing based on Tier
export const TIER_PRICING = {
  "lower": 15.0,
  "8": 20.0,
  "9_10": 23.0,
  "11": 27.0,
}

export const TIER_LABELS = {
  "lower": "Tier I - VII",
  "8": "Tier VIII",
  "9_10": "Tier IX - X",
  "11": "Tier XI",
}

export type AceTankerInput = {
  tankTier: string
  isSpg?: boolean
  getReplays?: boolean
}

export function priceAceTanker(input: AceTankerInput): {
  base: number
  spgExtra: number
  replaysExtra: number
  total: number
} {
  const { tankTier, isSpg, getReplays } = input

  const base = TIER_PRICING[tankTier as keyof typeof TIER_PRICING]

  // SPG adds 100% to base price (doubles it)
  const spgExtra = isSpg ? base : 0

  const adjustedBase = base + spgExtra

  // Get Replays adds 20% to the Adjusted Base
  const replaysExtra = getReplays ? adjustedBase * 0.20 : 0

  const total = adjustedBase + replaysExtra

  return { base, spgExtra, replaysExtra, total }
}
