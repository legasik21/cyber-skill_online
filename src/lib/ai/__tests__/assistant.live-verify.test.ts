// LIVE per-service verification (gated by RUN_LIVE_AI=1; skipped by default — no cost).
//
// Drives the real Gemini-backed assistant with one customer-phrased request per service
// and verifies:
//  (a) for credit-farm it asks the CORRECTED WN8 question (driver plays at on YOUR account),
//  (b) it gathers params, calls calculate_price, and
//  (c) the $ figure it quotes EXACTLY equals the deterministic calculatePrice() output.
// Bulk correctness is covered by verification.test.ts (pure functions); this is the small
// live sample. Keep total spend well under the $2 cap.

import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { describe, it, expect, beforeAll } from "vitest"
import { calculatePrice, type ServiceId } from "@/lib/pricing/catalog"
import { runAssistant, type ChatTurn } from "@/lib/ai/assistant"

// Load .env (key/model) into process.env if not already present — values not logged.
if (!process.env.GEMINI_API_KEY && existsSync(".env")) {
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "")
  }
}
const RUN = !!process.env.GEMINI_API_KEY && process.env.RUN_LIVE_AI === "1"

// extract $-prefixed numbers only (so "2500 WN8" / "15 missions" never false-match a price)
const dollars = (t: string): number[] =>
  [...t.matchAll(/\$\s?([\d][\d,]*(?:\.\d{1,2})?)/g)].map((m) => parseFloat(m[1].replace(/,/g, ""))).filter(Number.isFinite)
const quotesExactly = (reply: string, expected: number): boolean =>
  dollars(reply).some((n) => Math.abs(n - expected) < 0.011)

const transcript: string[] = []
function log(s: string) { transcript.push(s) }

// Live model calls can transiently time out (the assistant aborts a single Gemini
// request at 30s). Retry once so an environmental hiccup doesn't fail verification.
async function runWithRetry(history: ChatTurn[]) {
  try { return await runAssistant(history) } catch { return await runAssistant(history) }
}

// One fully-specified request per service + the exact params we expect it to price.
// lenient = clarifying/escalating (no $ quoted) is acceptable; a wrong $ is never acceptable.
type Live = { service: ServiceId; label: string; message: string; params: Record<string, unknown>; lenient?: boolean }
const ALL = Array.from({ length: 15 }, (_, i) => i + 1)
const LIVE: Live[] = [
  { service: "credit-farm", label: "bonds", message: "I'd like 500 bonds, with your driver playing at the 2500-3000 WN8 band on my account.", params: { serviceType: "bonds", tier: "2500-3000", amount: 500 } },
  { service: "referral-program", label: "flat", message: "How much is the referral program service?", params: {} },
  { service: "battle-pass", label: "10->40", message: "Can you boost my Battle Pass from level 10 to level 40?", params: { currentLevel: 10, targetLevel: 40 } },
  { service: "ace-tanker", label: "T8+replay", message: "I want an Ace Tanker mastery badge on a regular Tier VIII tank (NOT artillery/SPG), and please include the replay file.", params: { tankTier: "8", isSpg: false, getReplays: true } },
  { service: "tier-leveling", label: "5->10 noXP", message: "Level my regular tank (NOT an SPG/artillery) from tier 5 to tier 10, do NOT use my own XP boosters, and no silver-farming add-on.", params: { fromTier: 5, toTier: 10, isSPG: false, dontUseBoosters: true, selectedSilverIds: "none" } },
  { service: "wn8-boost", label: "wn8 3-4k x80", message: "I want a WN8 boost into the 3000-4000 band over 80 battles, on regular tanks (no SPG), and no replays.", params: { serviceType: "wn8", tier: "3000-4000", numberOfBattles: 80 } },
  { service: "onslaught", label: "0->2000", message: "How much to take my Onslaught rating from 0 to 2000 points — solo (no platoon booster), no silver, no missions?", params: { currentPoints: 0, targetPoints: 2000 } },
  { service: "mark-of-excellence", label: "85->95 easy", message: "Mark of Excellence from 85% to 95% on a regular (easy) tank, no special vehicle, no silver.", params: { fromProgress: 85, toProgress: 95, difficulty: "easy" } },
  { service: "exp-farm", label: "200k under2500", message: "Farm 200k XP for me, with the driver playing at under 2500 WN8 on my account, using my own XP boosters.", params: { expAmount: 200, wn8Tier: "under-2500" } },
  // Campaign: building the nested mission selection from prose is hard; the bot may escalate rather than guess (safe). Lenient: it must never quote a WRONG number.
  { service: "campaign-missions", label: "1.0 stug-iv LT full", message: "For the Object 260 campaign (1.0), please do all 15 LT missions for the Stug IV.", params: { campaignId: "1.0", selectedMissions: { "stug-iv": { lt: [...ALL] } } }, lenient: true },
]

