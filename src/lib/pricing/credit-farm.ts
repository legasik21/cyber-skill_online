// Pure, dependency-free pricing module for the Credit & Bonds Farming service.
// Ported 1:1 from src/app/services/credit-farm/page.tsx pricing useEffect.

// Pricing per credit million based on WN8 tier
export const CREDIT_PRICING = {
  "under-2500": 4.5, // $4.5 per million for Under 2500 WN8
  "over-2500": 6.0, // $6 per million for More than 2500 WN8
}

export const WN8_TIER_LABELS = {
  "under-2500": "Under 2500 WN8",
  "over-2500": "More than 2500 WN8",
}

// Bonds pricing per 100 bonds
export const BONDS_BASE_PRICE = 7.0 // $7 per 100 bonds

// Bonds WN8 modifiers
export const BONDS_WN8_MODIFIERS = {
  "2000": 0, // 2000 WN8 - standard price (0% modifier)
  "2500-3000": 50, // +50%
  "3000-4000": 100, // +100%
  "4000+": 150, // +150%
}

export const BONDS_WN8_LABELS = {
  "2000": "2000 WN8",
  "2500-3000": "2500-3000 WN8",
  "3000-4000": "3000-4000 WN8",
  "4000+": "4000+ WN8",
}

export type CreditFarmInput = {
  serviceType: "credits" | "bonds"
  tier: string
  amount: number
  cannotUseSilverBoosters?: boolean
}

export type CreditFarmResult = {
  base: number
  discountPercent: number
  silverCharge: number
  total: number
}

export function priceCreditFarm(input: CreditFarmInput): CreditFarmResult {
  const { serviceType, tier, amount, cannotUseSilverBoosters } = input
  const amountValue = amount

  if (serviceType === "credits" && amountValue < 1) {
    return { base: 0, discountPercent: 0, silverCharge: 0, total: 0 }
  }

  if (serviceType === "bonds" && amountValue < 100) {
    return { base: 0, discountPercent: 0, silverCharge: 0, total: 0 }
  }

  let base = 0
  let discountPercent = 0

  if (serviceType === "credits") {
    // Credits pricing
    const pricePerMillion = CREDIT_PRICING[tier as keyof typeof CREDIT_PRICING] || 0
    base = amountValue * pricePerMillion

    // Volume discounts for credits
    if (amountValue >= 70) {
      discountPercent = 20
    } else if (amountValue >= 40) {
      discountPercent = 15
    } else if (amountValue >= 20) {
      discountPercent = 10
    }
  } else if (serviceType === "bonds") {
    // Bonds pricing - amount is in 100s
    const bondsHundreds = Math.floor(amountValue / 100)
    let pricePerHundred = BONDS_BASE_PRICE

    // Apply WN8 modifier
    const modifier = BONDS_WN8_MODIFIERS[tier as keyof typeof BONDS_WN8_MODIFIERS] || 0
    pricePerHundred = pricePerHundred * (1 + modifier / 100)

    base = bondsHundreds * pricePerHundred

    // No volume discounts for bonds
  }

  const discountAmount = base * (discountPercent / 100)
  const afterDiscount = base - discountAmount

  // Calculate silver boosters charge (only for credits)
  let silverCharge = 0
  if (serviceType === "credits" && cannotUseSilverBoosters) {
    silverCharge = afterDiscount * 0.30 // 30% additional charge
  }

  const total = afterDiscount + silverCharge

  return { base, discountPercent, silverCharge, total }
}
