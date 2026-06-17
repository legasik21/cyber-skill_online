// The agentic loop. Lazily constructs the Anthropic client (reads ANTHROPIC_API_KEY
// from env at call time — NOT at import time, so the build never requires the key).

import Anthropic from "@anthropic-ai/sdk"
import { AI_MODEL } from "@/lib/ai/config"
import { buildSystemPrompt } from "@/lib/ai/prompt"
import { TOOLS, runTool } from "@/lib/ai/tools"

export type ChatTurn = { sender_type: "visitor" | "agent"; body: string }
export type AssistantResult = { reply: string; escalated: boolean }

const MAX_ITERATIONS = 6
const MAX_TURNS = 30
const FALLBACK_REPLY = "Let me connect you with a team member."

/**
 * Run the assistant over the conversation history. Returns the reply text and
 * whether the assistant escalated. SDK errors are allowed to throw — the caller
 * (the chat route) catches them so an AI failure never breaks the send.
 */
export async function runAssistant(history: ChatTurn[]): Promise<AssistantResult> {
  const client = new Anthropic()

  // Map history → API messages; keep only the last MAX_TURNS turns.
  const recent = history.slice(-MAX_TURNS)
  const messages: Anthropic.MessageParam[] = recent.map((t) => ({
    role: t.sender_type === "visitor" ? ("user" as const) : ("assistant" as const),
    content: t.body,
  }))

  // The API requires the array to start with a user turn. Drop leading agent turns.
  while (messages.length > 0 && messages[0].role !== "user") {
    messages.shift()
  }

  if (messages.length === 0) {
    return { reply: FALLBACK_REPLY, escalated: false }
  }

  const system: Anthropic.MessageCreateParams["system"] = [
    {
      type: "text",
      text: buildSystemPrompt(),
      cache_control: { type: "ephemeral" },
    },
  ]

  let escalated = false

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await client.messages.create(
      {
        model: AI_MODEL,
        max_tokens: 1024,
        system,
        tools: TOOLS,
        tool_choice: { type: "auto" },
        messages,
      },
      { timeout: 30000 },
    )

    if (response.stop_reason !== "tool_use") {
      const reply = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("")
        .trim()
      if (!reply) return { reply: FALLBACK_REPLY, escalated: true }
      return { reply, escalated }
    }

    // Run each requested tool and feed the results back.
    messages.push({ role: "assistant", content: response.content })

    const toolResults: Anthropic.ToolResultBlockParam[] = []
    for (const block of response.content) {
      if (block.type !== "tool_use") continue
      if (block.name === "escalate_to_human") escalated = true
      const result = await runTool(block.name, block.input as Record<string, unknown>)
      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify(result),
      })
    }

    messages.push({ role: "user", content: toolResults })
  }

  // Exhausted the loop without a final text answer.
  return { reply: FALLBACK_REPLY, escalated: true }
}
