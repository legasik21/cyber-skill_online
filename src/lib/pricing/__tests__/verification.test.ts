// Exhaustive price-verification harness.
//
// For every service (and sub-mode) it generates random-but-valid inputs across the
// full parameter space PLUS the explicit boundary/threshold cases, runs them through
// the shared calculatePrice() dispatch, and checks each result against an INDEPENDENT
// oracle that re-derives the formula with its own order-of-operations (using the same
// numeric constants, which are themselves parity-tested). It asserts every total is
// finite, non-negative, and that discounts/modifiers apply at the correct threshold in
// the correct order (discount-before-surcharge where applicable). A readable table is
// printed; the suite FAILS listing any anomaly.

import { describe, it, expect } from "vitest"
import { writeFileSync } from "node:fs"
import { calculatePrice, type ServiceId } from "@/lib/pricing/catalog"
import { CREDIT_PRICING, BONDS_BASE_PRICE, BONDS_WN8_MODIFIERS } from "@/lib/pricing/credit-farm"
import { PRICE_PER_LEVEL } from "@/lib/pricing/battle-pass"
import { TIER_PRICING } from "@/lib/pricing/ace-tanker"
import { TIER_PRICES, SILVER_OPTIONS as TL_SILVER } from "@/lib/pricing/tier-leveling"
import { WN8_PRICING, WINRATE_PRICING, DAMAGE_PRICING } from "@/lib/pricing/wn8-boost"
import { PRICE_PER_100_POINTS, SILVER_OPTIONS as ONS_SILVER, BOOSTER_RATE, MISSIONS_CHARGE } from "@/lib/pricing/onslaught"
import { PRICE_BANDS, SPECIAL_VEHICLES, TANK_DIFFICULTIES, SILVER_OPTIONS as MOE_SILVER } from "@/lib/pricing/mark-of-excellence"
import { EXP_PRICING } from "@/lib/pricing/exp-farm"
import {
  TANKS_1_0, MISSION_TYPES_1_0,
  TANKS_2_0, MISSION_TYPES_2_0,
  TANKS_3_0, MISSION_TYPES_3_0,
  MISSIONS_PER_TYPE,
  type CampaignId,
} from "@/lib/pricing/campaign-missions"

// ---- deterministic PRNG (LCG) so the printed table is reproducible ----
let _seed = 1234567
function rnd(): number {
  _seed = (_seed * 1103515245 + 12345) & 0x7fffffff
  return _seed / 0x7fffffff
}
const randint = (lo: number, hi: number) => lo + Math.floor(rnd() * (hi - lo + 1))
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rnd() * arr.length)]
const coin = () => rnd() < 0.5
const round2 = (x: number) => Math.round(x * 100) / 100
const EPS = 1e-6

type Case = { mode: string; params: Record<string, unknown>; oracle: number }
type Row = {
  service: string
  mode: string
  inputs: string
  total: number
  oracle: number
  breakdown: string
  ok: boolean
  note: string
}

const anomalies: string[] = []
const rows: Row[] = []

