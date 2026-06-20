// Resolver + normalizer tests for the parse-friendly campaign-missions input.
//
// campaign-input.ts maps free-text tank names -> { campaignId, tankId }, resolves
// class/branch shorthands to mission-type ids, and folds a FLAT list of
// { tank, class, mission } items into the nested SelectedMissions shape that
// priceCampaignMissions() prices. Prices are NEVER hardcoded here: any expected
// total is derived by CALLING priceCampaignMissions().

import { describe, it, expect } from "vitest"
import {
  resolveCampaignTank,
  resolveMissionType,
  normalizeCampaignMissions,
} from "../campaign-input"
import { priceCampaignMissions } from "../campaign-missions"

const ALL = Array.from({ length: 15 }, (_, k) => k + 1)

describe("resolveCampaignTank — free-text tank -> { campaignId, tankId }", () => {
  const cases: Array<[string, string, string]> = [
    // [input, campaignId, tankId]
    ["Object 260", "1.0", "object-260"],
    ["object-260", "1.0", "object-260"],
    ["obj 260", "1.0", "object-260"],
    ["object260", "1.0", "object-260"],
    ["T-55A", "1.0", "t55a"],
    ["T 55A", "1.0", "t55a"],
    ["t55a", "1.0", "t55a"],
    ["Excalibur", "2.0", "excalibur"],
    ["Object 279 (e)", "2.0", "object-279e"],
    ["object-279e", "2.0", "object-279e"],
    ["Black Rock", "3.0", "black-rock"],
    ["black-rock", "3.0", "black-rock"],
  ]
  for (const [input, campaignId, tankId] of cases) {
    it(`"${input}" -> ${campaignId}/${tankId}`, () => {
      const res = resolveCampaignTank(input)
      expect(res).not.toBeNull()
      expect(res?.campaignId).toBe(campaignId)
      expect(res?.tankId).toBe(tankId)
    })
  }

  it("unknown tank -> null", () => {
    expect(resolveCampaignTank("Maus")).toBeNull()
    expect(resolveCampaignTank("")).toBeNull()
    expect(resolveCampaignTank("not a tank")).toBeNull()
  })
})

describe("resolveMissionType — class/branch shorthand -> mission-type id", () => {
  it("1.0 HT aliases -> ht", () => {
    expect(resolveMissionType("1.0", "HT")).toBe("ht")
    expect(resolveMissionType("1.0", "heavy")).toBe("ht")
    expect(resolveMissionType("1.0", "Heavy Tank")).toBe("ht")
    expect(resolveMissionType("1.0", "ht")).toBe("ht")
  })

  it("1.0 arty aliases -> spg", () => {
    expect(resolveMissionType("1.0", "arty")).toBe("spg")
    expect(resolveMissionType("1.0", "artillery")).toBe("spg")
    expect(resolveMissionType("1.0", "spg")).toBe("spg")
  })

  it("2.0 union -> union", () => {
    expect(resolveMissionType("2.0", "union")).toBe("union")
  })

  it("2.0 ht -> null (2.0 has no HT branch)", () => {
    expect(resolveMissionType("2.0", "ht")).toBeNull()
  })

  it("3.0 vanguard -> vanguard", () => {
    expect(resolveMissionType("3.0", "vanguard")).toBe("vanguard")
  })
})

describe("normalizeCampaignMissions — flat items -> nested SelectedMissions", () => {
  it("Object 260 HT-15 / HT-13 / MT-9 -> sorted nested shape, prices to 34", () => {
    const parsed = normalizeCampaignMissions([
      { tank: "Object 260", class: "HT", mission: 15 },
      { tank: "Object 260", class: "ht", mission: 13 },
      { tank: "obj 260", class: "mt", mission: 9 },
    ])
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.campaignId).toBe("1.0")
    // arrays sorted ascending
    expect(parsed.selectedMissions).toEqual({ "object-260": { ht: [13, 15], mt: [9] } })
    expect(priceCampaignMissions(parsed.campaignId, parsed.selectedMissions).total).toBe(34)
  })

  it('mission "all" expands one branch to 15 entries and triggers a -15% discount', () => {
    const parsed = normalizeCampaignMissions([{ tank: "Object 260", class: "lt", mission: "all" }])
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.selectedMissions["object-260"].lt).toEqual(ALL)
    expect(parsed.selectedMissions["object-260"].lt).toHaveLength(15)

    const flat = priceCampaignMissions(parsed.campaignId, parsed.selectedMissions)
    const nested = priceCampaignMissions("1.0", { "object-260": { lt: [...ALL] } })
    expect(flat).toEqual(nested)
    expect(flat.discount).toBeGreaterThan(0) // full-type -15%
  })

  it('"Select All" — every branch of one tank as "all" -> -25% full-tank discount', () => {
    const parsed = normalizeCampaignMissions([
      { tank: "Object 260", class: "lt", mission: "all" },
      { tank: "Object 260", class: "mt", mission: "all" },
      { tank: "Object 260", class: "ht", mission: "all" },
      { tank: "Object 260", class: "td", mission: "all" },
      { tank: "Object 260", class: "spg", mission: "all" },
    ])
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return

    const flat = priceCampaignMissions(parsed.campaignId, parsed.selectedMissions)
    const nested = priceCampaignMissions("1.0", {
      "object-260": { lt: [...ALL], mt: [...ALL], ht: [...ALL], td: [...ALL], spg: [...ALL] },
    })
    expect(flat).toEqual(nested)
    expect(flat.discount).toBeGreaterThan(0) // full-tank -25%
    // full-tank rate (25%) should exceed a single full-type rate (15%)
    expect(flat.discount / flat.original).toBeGreaterThan(0.2)
  })
})

describe("normalizeCampaignMissions — errors return { ok:false } and never throw", () => {
  it("unknown tank", () => {
    const r = normalizeCampaignMissions([{ tank: "Maus", class: "ht", mission: 1 }])
    expect(r.ok).toBe(false)
    if (!r.ok) expect(typeof r.error).toBe("string")
  })

  it("class invalid for the inferred campaign (HT on a 2.0 tank)", () => {
    const r = normalizeCampaignMissions([{ tank: "Excalibur", class: "ht", mission: 1 }])
    expect(r.ok).toBe(false)
  })

  it("mission number out of range (0 and 16)", () => {
    expect(normalizeCampaignMissions([{ tank: "Object 260", class: "ht", mission: 0 }]).ok).toBe(false)
    expect(normalizeCampaignMissions([{ tank: "Object 260", class: "ht", mission: 16 }]).ok).toBe(false)
  })

  it("mixed campaigns in one request (Object 260 + Excalibur)", () => {
    const r = normalizeCampaignMissions([
      { tank: "Object 260", class: "ht", mission: 1 },
      { tank: "Excalibur", class: "union", mission: 1 },
    ])
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.toLowerCase()).toContain("campaign")
  })

  it("empty / non-array input", () => {
    expect(normalizeCampaignMissions([]).ok).toBe(false)
    expect(normalizeCampaignMissions(null).ok).toBe(false)
    expect(normalizeCampaignMissions(undefined).ok).toBe(false)
  })
})
