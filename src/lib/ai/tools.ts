// The tools exposed to the model + a deterministic executor.
//
// Pricing/FAQ come exclusively from the in-app source of truth (catalog.ts / faq.ts).
// runTool NEVER throws out: bad inputs are returned as { error } so the model re-asks.

import { Type, type FunctionDeclaration } from "@google/genai"
import {
  SERVICE_CATALOG,
  type ServiceId,
  getServiceDescriptor,
  calculatePrice,
} from "@/lib/pricing/catalog"
import { priceCampaignMissions } from "@/lib/pricing/campaign-missions"
import { normalizeCampaignMissions } from "@/lib/pricing/campaign-input"
import { sendChatOrderNotification, sendEscalationNotification } from "@/lib/telegram"
import { FAQ, FAQ_TOPICS, type FaqTopic } from "@/data/faq"

const SERVICE_IDS = Object.keys(SERVICE_CATALOG) as ServiceId[]

/** Contact platforms we accept for an in-chat order (Discord preferred). */
export const ORDER_CONTACT_PLATFORMS = ["discord", "telegram", "whatsapp"] as const
export type OrderContactPlatform = (typeof ORDER_CONTACT_PLATFORMS)[number]

/**
 * Per-call context threaded from runAssistant into runTool. submit_order needs the
 * conversation id (for the order record) and the LAST price computed by a pricing
 * tool this turn — the authoritative number always comes from the pricing module,
 * never from the model.
 */
export type ToolContext = {
  conversationId?: string
  lastQuote?: { total: number; currency: string; route: string } | null
  /** The last contact handle the visitor gave this turn — attached to any escalation. */
  lastContact?: { platform: string; handle: string } | null
  /** Set once an escalation has actually notified Telegram, so we never double-alert. */
  escalationNotified?: boolean
}

