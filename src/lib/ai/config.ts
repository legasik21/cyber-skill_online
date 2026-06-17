// Configuration + feature flag for the native Claude AI chat responder.
//
// IMPORTANT: nothing here reads ANTHROPIC_API_KEY into a module-scope constant and
// nothing constructs the Anthropic client at import time. The build must succeed
// without the key; the client is constructed lazily inside runAssistant().

/** Master feature flag. Default OFF — the responder is a no-op unless this is "true". */
export const AI_CHAT_ENABLED = process.env.AI_CHAT_ENABLED === "true"

/**
 * Model id. Brief-specified default is claude-sonnet-4-6; claude-haiku-4-5 is the
 * documented cost lever (set via ANTHROPIC_MODEL).
 */
export const AI_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6"

/** Fixed UUID identifying the AI as the conversation's agent / owner. */
export const AI_AGENT_ID = "11111111-1111-4111-8111-111111111111"

/** Display name for the AI agent. */
export const AI_AGENT_NAME = "CyberSkill Assistant"

/**
 * Whether the Anthropic API key is present. Checked at request time (not import
 * time) so the build never requires the key.
 */
export function isAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY)
}
