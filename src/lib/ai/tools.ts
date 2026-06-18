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
import { FAQ, FAQ_TOPICS, type FaqTopic } from "@/data/faq"

const SERVICE_IDS = Object.keys(SERVICE_CATALOG) as ServiceId[]

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
      "Call this when you cannot answer from the catalog or FAQ, when the customer asks for a human, or for event-specific pricing you cannot compute (e.g. arcade-cabinet event missions/tokens). Do NOT escalate a normal campaign-missions quote — price it with price_campaign (honors is quoted as a base + manager-confirmed add-on, not an escalation). Hands the conversation to a team member.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        reason: {
          type: Type.STRING,
          description: "Why escalation is needed.",
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
export async function runTool(name: string, input: Record<string, unknown>): Promise<unknown> {
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
      const reason = typeof input?.reason === "string" ? input.reason : "unspecified"
      return { escalated: true, reason }
    }

    default:
      return { error: `unknown tool: ${name}` }
  }
}
