// LIVE integration test against the real Google Gemini API.
//
// SKIPPED BY DEFAULT. It only runs when BOTH:
//   - GEMINI_API_KEY is available (read from process.env or parsed from ./.env), and
//   - RUN_LIVE_AI === "1"
// so a plain `npm test` never spends money. Run it explicitly with:
//   RUN_LIVE_AI=1 npx vitest run src/lib/ai/__tests__/assistant.live.test.ts
//
// These 3 assertions exercise the full tool loop end-to-end and are kept minimal
// to respect the owner's spend cap.

import { readFileSync } from "node:fs"
import { describe, it, expect } from "vitest"

// If the key isn't already in the environment, parse the minimal set of vars we
// need out of ./.env (simple KEY=VALUE parse). Values are never logged.
if (!process.env.GEMINI_API_KEY) {
  try {
    const raw = readFileSync(new URL("../../../../.env", import.meta.url), "utf8")
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) continue
      const eq = trimmed.indexOf("=")
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()
      // Strip surrounding quotes if present.
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      if (
        key === "GEMINI_API_KEY" ||
        key === "GEMINI_MODEL" ||
        key === "GEMINI_FALLBACK_MODEL"
      ) {
        if (!process.env[key]) process.env[key] = value
      }
    }
  } catch {
    // No .env — RUN stays false and the suite skips.
  }
}

const RUN = !!process.env.GEMINI_API_KEY && process.env.RUN_LIVE_AI === "1"

const TIMEOUT = 30000

// Imported lazily so the import doesn't run when the suite is skipped.
async function loadRunAssistant() {
  const mod = await import("../assistant")
  return mod.runAssistant
}

describe.skipIf(!RUN)("runAssistant — LIVE Gemini", () => {
  it(
    "fully-specified quote → quotes the exact deterministic total ($468)",
    async () => {
      const runAssistant = await loadRunAssistant()
      const result = await runAssistant([
        {
          sender_type: "visitor",
          body:
            "I want 100 million credits, WN8 under 2500, and you can't use my own silver boosters. How much?",
        },
      ])
      console.log("[live] case 1 reply:", JSON.stringify(result.reply))
      expect(typeof result.reply).toBe("string")
      expect(result.reply).toContain("468")
    },
    TIMEOUT,
  )

  it(
    "underspecified credits request → asks for the missing params",
    async () => {
      const runAssistant = await loadRunAssistant()
      const result = await runAssistant([
        { sender_type: "visitor", body: "how much for credits?" },
      ])
      console.log("[live] case 2 reply:", JSON.stringify(result.reply))
      expect(typeof result.reply).toBe("string")
      expect(result.reply).toContain("?")
    },
    TIMEOUT,
  )

  it(
    "refund policy question → answers from the grounded FAQ",
    async () => {
      const runAssistant = await loadRunAssistant()
      const result = await runAssistant([
        { sender_type: "visitor", body: "do you offer refunds?" },
      ])
      console.log("[live] case 3 reply:", JSON.stringify(result.reply))
      expect(typeof result.reply).toBe("string")
      expect(result.reply).toMatch(/refund/i)
    },
    TIMEOUT,
  )
})
