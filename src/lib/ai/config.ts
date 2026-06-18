// Configuration + feature flag for the native Google Gemini AI chat responder.
//
// IMPORTANT: nothing here reads GEMINI_API_KEY into a module-scope constant and
// nothing constructs the GoogleGenAI client at import time. The build must succeed
// without the key; the client is constructed lazily inside runAssistant().

/** Master feature flag. Default OFF — the responder is a no-op unless this is "true". */
export const AI_CHAT_ENABLED = process.env.AI_CHAT_ENABLED === "true"

/**
 * Model id. Owner directive: use Google Gemini (gemini-2.5-flash by default — cheap
 * and fully capable of the tool-calling flow). Override via GEMINI_MODEL.
 */
export const AI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash"

/**
 * Fallback model. Only used when a generateContent call fails with a
 * model-not-found / availability error (see runAssistant). Override via
 * GEMINI_FALLBACK_MODEL.
 */
export const AI_FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || "gemini-3.5-flash"

/** Fixed UUID identifying the AI as the conversation's agent / owner. */
export const AI_AGENT_ID = "11111111-1111-4111-8111-111111111111"

/** Display name for the AI agent. */
export const AI_AGENT_NAME = "CyberSkill Assistant"

/**
 * Whether the Gemini API key is present. Checked at request time (not import
 * time) so the build never requires the key.
 */
export function isAiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY)
}