// Gemini function declarations. Pass as `tools: [{ functionDeclarations: GEMINI_FUNCTION_DECLARATIONS }]`.
//
// Schemas are the strict OpenAPI subset Gemini supports (Type.OBJECT/STRING/NUMBER/
// BOOLEAN/ARRAY, `enum` on strings). Gemini does NOT cleanly support a free-form
// object property (arbitrary keys), so calculate_price takes `paramsJson` — a STRING
// the model fills with a JSON object. Campaign missions instead use the dedicated,
// fully-typed `price_campaign` tool (a flat array, no dynamic keys).
export const GEMINI_FUNCTION_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: "get_service_pricing",
    description:
      "Call this BEFORE pricing to fetch a service's exact required parameters, their enums/bounds, and operator notes. Use it to learn what to ask the customer and to validate their inputs against the schema. Returns the ServiceDescriptor from the catalog. (For campaign/personal missions, prefer the dedicated price_campaign tool.)",
    parameters: {
      type: Type.OBJECT,
      properties: {
        serviceId: {
          type: Type.STRING,
          enum: SERVICE_IDS,
          description: "The service to inspect.",
        },
      },
      required: ["serviceId"],
    },
  },
  {
    name: "calculate_price",
    description:
      "Call this to compute the EXACT USD price for a service once you have the required params. This is the ONLY source of prices — never compute, estimate, or invent a price yourself. Returns { serviceId, currency, total, breakdown }. If params are invalid it returns { error }; re-ask the customer rather than guessing. NOTE: for campaign / personal missions use price_campaign instead.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        serviceId: {
          type: Type.STRING,
          enum: SERVICE_IDS,
          description: "The service to price.",
        },
        paramsJson: {
          type: Type.STRING,
          description:
            'A JSON object string of the service params, e.g. {"serviceType":"credits","tier":"under-2500","amount":100}. Keys, enums and bounds must match the schema from get_service_pricing.',
        },
      },
      required: ["serviceId", "paramsJson"],
    },
  },
  {
    name: "price_campaign",
    description:
      'Price a WoT Campaign / Personal Missions request and QUOTE it in ONE reply — do NOT loop. Give the reward TANK (e.g. "Object 260", "T-55A", "Excalibur", "Black Rock") and the missions as a flat list of { tank, class, mission }. The campaign (1.0/2.0/3.0) is INFERRED from the reward tank — never ask which campaign. class = the mission branch: 1.0 uses lt/mt/ht/td/spg (LT/MT/HT/TD/SPG), 2.0 uses union/bloc/alliance/coalition, 3.0 uses vanguard/ambush/assistance. "HT-15" = class "ht", mission 15 — class + number + reward tank fully specify a mission, so NEVER ask which tank a mission is "for". mission is "1"-"15", or "all" for the whole branch (all 15). Returns { total, original, discount, interpretation }. On an unrecognized token it returns { error } — then ask ONE short clarifying question.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        missions: {
          type: Type.ARRAY,
          description: "Every requested mission as a flat item (one campaign's reward tank only).",
          items: {
            type: Type.OBJECT,
            properties: {
              tank: {
                type: Type.STRING,
                description:
                  'Reward tank name, e.g. "Object 260", "T-55A", "Excalibur", "Object 279 (e)", "Windhund", "Black Rock". Determines the campaign.',
              },
              class: {
                type: Type.STRING,
                enum: [
                  "lt", "mt", "ht", "td", "spg",
                  "union", "bloc", "alliance", "coalition",
                  "vanguard", "ambush", "assistance",
                ],
                description:
                  "Mission branch/class. Campaign 1.0: lt/mt/ht/td/spg. 2.0: union/bloc/alliance/coalition. 3.0: vanguard/ambush/assistance.",
              },
              mission: {
                type: Type.STRING,
                description: 'Mission number "1"-"15", or "all" for the entire branch (all 15).',
              },
            },
            required: ["tank", "class", "mission"],
          },
        },
        honors: {
          type: Type.NUMBER,
          description:
            'Optional: how many of the missions are requested WITH honors ("second task"). The base is priced here; honors add +50% per honored mission, confirmed by a manager.',
        },
      },
      required: ["missions"],
    },
  },
  {
    name: "submit_order",
    description:
      "Place the customer's order. REQUIRED FIRST: in THIS SAME turn, (re)compute the exact price by calling calculate_price (or price_campaign) for the agreed service + options, so the order carries a module-computed price — you never supply a number yourself. Then collect ONE contact handle: ask for a Discord username FIRST; if they have no Discord, accept a Telegram @handle or a WhatsApp number. Do NOT ask for email, phone, real name, or anything else. Confirm a one-line order summary with the customer, then call this ONCE. It posts the order to our orders desk and a manager reaches out on that platform. NEVER call this without a contact handle. If you have not priced the order in this turn, submit_order returns an error asking you to price first.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        service: {
          type: Type.STRING,
          description:
            'What the customer is ordering, e.g. "Credit Farm", "Campaign Missions — Object 260", "WN8 Boost".',
        },
        summary: {
          type: Type.STRING,
          description:
            'One-line summary of the exact request incl. options, e.g. "100M credits, driver under 2500 WN8, customer\'s own boosters".',
        },
        contactPlatform: {
          type: Type.STRING,
          enum: [...ORDER_CONTACT_PLATFORMS],
          description: "The single contact platform the customer chose: discord (preferred), telegram, or whatsapp.",
        },
        contactHandle: {
          type: Type.STRING,
          description:
            "The customer's handle on that platform: a Discord username, a Telegram @handle, or a WhatsApp number. Required — never empty.",
        },
      },
      required: ["service", "summary", "contactPlatform", "contactHandle"],
    },
  },
  {
    name: "answer_faq",
    description:
      "Call this for ANY policy / safety / account / refund / payment / delivery / privacy / eligibility question. Returns the top matching grounded FAQ entries. Answer the customer ONLY from these entries; if they don't cover the question, call escalate_to_human.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: "The customer's question, in their own words.",
        },
        topic: {
          type: Type.STRING,
          enum: FAQ_TOPICS,
          description: "Optional topic hint to bias retrieval.",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "escalate_to_human",
    description:
      "Call this when you cannot answer from the catalog or FAQ, when the customer asks for a human, or for event-specific pricing you cannot compute (e.g. arcade-cabinet event missions/tokens). Do NOT escalate a normal campaign-missions quote — price it with price_campaign (honors is quoted as a base + manager-confirmed add-on, not an escalation). For an ORDER, prefer submit_order (it captures the lead even without a price); only escalate if there is no order to place. Hands the conversation to a team member and alerts the team on Telegram. If the customer ALREADY gave a contact handle, pass it as contactHandle (+ contactPlatform) so the team can reach them.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        reason: {
          type: Type.STRING,
          description: "Why escalation is needed.",
        },
        contactHandle: {
          type: Type.STRING,
          description:
            "Optional: a contact handle the customer already gave (Discord username / Telegram @handle / WhatsApp number), so the team can reach them.",
        },
        contactPlatform: {
          type: Type.STRING,
          enum: [...ORDER_CONTACT_PLATFORMS],
          description: "Optional: the platform of contactHandle — discord, telegram, or whatsapp.",
        },
      },
      required: ["reason"],
    },
  },
]

