import { describe, it, expect } from "vitest"
import { priceBattlePass } from "../battle-pass"

describe("priceBattlePass parity", () => {
  it("currentLevel 1 -> targetLevel 50 = 106.25", () => {
    expect(priceBattlePass({ currentLevel: 1, targetLevel: 50 }).total).toBeCloseTo(106.25, 2)
  })

  it("currentLevel 1 -> targetLevel 25 = 56.25", () => {
    expect(priceBattlePass({ currentLevel: 1, targetLevel: 25 }).total).toBeCloseTo(56.25, 2)
  })

  it("currentLevel 26 -> targetLevel 50 = 56.25", () => {
    expect(priceBattlePass({ currentLevel: 26, targetLevel: 50 }).total).toBeCloseTo(56.25, 2)
  })

  it("currentLevel 30 -> targetLevel 40 = 27.5", () => {
    expect(priceBattlePass({ currentLevel: 30, targetLevel: 40 }).total).toBeCloseTo(27.5, 2)
  })

  it("currentLevel 40 -> targetLevel 30 = 0 (invalid)", () => {
    expect(priceBattlePass({ currentLevel: 40, targetLevel: 30 }).total).toBeCloseTo(0, 2)
  })
})
