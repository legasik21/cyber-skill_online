// On-topic / off-topic classification for the chat guard (Feature 3).
//
// Two stages, cheapest first, so the expensive assistant loop is only entered for
// genuinely on-topic messages:
//   1. classifyTopicQuick — deterministic keyword/heuristic pass. Returns a verdict
//      for the common cases (clear WoT/commerce vocabulary, clear other-domain
//      markers, short conversational glue) and "unknown" otherwise.
//   2. classifyTopicLLM — a tiny Gemini call used ONLY for "unknown". It is biased
//      to ON: any error, timeout, or ambiguity resolves to on-topic, so we never
//      wrongly refuse a real customer.
//
// On-topic = World of Tanks (the game, accounts, stats) and our account-boosting
// services (pricing/ordering included). Everything else is off-topic.

import { GoogleGenAI } from "@google/genai"
import { AI_MODEL } from "@/lib/ai/config"

export type Topic = "on" | "off"
export type QuickTopic = "on" | "off" | "unknown"

// Words/phrases that mark a message as clearly on-topic (WoT + our services + the
// commercial intent of buying a boost). Matched as substrings on a normalized string.
const ON_TERMS: string[] = [
  // World of Tanks / the game
  "wot", "world of tank", "tank", "wn8", "win rate", "winrate", "credit", "bond",
  "silver", "free xp", "freexp", "free-xp", "crew", "garage", "battle", "clan",
  "mission", "campaign", "personal mission", "marks", "mark of excellence", "moe",
  "ace tanker", "ace ", "tier", "premium", "premium tank", "tech tree", "researchable",
  "object ", "obj ", "is-7", "t-55", "t55", "leopard", "badge", "medal", "stat",
  "carry", "damage", "dpg", "spotting", "blocked", "ranked", "onslaught", "frontline",
  "battle pass", "battlepass", "holiday ops", "referral", "platoon", "arty", "spg",
  "heavy", "medium", "light tank", "td ", "tank destroyer", "gold",
  // our services + commercial intent
  "boost", "boosting", "farm", "farming", "leveling", "level up", "research", "grind",
  "service", "package", "order", "buy", "purchase", "price", "pricing", "cost",
  "how much", "quote", "pay", "payment", "discount", "deal", "offer", "account",
  "session", "driver", "play on my", "play at", "rank up",
]

// Words/phrases that mark a message as clearly NOT about us (other domains/games).
const OFF_TERMS: string[] = [
  "weather", "recipe", "cook", "cooking", "joke", "politic", "election", "president",
  "covid", "vaccine", "stock market", "crypto", "bitcoin", "ethereum", "girlfriend",
  "boyfriend", "dating", "homework", "essay", "poem", "python", "javascript", "java ",
  "c++", "html", "css", "leetcode", "minecraft", "fortnite", "roblox", "valorant",
  "league of legends", "counter-strike", "gta", "fifa", "pokemon", "chatgpt", "openai",
  "capital of", "translate", "lyrics", "horoscope", "football", "soccer", "basketball",
  "nba", "movie", "netflix", "stock price", "weather forecast",
]

// Short conversational glue that should never be penalized as off-topic.
const GLUE = new Set<string>([
  "hi", "hello", "hey", "yo", "sup", "hiya", "gm", "gg", "ty", "thanks", "thank",
  "thx", "ok", "okay", "k", "yes", "yep", "yeah", "yup", "no", "nope", "sure",
  "please", "pls", "cool", "nice", "great", "awesome", "perfect", "maybe", "idk",
  "lol", "haha", "wow", "ready", "done", "stop", "wait", "hmm",
])

function normalize(text: string): string {
  return String(text ?? "").toLowerCase().trim()
}

/**
 * Deterministic first pass. ON wins over OFF when both appear (a message that
 * mentions tanks AND something else is still about tanks). Short glue and very
 * short messages are treated as on-topic to avoid penalizing normal chatter.
 */
export function classifyTopicQuick(text: string): QuickTopic {
  const t = normalize(text)
  if (!t) return "on" // empty -> let the assistant handle it; never an off-topic strike

  const words = t.split(/\s+/).filter(Boolean)

  // Pure glue (e.g. "ok thanks", "yes please") -> on-topic.
  if (words.length > 0 && words.every((w) => GLUE.has(w.replace(/[^a-z]/g, "")))) {
    return "on"
  }

  const hasOn = ON_TERMS.some((term) => t.includes(term))
  if (hasOn) return "on"

  const hasOff = OFF_TERMS.some((term) => t.includes(term))
  if (hasOff) return "off"

  // No signal either way: short messages are conversational glue (on-topic);
  // longer no-signal messages are ambiguous and deferred to the LLM tie-breaker.
  if (words.length <= 3) return "on"
  return "unknown"
}

/**
 * Tiny Gemini classification for ambiguous messages. Returns "on" on ANY error,
 * timeout, or unparseable output — we accept a little wasted token spend over the
 * far worse failure of refusing a genuine customer. Caller must ensure the API key
 * is configured.
 */
export async function classifyTopicLLM(
  recent: { sender_type: "visitor" | "agent"; body: string }[],
  latest: string,
): Promise<Topic> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    const tail = recent.slice(-4)
    const contextLines = tail
      .map((m) => `${m.sender_type === "visitor" ? "Customer" : "Assistant"}: ${m.body}`)
      .join("\n")

    const systemInstruction =
      "You are a strict topic gate for a World of Tanks (WoT) account-boosting shop's " +
      "support chat. ON-TOPIC = World of Tanks (the game, accounts, stats, tanks, missions) " +
      "or our boosting/farming services, pricing, and ordering. Greetings, thanks, and short " +
      "replies that continue the conversation are ON-TOPIC. OFF-TOPIC = anything unrelated " +
      "(other games, coding, weather, general knowledge, etc.). Reply with exactly one word: " +
      "ON or OFF."

    const res = await ai.models.generateContent({
      model: AI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                `${contextLines ? `Conversation so far:\n${contextLines}\n\n` : ""}` +
                `Classify ONLY this latest customer message:\n"${latest}"\n\nReply ON or OFF.`,
            },
          ],
        },
      ],
      config: {
        systemInstruction,
        maxOutputTokens: 4,
        temperature: 0,
        abortSignal: AbortSignal.timeout(8000),
      },
    })
    const out = (res.text ?? "").trim().toLowerCase()
    if (out.startsWith("off")) return "off"
    return "on"
  } catch (err) {
    console.warn("[ai] topic classification failed; defaulting to on-topic:", err)
    return "on"
  }
}

/**
 * Full classification: deterministic pass, then LLM tie-breaker for "unknown".
 */
export async function classifyTopic(
  recent: { sender_type: "visitor" | "agent"; body: string }[],
  latest: string,
): Promise<Topic> {
  const quick = classifyTopicQuick(latest)
  if (quick !== "unknown") return quick
  return classifyTopicLLM(recent, latest)
}
