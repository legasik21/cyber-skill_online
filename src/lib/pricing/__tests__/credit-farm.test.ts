import { describe, it, expect } from "vitest"
import { priceCreditFarm } from "../credit-farm"

describe("priceCreditFarm parity", () => {
  it("credits, under-2500, 1M, no silver boosters => 5.85", () => {
    expect(
      priceCreditFarm({
        serviceType: "credits",
        tier: "under-2500",
        amount: 1,
        cannotUseSilverBoosters: true,
      }).total
    ).toBeCloseTo(5.85, 2)
  })

  it("credits, under-2500, 100M, use boosters => 360", () => {
    expect(
      priceCreditFarm({
        serviceType: "credits",
        tier: "under-2500",
        amount: 100,
        cannotUseSilverBoosters: false,
      }).total
    ).toBeCloseTo(360, 2)
  })

  it("credits, under-2500, 100M, no silver boosters => 468", () => {
    expect(
      priceCreditFarm({
        serviceType: "credits",
        tier: "under-2500",
        amount: 100,
        cannotUseSilverBoosters: true,
      }).total
    ).toBeCloseTo(468, 2)
  })

  it("credits, over-2500, 50M, use boosters => 255", () => {
    expect(
      priceCreditFarm({
        serviceType: "credits",
        tier: "over-2500",
        amount: 50,
        cannotUseSilverBoosters: false,
      }).total
    ).toBeCloseTo(255, 2)
  })

  it("bonds, 2500-3000, 500 => 52.5", () => {
    expect(
      priceCreditFarm({
        serviceType: "bonds",
        tier: "2500-3000",
        amount: 500,
      }).total
    ).toBeCloseTo(52.5, 2)
  })

  it("bonds, 2000, 100 => 7", () => {
    expect(
      priceCreditFarm({
        serviceType: "bonds",
        tier: "2000",
        amount: 100,
      }).total
    ).toBeCloseTo(7, 2)
  })
})
