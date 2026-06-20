// Pure, dependency-free pricing module for the WoT Tier Leveling service.
// 1:1 port of the inline pricing logic from the tier-leveling page.

// Price for each tier (cumulative from tier 1)
export const TIER_PRICES: Record<number, number> = {
  1: 0,
  2: 1,
  3: 2,
  4: 3,
  5: 10,
  6: 13,
  7: 17,
  8: 20,
  9: 23,
  10: 27,
  11: 64,
}

export const SILVER_OPTIONS = [
  { id: "none", label: "No Silver", price: 0 },
  { id: "10m", label: "10,000,000 Silver", price: 45 },
  { id: "20m", label: "20,000,000 Silver", price: 85 },
]

export const NO_BOOSTERS_EXTRA_PERCENT = 0.30 // 30% extra for no boosters
export const SPG_EXTRA_PERCENT = 0.30 // 30% extra for SPG (Artillery)

export type TierLevelingInput = {
  fromTier: number
  toTier: number
  isSPG?: boolean
  dontUseBoosters?: boolean
  selectedSilverIds?: string
}

export type TierLevelingPrice = {
  base: number
  noBoostersCharge: number
  spgCharge: number
  silverCost: number
  total: number
}

// Calculate the base price for leveling from one tier to another.
// Sums TIER_PRICES for tiers fromTier+1 .. toTier inclusive (fromTier itself NOT included).
function calculateBasePrice(fromTier: number, toTier: number): number {
  let total = 0
  for (let tier = fromTier + 1; tier <= toTier; tier++) {
    total += TIER_PRICES[tier] || 0
  }
  return total
}

export function priceTierLeveling(input: TierLevelingInput): TierLevelingPrice {
  const { fromTier, toTier, isSPG, dontUseBoosters, selectedSilverIds } = input

  const base = calculateBasePrice(fromTier, toTier)

  // Surcharges are both computed off the raw base (additive, not compounded).
  const noBoostersCharge = dontUseBoosters ? base * NO_BOOSTERS_EXTRA_PERCENT : 0
  const spgCharge = isSPG ? base * SPG_EXTRA_PERCENT : 0

  const silverOption = SILVER_OPTIONS.find((opt) => opt.id === selectedSilverIds)
  const silverCost = silverOption ? silverOption.price : 0

  const total = base + noBoostersCharge + spgCharge + silverCost

  return { base, noBoostersCharge, spgCharge, silverCost, total }
}
