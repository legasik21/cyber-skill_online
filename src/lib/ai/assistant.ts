// The agentic loop. Lazily constructs the Google Gemini client (reads GEMINI_API_KEY
// from env at call time — NOT at import time, so the build never requires the key).

import {
  GoogleGenAI,
  FunctionCallingConfigMode,
  type Content,
  type GenerateContentResponse,
  type Part,
} from "@google/genai"
import { AI_MODEL, AI_FALLBACK_MODEL } from "@/lib/ai/config"
import { buildSystemPrompt } from "@/lib/ai/prompt"
import { GEMINI_FUNCTION_DECLARATIONS, runTool, type ToolContext } from "@/lib/ai/tools"
import { sendEscalationNotification } from "@/lib/telegram"

export type ChatTurn = { sender_type: "visitor" | "agent"; body: string }
/** Record of each tool the model invoked this turn — for observability + price-integrity checks. */
export type ToolCallRecord = { name: string; input: Record<string, unknown>; result: unknown }
export type AssistantResult = { reply: string; escalated: boolean; toolCalls: ToolCallRecord[] }

const MAX_ITERATIONS = 8
const MAX_TURNS = 30
const REQUEST_TIMEOUT_MS = 30000
const FALLBACK_REPLY = "Let me connect you with a team member."

/**
 * Returns true if a thrown SDK error looks like a model-not-found / unsupported
 * model / availability error (404 / NOT_FOUND), as opposed to an ordinary refusal,
 * quota, or auth error. Only these trigger the fallback model.
 */
function isModelUnavailableError(err: unknown): boolean {
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase()
  const status = (err as { status?: number; code?: number } | null)?.status
  const code = (err as { status?: number; code?: number } | null)?.code
  if (status === 404 || code === 404) return true
  return (
    msg.includes("not found") ||
    msg.includes("not_found") ||
    msg.includes("is not supported") ||
    msg.includes("not supported for") ||
    msg.includes("unsupported model") ||
    msg.includes("does not exist") ||
    msg.includes("unknown model")
  )
}

/**
 * Deterministic safety net: if the model already computed a valid price via a tool
 * but failed to produce a final text answer (looped out, or returned empty after a
 * tool call), synthesize the quote from the tool result instead of escalating.
 * The number still comes ONLY from the tool (i.e. the shared pricing module) — the
 * model never computes it.
 */
function quoteFromToolCalls(toolCalls: ToolCallRecord[]): string | null {
  for (let i = toolCalls.length - 1; i >= 0; i--) {
    const call = toolCalls[i]
    const r = call?.result as Record<string, unknown> | null
    if (!r || typeof r !== "object" || "error" in r) continue
    const total = (r as { total?: unknown }).total
    if (typeof total !== "number") continue
    if (call.name === "price_campaign") {
      const interp = typeof r.interpretation === "string" ? r.interpretation : ""
      const route = typeof r.route === "string" ? r.route : "/services/campaign-missions"
      const honors = typeof r.honorsNote === "string" ? ` ${r.honorsNote}` : ""
      return `${interp ? `${interp} → ` : ""}That's $${total} — want me to set you up? Order here: ${route}.${honors}`
    }
    if (call.name === "calculate_price") {
      return `That's $${total} — want me to set you up?`
    }
  }
  return null
}

/**
 * The model sometimes writes a human-handoff line in plain prose ("I've escalated…",
 * "a team member will reach out", "let me connect you with…") WITHOUT calling
 * escalate_to_human/submit_order. Left unhandled that is a silent dead-end — the visitor
 * is told a human is coming but nobody is alerted. We detect the phrasing and, if no tool
 * actually escalated/ordered this turn, alert a human anyway.
 */
const HANDOFF_RE =
  /(connect|put|get|bring)\s+you\s+(?:in touch\s+)?(?:with|to|through to)\s+(?:a\s+)?(?:team member|human|manager|representative|agent|someone)|i(?:'ve| have)?\s+escalat|i(?:'ve| have)?\s+(?:forwarded|passed|handed|flagged)\b|(?:a|our)\s+(?:human|team member|manager|representative|agent|team)\s+will\s+(?:contact|reach out|be in touch|get back|follow up|assist)|escalat(?:ed|ing)\s+(?:your|this|the)\s+(?:request|conversation|chat)/i

function looksLikeHandoff(text: string): boolean {
  return HANDOFF_RE.test(text)
}

