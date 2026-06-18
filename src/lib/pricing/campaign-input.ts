// Parse-friendly campaign-missions input + resolver.
//
// The LLM parses a customer request into a FLAT list of { tank, class, mission }
// items; this module resolves free-text tank names -> { campaignId, tankId },
// validates the class/branch + mission number, and normalizes everything into the
// nested `SelectedMissions` shape that priceCampaignMissions() expects.
//
// PRICES live ONLY in campaign-missions.ts. This module reuses that module's
// exported config (getCampaignConfig) for the tank list, valid mission types, and
// display names, so there is no duplication or drift.

import {
  type CampaignId,
  type SelectedMissions,
  getCampaignConfig,
  MISSIONS_PER_TYPE,
} from "./campaign-missions"

export const CAMPAIGN_IDS: CampaignId[] = ["1.0", "2.0", "3.0"]

// class/branch aliases -> canonical type id. Campaign 1.0 uses lt/mt/ht/td/spg;
// 2.0 uses union/bloc/alliance/coalition; 3.0 uses vanguard/ambush/assistance.
// Validation against the actual campaign's types happens after tank resolution.
const TYPE_ALIASES: Record<string, string> = {
  lt: "lt", l: "lt", light: "lt", lighttank: "lt", lighttanks: "lt", lights: "lt",
  mt: "mt", m: "mt", medium: "mt", mediumtank: "mt", mediumtanks: "mt", med: "mt", meds: "mt", mediums: "mt",
  ht: "ht", h: "ht", heavy: "ht", heavytank: "ht", heavytanks: "ht", heavies: "ht",
  td: "td", tankdestroyer: "td", tankdestroyers: "td", at: "td", antitank: "td", tds: "td",
  spg: "spg", spgs: "spg", arty: "spg", artillery: "spg", art: "spg", selfpropelledgun: "spg",
  union: "union", bloc: "bloc", block: "bloc", alliance: "alliance", coalition: "coalition",
  vanguard: "vanguard", ambush: "ambush", assistance: "assistance", assist: "assistance",
}

const alnum = (s: string): string => String(s ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "")

export type TankResolution = { campaignId: CampaignId; tankId: string; tankName: string }

let _tankIndex: Map<string, TankResolution> | null = null
function tankIndex(): Map<string, TankResolution> {
  if (_tankIndex) return _tankIndex
  const idx = new Map<string, TankResolution>()
  for (const campaignId of CAMPAIGN_IDS) {
    for (const t of getCampaignConfig(campaignId).tanks) {
      const res: TankResolution = { campaignId, tankId: t.id, tankName: t.name }
      const keys = new Set<string>([alnum(t.id), alnum(t.name)])
      // "obj 260" / "obj260" abbreviation for "object ..."
      for (const k of [...keys]) if (k.startsWith("object")) keys.add(k.replace(/^object/, "obj"))
      for (const k of keys) if (k) idx.set(k, res)
    }
  }
  _tankIndex = idx
  return idx
}

/** Resolve a free-text reward-tank name to its campaign + tankId. */
export function resolveCampaignTank(text: string): TankResolution | null {
  const key = alnum(text)
  if (!key) return null
  const idx = tankIndex()
  if (idx.has(key)) return idx.get(key) ?? null
  if (key.startsWith("obj") && !key.startsWith("object")) {
    const alt = idx.get(key.replace(/^obj/, "object"))
    if (alt) return alt
  }
  return null
}

/** Resolve a class/branch token to a valid mission-type id for the given campaign. */
export function resolveMissionType(campaignId: CampaignId, text: string): string | null {
  const key = alnum(text)
  if (!key) return null
  const aliased = TYPE_ALIASES[key] ?? key
  return getCampaignConfig(campaignId).missionTypes.some((t) => t.id === aliased) ? aliased : null
}

/** Every reward-tank display name across all campaigns (for error messages). */
export function allRewardTankNames(): string {
  return CAMPAIGN_IDS.flatMap((c) => getCampaignConfig(c).tanks.map((t) => t.name)).join(", ")
}

export type FlatMission = { tank: string; class?: string; type?: string; mission: number | string }