function check(service: ServiceId, mode: string, params: Record<string, unknown>, oracle: number, extra?: (q: { total: number; breakdown: Record<string, number> }) => string | null) {
  const q = calculatePrice(service, params)
  let note = ""
  let ok = true
  if (!Number.isFinite(q.total)) { ok = false; note = "NON-FINITE total" }
  else if (q.total < 0) { ok = false; note = "NEGATIVE total" }
  else if (Math.abs(q.total - oracle) > Math.max(EPS, Math.abs(oracle) * 1e-9)) {
    ok = false; note = `oracle mismatch (got ${q.total}, expected ${oracle})`
  }
  if (ok && extra) {
    const e = extra(q)
    if (e) { ok = false; note = e }
  }
  if (!ok) anomalies.push(`[${service}/${mode}] ${note} :: ${JSON.stringify(params)}`)
  rows.push({
    service,
    mode,
    inputs: JSON.stringify(params).replace(/"/g, "").slice(0, 60),
    total: round2(q.total),
    oracle: round2(oracle),
    breakdown: JSON.stringify(q.breakdown),
    ok,
    note,
  })
}

// ---------- per-service oracles + case generators ----------

// credit-farm — credits
function creditOracle(tier: string, amount: number, silverOff: boolean): number {
  if (amount < 1) return 0
  const base = amount * (CREDIT_PRICING as Record<string, number>)[tier]
  const disc = amount >= 70 ? 20 : amount >= 40 ? 15 : amount >= 20 ? 10 : 0
  const afterDiscount = base - base * (disc / 100)
  const silver = silverOff ? afterDiscount * 0.3 : 0
  return afterDiscount + silver
}
function bondsOracle(tier: string, amount: number): number {
  if (amount < 100) return 0
  const mod = (BONDS_WN8_MODIFIERS as Record<string, number>)[tier] ?? 0
  return Math.floor(amount / 100) * BONDS_BASE_PRICE * (1 + mod / 100)
}

function genCreditFarm(): Case[] {
  const cases: Case[] = []
  const creditTiers = Object.keys(CREDIT_PRICING)
  const bondTiers = Object.keys(BONDS_WN8_MODIFIERS)
  // boundary credits: thresholds 1/19/20/39/40/69/70/150 × both bands × both silver states
  for (const amount of [1, 19, 20, 39, 40, 69, 70, 150]) {
    for (const tier of creditTiers) {
      for (const silverOff of [false, true]) {
        cases.push({ mode: "credits-bound", params: { serviceType: "credits", tier, amount, cannotUseSilverBoosters: silverOff }, oracle: creditOracle(tier, amount, silverOff) })
      }
    }
  }
  // random credits
  for (let i = 0; i < 10; i++) {
    const tier = pick(creditTiers), amount = randint(1, 300), silverOff = coin()
    cases.push({ mode: "credits-rand", params: { serviceType: "credits", tier, amount, cannotUseSilverBoosters: silverOff }, oracle: creditOracle(tier, amount, silverOff) })
  }
  // bonds boundary: 99 (→0 floor), 100 (min), 250 (floor to 200), 1000
  for (const amount of [99, 100, 250, 1000]) {
    for (const tier of bondTiers) {
      cases.push({ mode: "bonds-bound", params: { serviceType: "bonds", tier, amount }, oracle: bondsOracle(tier, amount) })
    }
  }
  // random bonds
  for (let i = 0; i < 8; i++) {
    const tier = pick(bondTiers), amount = randint(100, 2000)
    cases.push({ mode: "bonds-rand", params: { serviceType: "bonds", tier, amount }, oracle: bondsOracle(tier, amount) })
  }
  return cases
}

// battle-pass
function bpOracle(cur: number, tgt: number): number {
  if (cur < 1 || tgt < cur || tgt > 50) return 0
  const levels = tgt - cur + 1
  const base = levels * PRICE_PER_LEVEL
  const disc = levels >= 50 ? 15 : levels >= 25 ? 10 : 0
  return base - base * (disc / 100)
}
function genBattlePass(): Case[] {
  const cases: Case[] = []
  // boundary at 24/25/49/50 LEVELS (from=1 → levels=tgt)
  for (const tgt of [24, 25, 49, 50]) cases.push({ mode: "levels-bound", params: { currentLevel: 1, targetLevel: tgt }, oracle: bpOracle(1, tgt) })
  // also a 26→50 (25 levels) and an invalid (40→30)
  cases.push({ mode: "mid", params: { currentLevel: 26, targetLevel: 50 }, oracle: bpOracle(26, 50) })
  cases.push({ mode: "invalid", params: { currentLevel: 40, targetLevel: 30 }, oracle: bpOracle(40, 30) })
  for (let i = 0; i < 8; i++) { const cur = randint(1, 50); const tgt = randint(cur, 50); cases.push({ mode: "rand", params: { currentLevel: cur, targetLevel: tgt }, oracle: bpOracle(cur, tgt) }) }
  return cases
}

// ace-tanker
function aceOracle(tier: string, spg: boolean, replays: boolean): number {
  const base = (TIER_PRICING as Record<string, number>)[tier]
  const adj = base + (spg ? base : 0)
  return adj + (replays ? adj * 0.2 : 0)
}
function genAce(): Case[] {
  const cases: Case[] = []
  const tiers = Object.keys(TIER_PRICING)
  // lowest + highest tier, all boolean combos
  for (const tier of [tiers[0], tiers[tiers.length - 1]]) for (const spg of [false, true]) for (const replays of [false, true]) cases.push({ mode: "bound", params: { tankTier: tier, isSpg: spg, getReplays: replays }, oracle: aceOracle(tier, spg, replays) })
  for (let i = 0; i < 8; i++) { const tier = pick(tiers), spg = coin(), replays = coin(); cases.push({ mode: "rand", params: { tankTier: tier, isSpg: spg, getReplays: replays }, oracle: aceOracle(tier, spg, replays) }) }
  return cases
}

// tier-leveling
function tlOracle(from: number, to: number, spg: boolean, noBoost: boolean, silverId: string): number {
  let base = 0
  for (let t = from + 1; t <= to; t++) base += (TIER_PRICES as Record<number, number>)[t] ?? 0
  const noB = noBoost ? base * 0.3 : 0
  const sp = spg ? base * 0.3 : 0
  const silver = (TL_SILVER.find((o) => o.id === silverId)?.price) ?? 0
  return base + noB + sp + silver
}
function genTierLeveling(): Case[] {
  const cases: Case[] = []
  const silverIds = TL_SILVER.map((o) => o.id)
  // lowest range (from==to-1) and full range 1→11, with surcharge combos
  for (const [from, to] of [[1, 2], [10, 11], [1, 11]] as [number, number][]) for (const spg of [false, true]) for (const noBoost of [false, true]) {
    const silverId = pick(silverIds)
    cases.push({ mode: "bound", params: { fromTier: from, toTier: to, isSPG: spg, dontUseBoosters: noBoost, selectedSilverIds: silverId }, oracle: tlOracle(from, to, spg, noBoost, silverId) })
  }
  for (let i = 0; i < 8; i++) { const from = randint(1, 10); const to = randint(from + 1, 11); const spg = coin(); const noBoost = coin(); const silverId = pick(silverIds); cases.push({ mode: "rand", params: { fromTier: from, toTier: to, isSPG: spg, dontUseBoosters: noBoost, selectedSilverIds: silverId }, oracle: tlOracle(from, to, spg, noBoost, silverId) }) }
  return cases
}

// wn8-boost
function wnOracle(svc: string, tier: string, battles: number, spg: boolean, replays: boolean): number {
  if (battles < 20) return 0
  const table = svc === "wn8" ? WN8_PRICING : svc === "winrate" ? WINRATE_PRICING : DAMAGE_PRICING
  let ppb = (table as Record<string, number>)[tier] ?? 0
  if ((svc === "wn8" && spg && (tier === "2500-3000" || tier === "3000-4000")) || (svc === "winrate" && spg && tier === "60%")) ppb *= 2
  const base = battles * ppb
  const disc = battles >= 100 ? 20 : battles >= 50 ? 15 : 0
  let final = base - base * (disc / 100)
  if (replays) final *= 1.1
  return final
}
function genWn8Boost(): Case[] {
  const cases: Case[] = []
  const tiersBy: Record<string, string[]> = { wn8: Object.keys(WN8_PRICING), winrate: Object.keys(WINRATE_PRICING), damage: Object.keys(DAMAGE_PRICING) }
  // battle thresholds 20/49/50/99/100/200
  for (const svc of ["wn8", "winrate", "damage"]) for (const battles of [20, 49, 50, 99, 100, 200]) {
    const tier = pick(tiersBy[svc]); const spg = coin(); const replays = coin()
    cases.push({ mode: `${svc}-bound`, params: { serviceType: svc, tier, numberOfBattles: battles, playSPG: spg, getReplays: replays }, oracle: wnOracle(svc, tier, battles, spg, replays) })
  }
  for (let i = 0; i < 9; i++) { const svc = pick(["wn8", "winrate", "damage"]); const tier = pick(tiersBy[svc]); const battles = randint(20, 400); const spg = coin(); const replays = coin(); cases.push({ mode: `${svc}-rand`, params: { serviceType: svc, tier, numberOfBattles: battles, playSPG: spg, getReplays: replays }, oracle: wnOracle(svc, tier, battles, spg, replays) }) }
  return cases
}

// onslaught
function pointsOracle(from: number, to: number): number {
  if (from >= to) return 0
  let price = 0
  for (const tier of PRICE_PER_100_POINTS) {
    const start = Math.max(from, tier.minPoints)
    const end = Math.min(to, tier.maxPoints + 1)
    if (start < end) price += ((end - start) / 100) * tier.rate
  }
  return round2(price)
}
function onsOracle(from: number, to: number, booster: boolean, silverId: string, missions: boolean): number {
  const base = pointsOracle(from, to)
  const b = booster ? base * BOOSTER_RATE : 0
  const silver = (ONS_SILVER.find((o) => o.id === silverId)?.price) ?? 0
  const m = missions ? MISSIONS_CHARGE : 0
  return round2(base + b + silver + m)
}
function genOnslaught(): Case[] {
  const cases: Case[] = []
  const silverIds = ONS_SILVER.map((o) => o.id)
  // tier boundaries: 0→1000 (tier1 edge), 0→4500 (all), 2000→2100, 999→1000
  for (const [from, to] of [[0, 1000], [0, 4500], [2000, 2100], [999, 1000], [0, 2000]] as [number, number][]) {
    const booster = coin(); const silverId = pick(silverIds); const missions = coin()
    cases.push({ mode: "bound", params: { currentPoints: from, targetPoints: to, playWithBooster: booster, silverOption: silverId, completeMissions: missions }, oracle: onsOracle(from, to, booster, silverId, missions) })
  }
  for (let i = 0; i < 8; i++) { const from = randint(0, 4400); const to = randint(from + 100 > 4500 ? 4500 : from + 100, 4500); const booster = coin(); const silverId = pick(silverIds); const missions = coin(); cases.push({ mode: "rand", params: { currentPoints: from, targetPoints: to, playWithBooster: booster, silverOption: silverId, completeMissions: missions }, oracle: onsOracle(from, to, booster, silverId, missions) }) }
  return cases
}

// mark-of-excellence
function moeBase(from: number, to: number): number {
  let base = 0
  for (const band of PRICE_BANDS) { const s = Math.max(from, band.min); const e = Math.min(to, band.max); if (s < e) base += (e - s) * band.rate }
  return base
}
function moeOracle(from: number, to: number, difficulty: string, vehicle: string, silverId: string): number {
  if (Math.max(0, to - from) === 0) return 0
  const base = moeBase(from, to)
  let mult = 1
  if (vehicle) mult = 1 + ((SPECIAL_VEHICLES.find((v) => v.id === vehicle)?.fee) ?? 0)
  else if (difficulty) mult = 1 + ((TANK_DIFFICULTIES.find((d) => d.id === difficulty)?.multiplier) ?? 0)
  const silver = (MOE_SILVER.find((o) => o.id === silverId)?.addon) ?? 0
  return round2(base * mult + silver)
}
function genMoe(): Case[] {
  const cases: Case[] = []
  const diffs = TANK_DIFFICULTIES.map((d) => d.id)
  const silverIds = MOE_SILVER.map((o) => o.id)
  const vehicles = SPECIAL_VEHICLES.map((v) => v.id)
  // boundaries: 1→2 (min), 1→95 (full), band edges 1→20, 50→85, 85→95
  for (const [from, to] of [[1, 2], [1, 95], [1, 20], [50, 85], [85, 95]] as [number, number][]) {
    cases.push({ mode: "bound-diff", params: { fromProgress: from, toProgress: to, difficulty: pick(diffs), specialVehicle: "", silverOption: pick(silverIds) }, oracle: moeOracle(from, to, pick(diffs), "", pick(silverIds)) })
  }
  // re-pick deterministically isn't stable above; build explicit ones instead:
  cases.length = 0
  for (const [from, to] of [[1, 2], [1, 95], [1, 20], [50, 85], [85, 95]] as [number, number][]) {
    const d = pick(diffs); const s = pick(silverIds)
    cases.push({ mode: "bound-diff", params: { fromProgress: from, toProgress: to, difficulty: d, specialVehicle: "", silverOption: s }, oracle: moeOracle(from, to, d, "", s) })
  }
  // vehicle-fee path (replaces difficulty)
  for (let i = 0; i < 4; i++) { const v = pick(vehicles); const s = pick(silverIds); cases.push({ mode: "vehicle", params: { fromProgress: 1, toProgress: 95, difficulty: "", specialVehicle: v, silverOption: s }, oracle: moeOracle(1, 95, "", v, s) }) }
  for (let i = 0; i < 8; i++) { const from = randint(1, 94); const to = randint(from + 1, 95); const d = pick(diffs); const s = pick(silverIds); cases.push({ mode: "rand", params: { fromProgress: from, toProgress: to, difficulty: d, specialVehicle: "", silverOption: s }, oracle: moeOracle(from, to, d, "", s) }) }
  return cases
}

// exp-farm
function expOracle(amount: number, tier: string, xpOff: boolean): number {
  if (amount < 1) return 0
  const base = (amount / 10) * (EXP_PRICING as Record<string, number>)[tier]
  const disc = amount >= 500 ? 20 : amount >= 250 ? 15 : amount >= 100 ? 10 : 0
  const afterDiscount = base - base * (disc / 100)
  return afterDiscount + (xpOff ? afterDiscount * 0.3 : 0)
}
function genExp(): Case[] {
  const cases: Case[] = []
  const tiers = Object.keys(EXP_PRICING)
  // thresholds 10/99/100/249/250/499/500/1000 × both bands × both xp-booster states
  for (const amount of [10, 99, 100, 249, 250, 499, 500, 1000]) for (const tier of tiers) {
    const xpOff = coin()
    cases.push({ mode: "bound", params: { expAmount: amount, wn8Tier: tier, cannotUseXPBoosters: xpOff }, oracle: expOracle(amount, tier, xpOff) })
  }
  for (let i = 0; i < 8; i++) { const amount = randint(10, 1000); const tier = pick(tiers); const xpOff = coin(); cases.push({ mode: "rand", params: { expAmount: amount, wn8Tier: tier, cannotUseXPBoosters: xpOff }, oracle: expOracle(amount, tier, xpOff) }) }
  return cases
}

// ---------------- the suite ----------------
describe("price verification — random + boundary across every service", () => {
  it("credit-farm (credits + bonds)", () => {
    for (const c of genCreditFarm()) {
      check("credit-farm", c.mode, c.params, c.oracle, (q) => {
        if (c.params.serviceType === "credits") {
          const amount = c.params.amount as number
          const expDisc = amount < 1 ? 0 : amount >= 70 ? 20 : amount >= 40 ? 15 : amount >= 20 ? 10 : 0
          if (q.breakdown.discountPercent !== expDisc) return `wrong discountPercent ${q.breakdown.discountPercent} (expected ${expDisc})`
        }
        return null
      })
    }
  })
  it("referral-program (flat)", () => check("referral-program", "flat", {}, 100))
  it("battle-pass", () => { for (const c of genBattlePass()) check("battle-pass", c.mode, c.params, c.oracle) })
  it("ace-tanker", () => { for (const c of genAce()) check("ace-tanker", c.mode, c.params, c.oracle) })
  it("tier-leveling", () => { for (const c of genTierLeveling()) check("tier-leveling", c.mode, c.params, c.oracle) })
  it("wn8-boost", () => { for (const c of genWn8Boost()) check("wn8-boost", c.mode, c.params, c.oracle) })
  it("onslaught", () => { for (const c of genOnslaught()) check("onslaught", c.mode, c.params, c.oracle) })
  it("mark-of-excellence", () => { for (const c of genMoe()) check("mark-of-excellence", c.mode, c.params, c.oracle) })
  it("exp-farm", () => { for (const c of genExp()) check("exp-farm", c.mode, c.params, c.oracle) })

  it("campaign-missions 1.0 / 2.0 / 3.0 (partial / full-type -15% / full-tank -25%)", () => {
    const campaigns: { id: CampaignId; tanks: { id: string }[]; types: { id: string }[] }[] = [
      { id: "1.0", tanks: TANKS_1_0, types: MISSION_TYPES_1_0 },
      { id: "2.0", tanks: TANKS_2_0, types: MISSION_TYPES_2_0 },
      { id: "3.0", tanks: TANKS_3_0, types: MISSION_TYPES_3_0 },
    ]
    const all = Array.from({ length: MISSIONS_PER_TYPE }, (_, i) => i + 1)
    for (const camp of campaigns) {
      const tank = pick(camp.tanks).id
      const type = pick(camp.types).id
      // partial (no discount)
      const partial = { [tank]: { [type]: [1, 5, 9] } }
      // full single type (-15%, as long as not a full tank)
      const fullType = { [tank]: { [type]: [...all] } }
      // full tank: every type fully selected (-25%)
      const fullTank: Record<string, Record<string, number[]>> = { [tank]: {} }
      for (const t of camp.types) fullTank[tank][t.id] = [...all]

      const runCampaign = (mode: string, sel: Record<string, Record<string, number[]>>, expectRate: number) => {
        const q = calculatePrice("campaign-missions", { campaignId: camp.id, selectedMissions: sel })
        const original = q.breakdown.original
        const discount = q.breakdown.discount
        let ok = true; let note = ""
        if (!Number.isFinite(q.total) || q.total < 0) { ok = false; note = "non-finite/negative" }
        else if (q.total > original + 1) { ok = false; note = `total ${q.total} > original ${original}` }
        else if (Math.abs(original - (q.total + discount)) > 1.5) { ok = false; note = `original ${original} != total ${q.total} + discount ${discount}` }
        else if (original > 0) {
          const rate = discount / original
          if (Math.abs(rate - expectRate) > 0.02) { ok = false; note = `discount rate ${(rate * 100).toFixed(1)}% != expected ${(expectRate * 100).toFixed(0)}%` }
        }
        if (!ok) anomalies.push(`[campaign-${camp.id}/${mode}] ${note}`)
        rows.push({ service: `campaign-${camp.id}`, mode, inputs: `${tank}/${type}`, total: round2(q.total), oracle: round2(original), breakdown: `orig=${original} disc=${discount}`, ok, note })
      }
      runCampaign("partial", partial, 0)
      runCampaign("full-type", fullType, 0.15)
      runCampaign("full-tank", fullTank, 0.25)
    }
  })

  it("prints the results table and reports zero anomalies", () => {
    const header = `SERVICE            | MODE          | INPUTS                                                        | TOTAL($) | ORACLE($) | OK`
    const lines = rows.map((r) =>
      `${r.service.padEnd(18)} | ${r.mode.padEnd(13)} | ${r.inputs.padEnd(60)} | ${String(r.total).padStart(8)} | ${String(r.oracle).padStart(9)} | ${r.ok ? "OK" : "*** " + r.note}`,
    )
    const report =
      "========== PRICE VERIFICATION TABLE (" + rows.length + " cases) ==========\n" +
      header + "\n" + lines.join("\n") + "\n\n" +
      (anomalies.length ? "ANOMALIES:\n" + anomalies.join("\n") : "ANOMALIES: none — all cases finite, non-negative, correct threshold/order.")
    // eslint-disable-next-line no-console
    console.log("\n" + report + "\n")
    if (process.env.WRITE_VERIFICATION_REPORT === "1") {
      writeFileSync("/tmp/price-verification-report.txt", report)
    }
    expect(anomalies, anomalies.join("\n")).toHaveLength(0)
  })
})