/** True if a submit_order succeeded this turn (so a "manager will reach out" line is legit). */
function orderPlacedThisTurn(calls: ToolCallRecord[]): boolean {
  return calls.some(
    (c) =>
      c.name === "submit_order" &&
      !!c.result &&
      typeof c.result === "object" &&
      (c.result as { ok?: unknown }).ok === true,
  )
}

const DISCORD_RE = /\b([a-z0-9._]{2,32}#\d{3,5})\b/i
const TELEGRAM_RE = /(?:^|\s)(@[a-z0-9_]{4,32})\b/i
/** Best-effort: pull a contact handle the visitor typed, to attach to a prose-handoff alert. */
function extractContact(history: ChatTurn[]): { platform: string; handle: string } | null {
  for (let i = history.length - 1; i >= 0; i--) {
    const t = history[i]
    if (t.sender_type !== "visitor" || !t.body) continue
    const d = t.body.match(DISCORD_RE)
    if (d) return { platform: "discord", handle: d[1] }
    const tg = t.body.match(TELEGRAM_RE)
    if (tg) return { platform: "telegram", handle: tg[1] }
  }
  return null
}

/**
 * Run the assistant over the conversation history. Returns the reply text and
 * whether the assistant escalated. SDK errors are allowed to throw — the caller
 * (the chat route) catches them so an AI failure never breaks the send.
 */
export async function runAssistant(
  history: ChatTurn[],
  ctx?: { conversationId?: string },
): Promise<AssistantResult> {
  // Map history → Gemini contents; keep only the last MAX_TURNS turns.
  // visitor → user, agent → model. Skip turns that are empty after trimming.
  const recent = history.slice(-MAX_TURNS)
  const contents: Content[] = []
  for (const t of recent) {
    const text = t.body?.trim()
    if (!text) continue
    contents.push({
      role: t.sender_type === "visitor" ? "user" : "model",
      parts: [{ text }],
    })
  }

  // The API requires the first content to be a user turn. Drop leading model turns.
  while (contents.length > 0 && contents[0].role !== "user") {
    contents.shift()
  }

  if (contents.length === 0) {
    return { reply: FALLBACK_REPLY, escalated: false, toolCalls: [] }
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

  const systemInstruction = buildSystemPrompt()
  const tools = [{ functionDeclarations: GEMINI_FUNCTION_DECLARATIONS }]

  // Call generateContent on AI_MODEL; on a model-availability error, retry the SAME
  // request once on AI_FALLBACK_MODEL. Logs which model served. Other errors throw.
  const generate = async (): Promise<GenerateContentResponse> => {
    const request = {
      contents,
      config: {
        systemInstruction,
        tools,
        toolConfig: {
          functionCallingConfig: { mode: FunctionCallingConfigMode.AUTO },
        },
        maxOutputTokens: 1024,
        abortSignal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      },
    }
    try {
      const res = await ai.models.generateContent({ model: AI_MODEL, ...request })
      console.log(`[ai] gemini served by model=${AI_MODEL}`)
      return res
    } catch (err) {
      if (isModelUnavailableError(err)) {
        console.warn(
          `[ai] model "${AI_MODEL}" unavailable (${err instanceof Error ? err.message : String(err)}); retrying on fallback "${AI_FALLBACK_MODEL}"`,
        )
        const res = await ai.models.generateContent({
          model: AI_FALLBACK_MODEL,
          ...request,
        })
        console.log(`[ai] gemini served by fallback model=${AI_FALLBACK_MODEL}`)
        return res
      }
      throw err
    }
  }

  let escalated = false
  const toolCalls: ToolCallRecord[] = []
  // Threaded into runTool; submit_order reads conversationId + the last computed quote,
  // records any contact handle, and flips escalationNotified once a human has been alerted.
  const toolCtx: ToolContext = {
    conversationId: ctx?.conversationId,
    lastQuote: null,
    lastContact: null,
    escalationNotified: false,
  }

  // A handle the visitor typed, recovered from the transcript — used when an alert fires
  // without a tool having captured the contact (e.g. a prose hand-off).
  const collectedContact = extractContact(recent)

  // Lead-safety net: whenever we fall back to "connect you with a team member" WITHOUT the
  // model having already alerted a human (via escalate_to_human / submit_order), fire the
  // escalation notification ourselves so the lead is NEVER silently lost. Idempotent per turn.
  const notifyEscalationOnce = async (reason: string): Promise<void> => {
    if (toolCtx.escalationNotified) return
    // Effective contact: a tool-captured handle, else one recovered from the transcript.
    const contact = toolCtx.lastContact ?? collectedContact ?? null
    try {
      const ok = await sendEscalationNotification(
        toolCtx.conversationId ?? "unknown",
        reason,
        contact,
      )
      if (ok) {
        toolCtx.escalationNotified = true
        console.log(
          `[ai] fallback escalation: team notified conv=${toolCtx.conversationId} reason="${reason}" contact=${contact?.handle ?? "none"}`,
        )
      } else {
        console.error(
          `[ai] fallback escalation: NOT delivered (Telegram failed/unconfigured) conv=${toolCtx.conversationId} reason="${reason}"`,
        )
      }
    } catch (err) {
      console.error(`[ai] fallback escalation: notify threw conv=${toolCtx.conversationId}:`, err)
    }
  }

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await generate()

    const calls = response.functionCalls
    if (!calls || calls.length === 0) {
      const reply = (response.text ?? "").trim()
      if (!reply) {
        // No text and no tool call. If we already priced something, quote it.
        const fromTools = quoteFromToolCalls(toolCalls)
        if (fromTools) return { reply: fromTools, escalated, toolCalls }
        // Dead-end: alert a human so the lead is never lost.
        await notifyEscalationOnce("AI produced no answer for the visitor")
        return { reply: FALLBACK_REPLY, escalated: true, toolCalls }
      }
      // Prose-handoff net: the reply promises a human but no tool escalated/ordered.
      if (!escalated && !orderPlacedThisTurn(toolCalls) && looksLikeHandoff(reply)) {
        await notifyEscalationOnce(
          "Assistant told the visitor a human would follow up, but called no tool — alerting so the lead isn't lost",
        )
        escalated = true
      }
      return { reply, escalated, toolCalls }
    }

    // Echo the model's tool-call turn back into the conversation, then answer each
    // call with a single user turn carrying one functionResponse part per call.
    const modelContent = response.candidates?.[0]?.content
    if (modelContent) {
      contents.push(modelContent)
    }

    const responseParts: Part[] = []
    for (const call of calls) {
      const name = call.name ?? ""
      const args = call.args ?? {}
      if (name === "escalate_to_human") escalated = true

      let result: unknown
      if (name === "calculate_price") {
        // The model fills paramsJson with a JSON object string. Parse it defensively;
        // bad JSON degrades to {} so runTool returns { error } and the model re-asks.
        let params: Record<string, unknown> = {}
        const raw = args.paramsJson
        if (typeof raw === "string") {
          try {
            const parsed = JSON.parse(raw)
            if (parsed && typeof parsed === "object") {
              params = parsed as Record<string, unknown>
            }
          } catch {
            params = {}
          }
        } else if (raw && typeof raw === "object") {
          // Tolerate the model passing an object directly instead of a string.
          params = raw as Record<string, unknown>
        }
        result = await runTool("calculate_price", { serviceId: args.serviceId, params }, toolCtx)
        toolCalls.push({ name, input: { serviceId: args.serviceId, params }, result })
      } else {
        result = await runTool(name, args as Record<string, unknown>, toolCtx)
        toolCalls.push({ name, input: args as Record<string, unknown>, result })
      }

      // Remember the last module-computed total so a later submit_order quotes the
      // authoritative price (never a model-invented one).
      const rr = result as Record<string, unknown> | null
      if (
        rr &&
        typeof rr === "object" &&
        !("error" in rr) &&
        typeof (rr as { total?: unknown }).total === "number"
      ) {
        toolCtx.lastQuote = {
          total: (rr as { total: number }).total,
          currency:
            typeof (rr as { currency?: unknown }).currency === "string"
              ? (rr as { currency: string }).currency
              : "USD",
          route:
            typeof (rr as { route?: unknown }).route === "string"
              ? (rr as { route: string }).route
              : "/",
        }
      }

      responseParts.push({
        functionResponse: {
          name,
          response: { result },
        },
      })
    }

    contents.push({ role: "user", parts: responseParts })
  }

  // Exhausted the loop without a final text answer. If the model already computed a
  // valid price via a tool, quote it deterministically instead of escalating.
  const fromTools = quoteFromToolCalls(toolCalls)
  if (fromTools) return { reply: fromTools, escalated, toolCalls }
  // Looped out with nothing to say — alert a human so the lead is never lost.
  await notifyEscalationOnce("AI loop limit reached without resolving the request")
  return { reply: FALLBACK_REPLY, escalated: true, toolCalls }
}
