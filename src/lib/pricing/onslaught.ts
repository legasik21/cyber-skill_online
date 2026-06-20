// Pure, dependency-free pricing module for the Onslaught Boosting service.
// 1:1 port of the inline logic from src/app/services/onslaught/page.tsx.

// Points-based ranking system
export const MIN_POINTS = 0
export const MAX_POINTS = 4500

// Rank stages based on points
export const POINTS_STAGES = [
  { id: "iron", label: "Iron", minPoints: 0, maxPoints: 499 },
  { id: "bronze", label: "Bronze", minPoints: 500, maxPoints: 999 },
  { id: "silver", label: "Silver", minPoints: 1000, maxPoints: 1499 },
  { id: "gold", label: "Gold", minPoints: 1500, maxPoints: 1999 },
  { id: "champion", label: "Champion", minPoints: 2000, maxPoints: 2999 },
  { id: "possible-legend", label: "Possible Legend", minPoints: 3000, maxPoints: 3999 },
  { id: "legend", label: "Legend", minPoints: 4000, maxPoints: 4500 },
] as const

// Price per 100 points for each rank tier
export const PRICE_PER_100_POINTS = [
  { minPoints: 0, maxPoints: 999, rate: 3 }, // Iron/Bronze
  { minPoints: 1000, maxPoints: 1499, rate: 4 }, // Silver
  { minPoints: 1500, maxPoints: 1999, rate: 6 }, // Gold
  { minPoints: 2000, maxPoints: 2999, rate: 10 }, // Champion
  { minPoints: 3000, maxPoints: 3999, rate: 15 }, // Possible Legend
  { minPoints: 4000, maxPoints: 4500, rate: 20 }, // Legend
] as const

export const SILVER_OPTIONS = [
  { id: "none", label: "None", price: 0 },
  { id: "10m", label: "10M Credits", price: 45.86 },
  { id: "20m", label: "20M Credits", price: 81.13 },
] as const

// Play with Booster (Platoon) modifier and 30-missions flat charge
export const BOOSTER_RATE = 0.40
export const MISSIONS_CHARGE = 40

export type OnslaughtInput = {
  currentPoints: number
  targetPoints: number
  playWithBooster?: boolean
  silverOption?: string
  completeMissions?: boolean
}

// Helper function to calculate price for points range
export function calculatePointsPrice(fromPoints: number, toPoints: number): number {
  if (fromPoints >= toPoints) return 0

  let price = 0
  for (const tier of PRICE_PER_100_POINTS) {
    const tierStart = Math.max(fromPoints, tier.minPoints)
    const tierEnd = Math.min(toPoints, tier.maxPoints + 1)
    if (tierStart < tierEnd) {
      price += ((tierEnd - tierStart) / 100) * tier.rate
    }
  }
  return Math.round(price * 100) / 100
}

export function priceOnslaught(input: OnslaughtInput): {
  base: number
  boosterCharge: number
  silverCharge: number
  missionsCharge: number
  total: number
} {
  const { currentPoints, targetPoints, playWithBooster, silverOption, completeMissions } = input

  const base = calculatePointsPrice(currentPoints, targetPoints)
  const boosterCharge = playWithBooster ? base * BOOSTER_RATE : 0
  const selectedSilver = SILVER_OPTIONS.find((o) => o.id === silverOption)
  const silverCharge = selectedSilver ? selectedSilver.price : 0
  const missionsCharge = completeMissions ? MISSIONS_CHARGE : 0
  const total = Math.round((base + boosterCharge + silverCharge + missionsCharge) * 100) / 100

  return {
    base: Math.round(base * 100) / 100,
    boosterCharge: Math.round(boosterCharge * 100) / 100,
    silverCharge,
    missionsCharge,
    total,
  }
}
