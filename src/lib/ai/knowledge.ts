// Deterministic, stable reference context built from the in-app catalog + FAQ.
//
// These strings are byte-stable across requests (no timestamps / per-request data)
// so the system prompt they feed into can be prompt-cached. They are REFERENCE
// context only — the model must still CALL the tools to price and to answer FAQ.

import { SERVICE_CATALOG, type ServiceDescriptor, type ServiceParam } from "@/lib/pricing/catalog"
import { FAQ, TRUST_SIGNALS } from "@/data/faq"

function renderParam(p: ServiceParam): string {
  const parts: string[] = [`    - ${p.name} (${p.type}, ${p.required ? "REQUIRED" : "optional"})`]
  if (p.options && p.options.length) parts.push(`options: [${p.options.join(", ")}]`)
  if (typeof p.min === "number") parts.push(`min: ${p.min}`)
  if (typeof p.max === "number") parts.push(`max: ${p.max}`)
  parts.push(`— ${p.description}`)
  return parts.join("  ")
}

function renderService(d: ServiceDescriptor): string {
  const lines: string[] = []
  lines.push(`• ${d.id} — ${d.name}`)
  lines.push(`    route: ${d.route}`)
  lines.push(`    pricingType: ${d.pricingType}${typeof d.fromPriceUSD === "number" ? `, fromPriceUSD: $${d.fromPriceUSD}` : ""}`)
  if (d.params.length) {
    lines.push(`    params:`)
    for (const p of d.params) lines.push(renderParam(p))
  } else {
    lines.push(`    params: (none)`)
  }
  if (d.note) lines.push(`    note: ${d.note}`)
  return lines.join("\n")
}

/**
 * Compact text summary of every service in SERVICE_CATALOG: id, name, route,
 * pricingType, fromPriceUSD, required+optional params (with options/min/max/desc),
 * and operator note. Reference context — the model must still CALL the tools.
 */
export function buildCatalogSummary(): string {
  const services = (Object.keys(SERVICE_CATALOG) as Array<keyof typeof SERVICE_CATALOG>)
    .map((id) => renderService(SERVICE_CATALOG[id]))
    .join("\n\n")
  return services
}

/** FAQ entries rendered as grounded Q/A lines, plus the homepage trust signals. */
export function buildFaqContext(): string {
  const faqLines = FAQ.map((e) => `Q: ${e.question}\nA: ${e.answer} [${e.topic}]`).join("\n\n")
  const trust = [
    `Orders completed: ${TRUST_SIGNALS.ordersCompleted}`,
    `Average rating: ${TRUST_SIGNALS.averageRating}`,
    `Support: ${TRUST_SIGNALS.support}`,
    `Security: ${TRUST_SIGNALS.security}`,
  ].join("\n")
  return `${faqLines}\n\nTRUST SIGNALS:\n${trust}`
}
