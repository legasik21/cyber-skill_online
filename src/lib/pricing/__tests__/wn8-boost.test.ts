import { describe, it, expect } from "vitest"
import { priceWn8Boost } from "../wn8-boost"

describe("priceWn8Boost parity", () => {
  it("wn8 2500-3000, 20 battles => 22", () => {
    const { total } = priceWn8Boost({
      serviceType: "wn8",
      tier: "2500-3000",
      numberOfBattles: 20,
    })
    expect(total).toBeCloseTo(22, 2)
  })

  it("wn8 3000-4000, 60 battles, playSPG => 153", () => {
    const { total } = priceWn8Boost({
      serviceType: "wn8",
      tier: "3000-4000",
      numberOfBattles: 60,
      playSPG: true,
    })
    expect(total).toBeCloseTo(153, 2)
  })

  it("damage 5000+, 100 battles, playSPG, getReplays (SPG ignored) => 220", () => {
    const { total } = priceWn8Boost({
      serviceType: "damage",
      tier: "5000+",
      numberOfBattles: 100,
      playSPG: true,
      getReplays: true,
    })
    expect(total).toBeCloseTo(220, 2)
  })

  it("winrate 70%, 50 battles, playSPG (ignored), getReplays => 116.875", () => {
    const { total } = priceWn8Boost({
      serviceType: "winrate",
      tier: "70%",
      numberOfBattles: 50,
      playSPG: true,
      getReplays: true,
    })
    expect(total).toBeCloseTo(116.875, 2)
  })
})