export type CampaignParse =
  | { ok: true; campaignId: CampaignId; selectedMissions: SelectedMissions; interpretation: string }
  | { ok: false; error: string }

const ALL_RE = /^(all|\*|every|everything|select\s*all)$/i

/**
 * Normalize a flat list of { tank, class, mission } items into a campaignId +
 * nested SelectedMissions. The campaign is INFERRED from the reward tank; mixing
 * campaigns in one request is an error. mission may be 1-15 or "all" (= the whole
 * branch, which the pricing module then discounts as a full type/-tank).
 */
export function normalizeCampaignMissions(items: unknown): CampaignParse {
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: "Provide the reward tank and at least one mission as { tank, class, mission }." }
  }

  let campaignId: CampaignId | null = null
  let campaignTankName = ""
  const selected: SelectedMissions = {}

  for (const raw of items as FlatMission[]) {
    const tankRes = resolveCampaignTank(String(raw?.tank ?? ""))
    if (!tankRes) {
      return { ok: false, error: `Unrecognized campaign reward tank "${raw?.tank ?? ""}". Known reward tanks: ${allRewardTankNames()}.` }
    }
    if (campaignId && tankRes.campaignId !== campaignId) {
      return { ok: false, error: `Mixed campaigns: "${tankRes.tankName}" is Campaign ${tankRes.campaignId} but "${campaignTankName}" is Campaign ${campaignId}. One campaign per quote.` }
    }
    campaignId = tankRes.campaignId
    campaignTankName = tankRes.tankName

    const classText = String(raw?.class ?? raw?.type ?? "")
    const typeId = resolveMissionType(campaignId, classText)
    if (!typeId) {
      const valid = getCampaignConfig(campaignId).missionTypes.map((t) => t.id).join(" / ")
      return { ok: false, error: `"${classText}" is not a valid mission branch for Campaign ${campaignId} (${tankRes.tankName}). Valid branches: ${valid}.` }
    }

    const missionRaw = raw?.mission
    let nums: number[]
    if (typeof missionRaw === "string" && ALL_RE.test(missionRaw.trim())) {
      nums = Array.from({ length: MISSIONS_PER_TYPE }, (_, k) => k + 1)
    } else {
      const n = Number(missionRaw)
      if (!Number.isInteger(n) || n < 1 || n > MISSIONS_PER_TYPE) {
        return { ok: false, error: `Mission number "${String(missionRaw)}" is out of range — use 1-${MISSIONS_PER_TYPE} or "all".` }
      }
      nums = [n]
    }

    const tankBucket = selected[tankRes.tankId] ?? (selected[tankRes.tankId] = {})
    const typeBucket = tankBucket[typeId] ?? (tankBucket[typeId] = [])
    for (const n of nums) if (!typeBucket.includes(n)) typeBucket.push(n)
  }

  for (const tank of Object.values(selected)) {
    for (const arr of Object.values(tank)) arr.sort((a, b) => a - b)
  }

  return { ok: true, campaignId: campaignId as CampaignId, selectedMissions: selected, interpretation: buildInterpretation(campaignId as CampaignId, selected) }
}

/** Human-readable restatement of the parsed request, e.g. "Campaign 1.0 — Object 260: HT-15, HT-13, MT-9". */
export function buildInterpretation(campaignId: CampaignId, sel: SelectedMissions): string {
  const cfg = getCampaignConfig(campaignId)
  const tankName = (id: string) => cfg.tanks.find((t) => t.id === id)?.name ?? id
  const typeName = (id: string) => cfg.missionTypes.find((t) => t.id === id)?.name ?? id.toUpperCase()
  const parts: string[] = []
  for (const [tankId, types] of Object.entries(sel)) {
    const segs: string[] = []
    for (const [typeId, nums] of Object.entries(types)) {
      segs.push(
        nums.length === MISSIONS_PER_TYPE
          ? `${typeName(typeId)} all 15`
          : nums.map((n) => `${typeName(typeId)}-${n}`).join(", "),
      )
    }
    parts.push(`${tankName(tankId)}: ${segs.join(", ")}`)
  }
  return `Campaign ${campaignId} — ${parts.join("; ")}`
}
