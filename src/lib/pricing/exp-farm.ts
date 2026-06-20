// Pure, dependency-free pricing module for the Experience (XP) Farming service.
// 1:1 port of the inline pricing logic from src/app/services/exp-farm/page.tsx.

// Pricing per 10,000 XP based on WN8 tier
export const EXP_PRICING = {
  "under-2500": 3.0, // $3 per 10k XP for Under 2500 WN8
  "over-2500": 4.5, // $4.5 per 10k XP for More than 2500 WN8
}

export const WN8_TIER_LABELS = {
  "under-2500": "Under 2500 WN8",
  "over-2500": "More than 2500 WN8",
}

export const XP_BOOSTERS_SURCHARGE = 0.30

export type ExpFarmInput = {
  expAmount: number
  wn8Tier: string
  cannotUseXPBoosters?: boolean
}

export function priceExpFarm(input: ExpFarmInput): {
  base: number
  discountPercent: number
  xpBoostersCharge: number
  total: number
} {
  const { expAmount, wn8Tier, cannotUseXPBoosters } = input

  if (expAmount < 1) {
    return { base: 0, discountPercent: 0, xpBoostersCharge: 0, total: 0 }
  }

  const pricePer10k = EXP_PRICING[wn8Tier as keyof typeof EXP_PRICING]
  // expAmount is in thousands (e.g. 50 = 50,000 XP)
  // Pricing is per 10k, so we divide amount by 10
  const unitsOf10k = expAmount / 10
  const base = unitsOf10k * pricePer10k

  let discountPercent = 0
  if (expAmount >= 500) {
    discountPercent = 20
  } else if (expAmount >= 250) {
    discountPercent = 15
  } else if (expAmount >= 100) {
    discountPercent = 10
  }

  const afterDiscount = base - (base * discountPercent) / 100

  const xpBoostersCharge = cannotUseXPBoosters
    ? afterDiscount * XP_BOOSTERS_SURCHARGE
    : 0

  const total = afterDiscount + xpBoostersCharge

  return { base, discountPercent, xpBoostersCharge, total }
}
