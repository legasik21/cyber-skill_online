import { describe, it, expect } from "vitest"
import { priceOnslaught } from "../onslaught"

describe("priceOnslaught parity", () => {
  it("0 -> 2000 pts, no extras => 80", () => {
    const { total } = priceOnslaught({
      currentPoints: 0,
      targetPoints: 2000,
    })
    expect(total).toBeCloseTo(80, 2)
  })

  it("0 -> 4500 pts, booster + 20M silver + missions => 723.13", () => {
    const { total } = priceOnslaught({
      currentPoints: 0,
      targetPoints: 4500,
      playWithBooster: true,
      silverOption: "20m",
      completeMissions: true,
    })
    expect(total).toBeCloseTo(723.13, 2)
  })

  it("1000 -> 2000 pts, booster + 10M silver => 115.86", () => {
    const { total } = priceOnslaught({
      currentPoints: 1000,
      targetPoints: 2000,
      playWithBooster: true,
      silverOption: "10m",
    })
    expect(total).toBeCloseTo(115.86, 2)
  })

  it("2000 -> 2100 pts, missions only => 50", () => {
    const { total } = priceOnslaught({
      currentPoints: 2000,
      targetPoints: 2100,
      completeMissions: true,
    })
    expect(total).toBeCloseTo(50, 2)
  })
})
