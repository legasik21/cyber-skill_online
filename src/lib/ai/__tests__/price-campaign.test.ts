// Deterministic tests for the dedicated `price_campaign` tool.
//
// runTool("price_campaign", ...) is pure: it normalizes a flat { tank, class,
// mission }[] into nested SelectedMissions and prices it via the shared module —
// never via the model. A fully-specified request MUST yield the exact calculator
// total (no clarify-loop / escalation). It always resolves (never throws); a bad
// token comes back as { error }. Expected totals are derived by CALLING
// priceCampaignMissions(), never hardcoded beyond the documented ground truth.

import { describe, it, expect } from "vitest"
import { runTool } from "../tools"
import { priceCampaignMissions } from "@/lib/pricing/campaign-missions"

type CampaignQuote = {
  serviceId: string
  currency: string
  campaignId: string
  interpretation: string
  total: number
  original: number
  discount: number
  honorsNote?: string
  error?: string
}

describe("runTool — price_campaign (STRICT: fully-specified -> exact price, no escalation)", () => {
  it("Object 260 HT-15 / HT-13 / MT-9 => total 34, interpretation present, no throw", async () => {
    const result = (await runTool("price_campaign", {
      missions: [
        { tank: "Object 260", class: "ht", mission: "15" },
        { tank: "Object 260", class: "ht", mission: "13" },
        { tank: "Object 260", class: "mt", mission: "9" },
      ],
    })) as CampaignQuote

    expect(result.error).toBeUndefined()
    expect(result.serviceId).toBe("campaign-missions")
    expect(result.currency).toBe("USD")
    expect(result.campaignId).toBe("1.0")
    expect(result.total).toBe(34)
    expect(result.total).toBe(
      priceCampaignMissions("1.0", { "object-260": { ht: [13, 15], mt: [9] } }).total,
    )
    expect(typeof result.interpretation).toBe("string")
    expect(result.interpretation.length).toBeGreaterThan(0)
  })

  it("2.0 Excalibur Union-1 / Union-2 => total 8", async () => {
    const result = (await runTool("price_campaign", {
      missions: [
        { tank: "Excalibur", class: "union", mission: "1" },
        { tank: "Excalibur", class: "union", mission: "2" },
      ],
    })) as CampaignQuote

    expect(result.error).toBeUndefined()
    expect(result.campaignId).toBe("2.0")
    expect(result.total).toBe(8)
    expect(result.total).toBe(priceCampaignMissions("2.0", { excalibur: { union: [1, 2] } }).total)
  })

  it("3.0 Windhund Vanguard-1 / Vanguard-8 => total 8", async () => {
    const result = (await runTool("price_campaign", {
      missions: [
        { tank: "Windhund", class: "vanguard", mission: "1" },
        { tank: "Windhund", class: "vanguard", mission: "8" },
      ],
    })) as CampaignQuote

    expect(result.error).toBeUndefined()
    expect(result.campaignId).toBe("3.0")
    expect(result.total).toBe(8)
    expect(result.total).toBe(priceCampaignMissions("3.0", { windhund: { vanguard: [1, 8] } }).total)
  })

  it("unknown tank => { error } (no throw), never a quote", async () => {
    const result = (await runTool("price_campaign", {
      missions: [{ tank: "Maus", class: "ht", mission: "1" }],
    })) as CampaignQuote

    expect(result).toHaveProperty("error")
    expect(typeof result.error).toBe("string")
    expect(result.total).toBeUndefined()
  })

  it("honors:2 => base total unchanged + honorsNote present", async () => {
    const base = (await runTool("price_campaign", {
      missions: [
        { tank: "Object 260", class: "ht", mission: "15" },
        { tank: "Object 260", class: "ht", mission: "13" },
        { tank: "Object 260", class: "mt", mission: "9" },
      ],
    })) as CampaignQuote

    const withHonors = (await runTool("price_campaign", {
      missions: [
        { tank: "Object 260", class: "ht", mission: "15" },
        { tank: "Object 260", class: "ht", mission: "13" },
        { tank: "Object 260", class: "mt", mission: "9" },
      ],
      honors: 2,
    })) as CampaignQuote

    expect(withHonors.error).toBeUndefined()
    expect(withHonors.total).toBe(base.total) // base price unchanged by honors
    expect(withHonors.total).toBe(34)
    expect(typeof withHonors.honorsNote).toBe("string")
    expect(withHonors.honorsNote).toMatch(/honors/i)
    expect(base.honorsNote).toBeUndefined()
  })
})
