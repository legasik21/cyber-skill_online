import { describe, it, expect } from "vitest"
import { priceAceTanker } from "../ace-tanker"

describe("priceAceTanker parity", () => {
  it("tier 9_10 base only => 23", () => {
    expect(priceAceTanker({ tankTier: "9_10" }).total).toBeCloseTo(23, 2)
  })

  it("tier 8 with SPG => 40", () => {
    expect(priceAceTanker({ tankTier: "8", isSpg: true }).total).toBeCloseTo(40, 2)
  })

  it("tier lower with replays => 18", () => {
    expect(priceAceTanker({ tankTier: "lower", getReplays: true }).total).toBeCloseTo(18, 2)
  })

  it("tier 11 with SPG + replays => 64.8", () => {
    expect(
      priceAceTanker({ tankTier: "11", isSpg: true, getReplays: true }).total
    ).toBeCloseTo(64.8, 2)
  })
})
