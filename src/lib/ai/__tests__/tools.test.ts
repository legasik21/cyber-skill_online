// Deterministic tool-layer tests. runTool is pure (no Anthropic client / API key
// required): it only dispatches into the catalog/FAQ source-of-truth and always
// resolves (never throws) — bad inputs come back as { error }.

import { describe, it, expect } from "vitest"
import { runTool } from "../tools"

describe("runTool — calculate_price", () => {
  it("credit-farm (100M credits, under-2500, no silver boosters) => total 468, USD", async () => {
    const result = (await runTool("calculate_price", {
      serviceId: "credit-farm",
      params: {
        serviceType: "credits",
        tier: "under-2500",
        amount: 100,
        cannotUseSilverBoosters: true,
      },
    })) as { total: number; currency: string }

    expect(result.total).toBe(468)
    expect(result.currency).toBe("USD")
  })

  it("battle-pass (1 -> 50) => total ~106.25", async () => {
    const result = (await runTool("calculate_price", {
      serviceId: "battle-pass",
      params: { currentLevel: 1, targetLevel: 50 },
    })) as { total: number }

    expect(result.total).toBeCloseTo(106.25, 2)
  })

  it("arcade-cabinet => sanitized { error } (no throw)", async () => {
    const result = (await runTool("calculate_price", {
      serviceId: "arcade-cabinet",
      params: {},
    })) as { error?: string }

    expect(result).toHaveProperty("error")
    expect(typeof result.error).toBe("string")
  })
})

describe("runTool — get_service_pricing", () => {
  it("wn8-boost => descriptor with a params array", async () => {
    const result = (await runTool("get_service_pricing", {
      serviceId: "wn8-boost",
    })) as { id: string; params: unknown[] }

    expect(result.id).toBe("wn8-boost")
    expect(Array.isArray(result.params)).toBe(true)
  })

  it("unknown service => { error }", async () => {
    const result = (await runTool("get_service_pricing", {
      serviceId: "not-a-service",
    })) as { error?: string }

    expect(result).toHaveProperty("error")
  })
})

describe("runTool — answer_faq", () => {
  it("returns up to 3 entries, each with question/answer/topic", async () => {
    const result = (await runTool("answer_faq", {
      query: "do you offer refunds",
    })) as Array<{ question: string; answer: string; topic: string }>

    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
    expect(result.length).toBeLessThanOrEqual(3)
    for (const entry of result) {
      expect(typeof entry.question).toBe("string")
      expect(typeof entry.answer).toBe("string")
      expect(typeof entry.topic).toBe("string")
    }
  })
})

describe("runTool — escalate_to_human", () => {
  it("returns { escalated: true, reason }", async () => {
    const result = (await runTool("escalate_to_human", {
      reason: "custom quote",
    })) as { escalated: boolean; reason: string }

    expect(result.escalated).toBe(true)
    expect(result.reason).toBe("custom quote")
  })
})
