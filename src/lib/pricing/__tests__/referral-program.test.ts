import { describe, it, expect } from "vitest"
import { priceReferralProgram, REFERRAL_PRICE } from "../referral-program"

describe("priceReferralProgram", () => {
  it("returns the flat referral price", () => {
    expect(priceReferralProgram().total).toBeCloseTo(100, 2)
  })

  it("exports REFERRAL_PRICE constant of 100", () => {
    expect(REFERRAL_PRICE).toBe(100)
  })
})