describe.skipIf(!RUN)("LIVE per-service verification (real Gemini)", () => {
  beforeAll(() => { log(`model: ${process.env.GEMINI_MODEL || "gemini-2.5-flash"}`) })

  it("credit-farm: asks the corrected WN8 question, then quotes the exact function price", { timeout: 90_000 }, async () => {
    // Turn 1: under-specified -> must ask the WN8 question with the corrected (driver/account) framing
    const r1 = (await runWithRetry([{ sender_type: "visitor", body: "I want 50 million credits, how much?" }])).reply
    log(`\n[credit-farm clarify]\nU: I want 50 million credits, how much?\nA: ${r1}`)
    expect(/wn8/i.test(r1), "should ask about WN8").toBe(true)
    expect(/driver/i.test(r1) && /(play|playing)/i.test(r1), "should frame it as the driver playing on the account").toBe(true)
    expect(/your (current )?wn8\b/i.test(r1), "must NOT ask for the customer's own WN8").toBe(false)
    // Turn 2: answer -> must quote the exact deterministic price
    const params = { serviceType: "credits", tier: "over-2500", amount: 50, cannotUseSilverBoosters: true }
    const expected = calculatePrice("credit-farm", params).total // 50*6=300, -15% vol, +30% silver = 331.5
    const history: ChatTurn[] = [
      { sender_type: "visitor", body: "I want 50 million credits, how much?" },
      { sender_type: "agent", body: r1 },
      { sender_type: "visitor", body: "Have the driver play at over 2500 WN8, and you can't use my silver boosters." },
    ]
    const r2 = (await runWithRetry(history)).reply
    log(`U: Have the driver play at over 2500 WN8, and you can't use my silver boosters.\nA: ${r2}\nEXPECTED $${expected}  MATCH=${quotesExactly(r2, expected)}`)
    expect(quotesExactly(r2, expected), `expected $${expected} in: ${r2}`).toBe(true)
  })

  for (const c of LIVE) {
    it(`${c.service} [${c.label}]: quote equals calculatePrice()`, { timeout: 90_000 }, async () => {
      const expected = calculatePrice(c.service, c.params).total
      const res = await runWithRetry([{ sender_type: "visitor", body: c.message }])
      const reply = res.reply
      const ds = dollars(reply)
      const priced = res.toolCalls
        .filter((tc) => tc.name === "calculate_price" && tc.result && typeof tc.result === "object" && "total" in (tc.result as Record<string, unknown>))
        .map((tc) => (tc.result as { total: number }).total)
      const calcInputs = res.toolCalls.filter((tc) => tc.name === "calculate_price").map((tc) => JSON.stringify(tc.input))
      const quotedExpected = ds.some((n) => Math.abs(n - expected) < 0.011)
      // A quoted $ is valid only if it equals the expected price OR a calculate_price RESULT the model received.
      // Anything else would be invented → a price-integrity violation.
      const unexplained = ds.filter((n) => Math.abs(n - expected) >= 0.011 && !priced.some((p) => Math.abs(p - n) < 0.011))
      log(`\n[${c.service}/${c.label}]\nU: ${c.message}\nA: ${reply}\nEXPECTED $${expected}  QUOTED_EXPECTED=${quotedExpected}  calc_results=${JSON.stringify(priced)}  calc_inputs=${JSON.stringify(calcInputs)}  UNEXPLAINED_$=${JSON.stringify(unexplained)}`)
      // PRICE INTEGRITY (all services): never quote a $ the pricing functions didn't produce.
      expect(unexplained, `bot quoted unexplained $ ${JSON.stringify(unexplained)} — not $${expected} nor any calculate_price result`).toHaveLength(0)
      // Fully-specified requests should actually quote the expected price; campaign may safely clarify/escalate.
      if (!c.lenient) expect(quotedExpected, `expected an exact $${expected} quote in reply: ${reply}`).toBe(true)
    })
  }

  it("writes the transcript", () => {
    if (process.env.WRITE_VERIFICATION_REPORT === "1") writeFileSync("/tmp/live-verify-report.txt", transcript.join("\n") + "\n")
  })
})
