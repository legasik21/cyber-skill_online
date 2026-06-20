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
export const AI_FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || "gemini-2.0-flash"

/** Fixed UUID identifying the AI as the conversation's agent / owner. */
export const AI_AGENT_ID = "11111111-1111-4111-8111-111111111111"

/** Display name for the AI agent. */
export const AI_AGENT_NAME = "CyberSkill Assistant"

/**
 * Off-topic guard (Feature 3). After this many CONSECUTIVE clearly-off-topic
 * visitor messages, the assistant pauses for the conversation to bound token
 * spend. Any on-topic message resets the run to 0 (until the cutoff fires).
 */
export const OFF_TOPIC_LIMIT = 3

/**
 * Per-conversation question cap (Feature 5). Once the assistant has answered this
 * many turns in one conversation, it pauses and hands off to a human via Telegram.
 */
export const AI_ANSWER_CAP = 15

/** Static (no-LLM) lines used by the guard/cap paths so they cost zero tokens. */
export const CANNED = {
  /** 1st/2nd off-topic message. */
  offTopicRefusal:
    "I can only help with World of Tanks boosting and our services. Is there anything about your account or our boosts I can help with?",
  /** Sent once when the off-topic cutoff trips (3rd strike); AI then goes silent. */
  offTopicPaused:
    "This chat is paused — it's drifted off the World of Tanks boosting topics we can help with. If you have a WoT boosting question, a team member can pick things up from here.",
  /** Shown to the visitor when the answer cap is reached and we hand off. */
  capHandoff:
    "I've brought a team member in to take great care of you from here — they'll continue with you shortly. You can keep typing in the meantime.",
} as const

/**
 * Whether the Gemini API key is present. Checked at request time (not import
 * time) so the build never requires the key.
 */
export function isAiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY)
}
