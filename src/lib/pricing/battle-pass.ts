// Battle Pass pricing (pure, dependency-free)

export const PRICE_PER_LEVEL = 2.5
export const MAX_LEVELS = 50

export type BattlePassInput = {
  currentLevel: number
  targetLevel: number
}

export function priceBattlePass(input: BattlePassInput): {
  levelsToBoost: number
  basePrice: number
  discount: number
  total: number
} {
  const current = input.currentLevel === ("" as unknown as number) ? 0 : input.currentLevel
  const target = input.targetLevel === ("" as unknown as number) ? 0 : input.targetLevel

  if (current < 1 || target < current || target > MAX_LEVELS) {
    return { levelsToBoost: 0, basePrice: 0, discount: 0, total: 0 }
  }

  const levels = target - current + 1
  const base = levels * PRICE_PER_LEVEL

  let discountPercent = 0
  if (levels >= 50) {
    discountPercent = 15
  } else if (levels >= 25) {
    discountPercent = 10
  }

  const discountAmount = base * (discountPercent / 100)
  const total = base - discountAmount

  return {
    levelsToBoost: levels,
    basePrice: base,
    discount: discountPercent,
    total,
  }
}
