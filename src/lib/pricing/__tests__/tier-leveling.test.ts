import { describe, it, expect } from "vitest"
import { priceTierLeveling } from "../tier-leveling"

describe("priceTierLeveling parity", () => {
  it("{fromTier:1,toTier:11} => 180", () => {
    expect(priceTierLeveling({ fromTier: 1, toTier: 11 }).total).toBeCloseTo(180, 2)
  })

  it("{fromTier:5,toTier:8,isSPG:true} => 65", () => {
    expect(priceTierLeveling({ fromTier: 5, toTier: 8, isSPG: true }).total).toBeCloseTo(65, 2)
  })

  it("{fromTier:7,toTier:10,isSPG:true,dontUseBoosters:true,selectedSilverIds:'10m'} => 157", () => {
    expect(
      priceTierLeveling({
        fromTier: 7,
        toTier: 10,
        isSPG: true,
        dontUseBoosters: true,
        selectedSilverIds: "10m",
      }).total
    ).toBeCloseTo(157, 2)
  })

  it("{fromTier:1,toTier:5,dontUseBoosters:true,selectedSilverIds:'20m'} => 105.8", () => {
    expect(
      priceTierLeveling({
        fromTier: 1,
        toTier: 5,
        dontUseBoosters: true,
        selectedSilverIds: "20m",
      }).total
    ).toBeCloseTo(105.8, 2)
  })
})
