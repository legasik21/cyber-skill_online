// The 4 tools exposed to the model + a deterministic executor.
//
// Pricing/FAQ come exclusively from the in-app source of truth (catalog.ts / faq.ts).
// runTool NEVER throws out: bad inputs are returned as { error } so the model re-asks.

import type Anthropic from "@anthropic-ai/sdk"
import {
  SERVICE_CATALOG,
  type ServiceId,
  getServiceDescriptor,
  calculatePrice,
} from "@/lib/pricing/catalog"
import { FAQ, FAQ_TOPICS, type FaqTopic } from "@/data/faq"

const SERVICE_IDS = Object.keys(SERVICE_CATALOG) as ServiceId[]

export const TOOLS = [
  {
    name: "get_service_pricing",
    description:
      "Call this BEFORE pricing to fetch a service's exact required parameters, their enums/bounds, and operator notes. Use it to learn what to ask the customer and to validate their inputs against the schema. Returns the ServiceDescriptor from the catalog.",
    input_schema: {
      type: "object" as const,
      additionalProperties: false,
      properties: {
        serviceId: {
          type: "string",
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
      "Call this to compute the EXACT USD price for a service once you have the required params. This is the ONLY source of prices — never compute, estimate, or invent a price yourself. Returns { serviceId, currency, total, breakdown }. If params are invalid it returns { error }; re-ask the customer rather than guessing.",
    input_schema: {
      type: "object" as const,
      additionalProperties: false,
      properties: {
        serviceId: {
          type: "string",
          enum: SERVICE_IDS,
          description: "The service to price.",
        },
        params: {
          type: "object",
          description:
            "The resolved parameters for this service, matching its schema from get_service_pricing (keys, enums, bounds).",
        },
      },
      required: ["serviceId", "params"],
    },
  },
  {
    name: "answer_faq",
    description:
      "Call this for ANY policy / safety / account / refund / payment / delivery / privacy / eligibility question. Returns the top matching grounded FAQ entries. Answer the customer ONLY from these entries; if they don't cover the question, call escalate_to_human.",
    input_schema: {
      type: "object" as const,
      additionalProperties: false,
      properties: {
        query: {
          type: "string",
          description: "The customer's question, in their own words.",
        },
        topic: {
          type: "string",
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
      "Call this when you cannot answer from the catalog or FAQ, when the customer asks for a human, for event-specific pricing you cannot compute (e.g. arcade-cabinet event missions/tokens), or for the campaign honors / 'second task' add-on. Hands the conversation to a team member.",
    input_schema: {
      type: "object" as const,
      additionalProperties: false,
      properties: {
        reason: {
          type: "string",
          description: "Why escalation is needed.",
        },
      },
      required: ["reason"],
    },
  },
] satisfies Anthropic.Tool[]

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