function isKnownService(id: unknown): id is ServiceId {
  return typeof id === "string" && Object.prototype.hasOwnProperty.call(SERVICE_CATALOG, id)
}

function scoreFaqEntry(query: string, topic: FaqTopic | undefined, e: (typeof FAQ)[number]): number {
  const haystack = `${e.question} ${e.answer} ${e.topic}`.toLowerCase()
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2)
  let score = 0
  for (const t of terms) {
    if (haystack.includes(t)) score += 1
  }
  if (topic && e.topic === topic) score += 3
  return score
}

/**
 * Dispatch a tool call. block.input is already a parsed object.
 * Always resolves (never throws) — errors are returned as { error }.
 */
export async function runTool(
  name: string,
  input: Record<string, unknown>,
  ctx?: ToolContext,
): Promise<unknown> {
  switch (name) {
    case "get_service_pricing": {
      const serviceId = input?.serviceId
      if (!isKnownService(serviceId)) return { error: "unknown service" }
      try {
        return getServiceDescriptor(serviceId)
      } catch (err) {
        return { error: err instanceof Error ? err.message : String(err) }
      }
    }

    case "calculate_price": {
      const serviceId = input?.serviceId
      if (!isKnownService(serviceId)) return { error: "unknown service" }
      const params = (input?.params as Record<string, unknown>) || {}
      try {
        return calculatePrice(serviceId, params)
      } catch {
        return {
          error:
            "This service can't be priced automatically here — offer the customer a custom quote.",
        }
      }
    }

    case "price_campaign": {
      // Flat { tank, class, mission }[] -> nested SelectedMissions, priced by the
      // shared module (never by the model). Specific parse errors are surfaced so
      // the model can ask ONE targeted clarifying question.
      const parsed = normalizeCampaignMissions(input?.missions)
      if (!parsed.ok) return { error: parsed.error }
      const r = priceCampaignMissions(parsed.campaignId, parsed.selectedMissions)
      const honors = Number(input?.honors) || 0
      return {
        serviceId: "campaign-missions",
        currency: "USD",
        route: "/services/campaign-missions",
        campaignId: parsed.campaignId,
        interpretation: parsed.interpretation,
        total: r.total,
        original: r.original,
        discount: r.discount,
        ...(honors > 0
          ? {
              honorsNote: `Base price shown. Honors / "second task" on ${honors} mission(s) adds +50% per honored mission — a manager will confirm that add-on.`,
            }
          : {}),
      }
    }

    case "submit_order": {
      // Collect ONLY a service+options summary and ONE contact handle. The price is
      // taken from the module-computed quote (ctx.lastQuote), never from the model.
      const service = typeof input?.service === "string" ? input.service.trim() : ""
      const summary = typeof input?.summary === "string" ? input.summary.trim() : ""
      const platformRaw = String(input?.contactPlatform ?? "").trim().toLowerCase()
      const contactHandle =
        typeof input?.contactHandle === "string" ? input.contactHandle.trim() : ""

      const conversationId = ctx?.conversationId ?? "unknown"
      if (!contactHandle) {
        console.warn(`[ai] submit_order: refused — no contact handle conv=${conversationId}`)
        return {
          error:
            "A contact handle is required. Ask the customer for a Discord username (or a Telegram @handle / WhatsApp number) before submitting.",
        }
      }
      if (!service && !summary) {
        console.warn(`[ai] submit_order: refused — no service/summary conv=${conversationId}`)
        return { error: "Describe the service and options before submitting the order." }
      }
      // Validate the platform instead of silently coercing it — a Telegram/WhatsApp
      // handle must never be filed as "discord".
      if (!(ORDER_CONTACT_PLATFORMS as readonly string[]).includes(platformRaw)) {
        console.warn(`[ai] submit_order: bad platform "${platformRaw}" conv=${conversationId}`)
        return {
          error:
            "Invalid contact platform. Confirm one of: discord, telegram, or whatsapp, then resubmit.",
        }
      }
      const contactPlatform = platformRaw
      // Remember the handle so any escalation later in this turn can include it.
      if (ctx) ctx.lastContact = { platform: contactPlatform, handle: contactHandle }

      // Price comes ONLY from the module-computed quote (ctx.lastQuote) — never a
      // model-invented number. But a missing quote must NEVER lose the lead: with a
      // handle in hand we ALWAYS route the order. If no price was computed this turn,
      // capture it as a PRICE-TBD order for a manager to confirm (no fabricated number).
      const q = ctx?.lastQuote
      const hasPrice = !!q && typeof q.total === "number"
      const price = hasPrice
        ? `$${q!.total}${q!.currency && q!.currency !== "USD" ? ` ${q!.currency}` : ""}`
        : "(manager to confirm)"
      const route = hasPrice && q!.route ? q!.route : "/"

      const submitted = await sendChatOrderNotification({
        service: service || summary,
        summary: summary || service,
        price,
        contactPlatform,
        contactHandle,
        conversationId,
        needsPriceConfirmation: !hasPrice,
      })
      if (!submitted) {
        // Orders desk unreachable — escalate so a HUMAN is still alerted; never drop the lead.
        console.error(
          `[ai] submit_order: orders-desk send FAILED conv=${conversationId} service="${service || summary}" handle=${contactHandle} hasPrice=${hasPrice}`,
        )
        let alerted = false
        try {
          alerted = await sendEscalationNotification(
            conversationId,
            `Order could not reach the orders desk — ${service || summary}`,
            { platform: contactPlatform, handle: contactHandle },
          )
        } catch (err) {
          console.error(`[ai] submit_order: escalation fallback threw conv=${conversationId}:`, err)
        }
        if (ctx && alerted) ctx.escalationNotified = true
        return {
          error:
            "Could not reach the orders desk right now, but a team member has been alerted and will follow up shortly.",
          alerted,
        }
      }

      if (!hasPrice) {
        console.warn(
          `[ai] submit_order: lead CAPTURED without module price (manager to confirm) conv=${conversationId} service="${service || summary}" handle=${contactHandle}`,
        )
      } else {
        console.log(
          `[ai] submit_order: order sent conv=${conversationId} service="${service || summary}" price=${price} handle=${contactHandle}`,
        )
      }
      return {
        ok: true,
        submitted: true,
        service: service || summary,
        summary,
        price,
        route,
        contactPlatform,
        contactHandle,
        needsPriceConfirmation: !hasPrice,
        message: hasPrice
          ? `Order received. A manager will reach out on ${contactPlatform} (${contactHandle}).`
          : `Order received — a manager will confirm the exact price and reach out on ${contactPlatform} (${contactHandle}).`,
      }
    }

    case "answer_faq": {
      const query = typeof input.query === "string" ? input.query : ""
      const topic = FAQ_TOPICS.includes(input.topic as FaqTopic)
        ? (input.topic as FaqTopic)
        : undefined

      const scored = FAQ.map((e) => ({ e, score: scoreFaqEntry(query, topic, e) }))
        .sort((a, b) => b.score - a.score)

      const top = scored.filter((s) => s.score > 0).slice(0, 3)
      if (top.length > 0) {
        return top.map(({ e }) => ({ question: e.question, answer: e.answer, topic: e.topic }))
      }

      // No keyword match — return the most general grounding so the model isn't empty-handed.
      const generalTopics: FaqTopic[] = ["account-safety", "refunds", "delivery"]
      const fallback = generalTopics
        .map((t) => FAQ.find((e) => e.topic === t))
        .filter((e): e is (typeof FAQ)[number] => Boolean(e))
        .slice(0, 3)
        .map((e) => ({ question: e.question, answer: e.answer, topic: e.topic }))
      return fallback
    }

    case "escalate_to_human": {
      const reason =
        typeof input?.reason === "string" && input.reason.trim() ? input.reason.trim() : "unspecified"
      const conversationId = ctx?.conversationId ?? "unknown"
      // Prefer a handle the model passed explicitly; else any handle captured this turn.
      const handle = typeof input?.contactHandle === "string" ? input.contactHandle.trim() : ""
      const platform =
        typeof input?.contactPlatform === "string" ? input.contactPlatform.trim().toLowerCase() : ""
      const contact = handle
        ? { platform: platform || "unknown", handle }
        : ctx?.lastContact ?? null

      let notified = false
      try {
        notified = await sendEscalationNotification(conversationId, reason, contact)
      } catch (err) {
        console.error(
          `[ai] escalate_to_human: Telegram notify threw conv=${conversationId} reason="${reason}":`,
          err,
        )
      }
      if (ctx && notified) ctx.escalationNotified = true
      if (notified) {
        console.log(
          `[ai] escalate_to_human: team notified conv=${conversationId} reason="${reason}" contact=${contact?.handle ?? "none"}`,
        )
      } else {
        console.error(
          `[ai] escalate_to_human: NOBODY notified (Telegram failed/unconfigured) conv=${conversationId} reason="${reason}" contact=${contact?.handle ?? "none"}`,
        )
      }
      return { escalated: true, reason, notified }
    }

    default:
      return { error: `unknown tool: ${name}` }
  }
}
