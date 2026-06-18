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
import { GEMINI_FUNCTION_DECLARATIONS, runTool } from "@/lib/ai/tools"

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
 * Run the assistant over the conversation history. Returns the reply text and
 * whether the assistant escalated. SDK errors are allowed to throw — the caller
 * (the chat route) catches them so an AI failure never breaks the send.
 */
export async function runAssistant(history: ChatTurn[]): Promise<AssistantResult> {
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

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await generate()

    const calls = response.functionCalls
    if (!calls || calls.length === 0) {
      const reply = (response.text ?? "").trim()
      if (!reply) return { reply: FALLBACK_REPLY, escalated: true, toolCalls }
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
        result = await runTool("calculate_price", { serviceId: args.serviceId, params })
        toolCalls.push({ name, input: { serviceId: args.serviceId, params }, result })
      } else {
        result = await runTool(name, args as Record<string, unknown>)
        toolCalls.push({ name, input: args as Record<string, unknown>, result })
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

  // Exhausted the loop without a final text answer.
  return { reply: FALLBACK_REPLY, escalated: true, toolCalls }
}
