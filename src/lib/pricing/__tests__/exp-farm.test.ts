import { describe, it, expect } from "vitest"
import { priceExpFarm } from "../exp-farm"

describe("priceExpFarm parity", () => {
  it("50k under-2500 => 15", () => {
    expect(priceExpFarm({ expAmount: 50, wn8Tier: "under-2500" }).total).toBeCloseTo(15, 2)
  })

  it("100k under-2500 (10% discount) => 27", () => {
    expect(priceExpFarm({ expAmount: 100, wn8Tier: "under-2500" }).total).toBeCloseTo(27, 2)
  })

  it("250k over-2500 + no XP boosters (15% discount, +30%) => 124.3125", () => {
    expect(
      priceExpFarm({ expAmount: 250, wn8Tier: "over-2500", cannotUseXPBoosters: true }).total
    ).toBeCloseTo(124.3125, 4)
  })

  it("500k over-2500 (20% discount) => 180", () => {
    expect(priceExpFarm({ expAmount: 500, wn8Tier: "over-2500" }).total).toBeCloseTo(180, 2)
  })
})
