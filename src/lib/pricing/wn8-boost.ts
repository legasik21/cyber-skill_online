// Pure, dependency-free pricing module for the WN8 / Winrate / High Damage boost service.
// 1:1 port of the inline logic from src/app/services/wn8-boost/page.tsx.
// NO rounding here — callers apply toFixed only for display.

// Pricing per battle based on WN8 tier
export const WN8_PRICING = {
  "2500-3000": 1.1, // $1.1 per battle
  "3000-4000": 1.5, // $1.5 per battle
  "4000+": 1.8, // $1.8 per battle
}

// Winrate boosting pricing
export const WINRATE_PRICING = {
  "60%": 1.0, // $1 per battle
  "65%": 1.5, // $1 + 50% = $1.5 per battle
  "70%": 2.5, // $1 + 150% = $2.5 per battle
}

// High Damage pricing
export const DAMAGE_PRICING = {
  "4000+": 1.75, // $1.75 per battle
  "4500+": 2.0, // $2 per battle
  "5000+": 2.5, // $2.5 per battle
}

// Minimum battles required for any pricing.
export const MIN_BATTLES = 20

export type Wn8BoostInput = {
  serviceType: "wn8" | "winrate" | "damage"
  tier: string
  numberOfBattles: number
  playSPG?: boolean
  getReplays?: boolean
}

export function priceWn8Boost(input: Wn8BoostInput): {
  base: number
  discountPercent: number
  total: number
} {
  const { serviceType, tier, numberOfBattles, playSPG, getReplays } = input

  if (numberOfBattles < MIN_BATTLES) {
    return { base: 0, discountPercent: 0, total: 0 }
  }

  // Get base price per battle based on service type
  let pricePerBattle = 0
  if (serviceType === "wn8") {
    pricePerBattle = WN8_PRICING[tier as keyof typeof WN8_PRICING] || 0
  } else if (serviceType === "winrate") {
    pricePerBattle = WINRATE_PRICING[tier as keyof typeof WINRATE_PRICING] || 0
  } else {
    pricePerBattle = DAMAGE_PRICING[tier as keyof typeof DAMAGE_PRICING] || 0
  }

  // Apply SPG modifier (+100%) only where available:
  // - wn8 tiers 2500-3000 and 3000-4000
  // - winrate tier 60%
  const isSPGApplicable =
    (serviceType === "wn8" &&
      !!playSPG &&
      (tier === "2500-3000" || tier === "3000-4000")) ||
    (serviceType === "winrate" && !!playSPG && tier === "60%")

  if (isSPGApplicable) {
    pricePerBattle = pricePerBattle * 2
  }

  const base = numberOfBattles * pricePerBattle

  let discountPercent = 0
  if (numberOfBattles >= 100) {
    discountPercent = 20
  } else if (numberOfBattles >= 50) {
    discountPercent = 15
  }

  let total = base - base * (discountPercent / 100)

  if (getReplays) {
    total = total * 1.1
  }

  return { base, discountPercent, total }
}
