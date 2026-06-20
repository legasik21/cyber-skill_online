// Typed service catalog — the SINGLE SOURCE OF TRUTH that maps each WoT service to
// its required parameters and its deterministic pricing function.
//
// The AI assistant's tools use this catalog exclusively:
//   - get_service_pricing(serviceId) -> returns the param schema (what to ask the customer)
//   - calculate_price(serviceId, params) -> calls the shared pricing fn (NEVER the LLM)
//
// Every priceFn here is the exact same function the corresponding service page imports,
// so the bot can never quote a price that diverges from the website.

import { priceCreditFarm, CREDIT_PRICING, BONDS_WN8_MODIFIERS } from "./credit-farm"
import { priceReferralProgram, REFERRAL_PRICE } from "./referral-program"
import { priceBattlePass, MAX_LEVELS } from "./battle-pass"
import { priceAceTanker, TIER_PRICING } from "./ace-tanker"
import { priceTierLeveling, SILVER_OPTIONS as TIER_SILVER_OPTIONS } from "./tier-leveling"
import {
  priceCampaignMissions,
  type CampaignId,
  type SelectedMissions,
  getCampaignConfig,
} from "./campaign-missions"
import { priceWn8Boost, WN8_PRICING, WINRATE_PRICING, DAMAGE_PRICING, MIN_BATTLES } from "./wn8-boost"
import { priceOnslaught, MIN_POINTS, MAX_POINTS } from "./onslaught"
import { priceMarkOfExcellence, SPECIAL_VEHICLES } from "./mark-of-excellence"
import { priceExpFarm, EXP_PRICING } from "./exp-farm"

export type ServiceId =
  | "credit-farm"
  | "referral-program"
  | "battle-pass"
  | "ace-tanker"
  | "tier-leveling"
  | "campaign-missions"
  | "wn8-boost"
  | "onslaught"
  | "mark-of-excellence"
  | "exp-farm"
  | "arcade-cabinet"

export type PricingType = "calculator" | "flat" | "composite" | "deferred"

export type ServiceParam = {
  name: string
  type: "enum" | "number" | "boolean" | "string" | "object"
  required: boolean
  /** Allowed values for enum params. */
  options?: string[]
  /** Inclusive bounds for number params. */
  min?: number
  max?: number
  /** Human-facing explanation the assistant uses when asking for this value. */
  description: string
}

export type ServiceDescriptor = {
  id: ServiceId
  name: string
  route: string
  pricingType: PricingType
  /** Advertised entry price (USD), where the page shows one. Informational only. */
  fromPriceUSD?: number
  /** The required + optional params the assistant must resolve before pricing. */
  params: ServiceParam[]
  /** Operator notes / caveats the assistant should respect. */
  note?: string
}

// ---------------------------------------------------------------------------
// Catalog metadata + parameter schemas
// ---------------------------------------------------------------------------

export const SERVICE_CATALOG: Record<ServiceId, ServiceDescriptor> = {
  "credit-farm": {
    id: "credit-farm",
    name: "Credit & Bonds Farming",
    route: "/services/credit-farm",
    pricingType: "calculator",
    fromPriceUSD: 4.5,
    params: [
      { name: "serviceType", type: "enum", required: true, options: ["credits", "bonds"], description: "Credits or bonds — selects an entirely different pricing branch." },
      { name: "tier", type: "enum", required: true, options: [...Object.keys(CREDIT_PRICING), ...Object.keys(BONDS_WN8_MODIFIERS)], description: "The WN8 our driver plays at on YOUR account while farming — this sets the price and how your account's stats will look afterwards. It is NOT your current WN8. Credits: under-2500 / over-2500. Bonds: 2000 / 2500-3000 / 3000-4000 / 4000+." },
      { name: "amount", type: "number", required: true, min: 1, description: "Credits: millions (min 1M). Bonds: number of bonds (min 100, priced per whole 100)." },
      { name: "cannotUseSilverBoosters", type: "boolean", required: false, description: "Credits only: if we cannot use your own Silver Boosters the price is +30%." },
    ],
  },
  "referral-program": {
    id: "referral-program",
    name: "Referral Program",
    route: "/services/referral-program",
    pricingType: "flat",
    fromPriceUSD: REFERRAL_PRICE,
    params: [],
    note: `Flat price: $${REFERRAL_PRICE}. No inputs affect the total.`,
  },
  "battle-pass": {
    id: "battle-pass",
    name: "Battle Pass",
    route: "/services/battle-pass",
    pricingType: "calculator",
    params: [
      { name: "currentLevel", type: "number", required: true, min: 1, max: MAX_LEVELS, description: "Current Battle Pass level (1-50)." },
      { name: "targetLevel", type: "number", required: true, min: 1, max: MAX_LEVELS, description: "Target Battle Pass level (1-50, must be >= current)." },
    ],
    note: "Priced per level (inclusive of both ends). Volume discount: 25+ levels 10%, 50 levels 15%.",
  },
  "ace-tanker": {
    id: "ace-tanker",
    name: "Ace Tanker (Mastery)",
    route: "/services/ace-tanker",
    pricingType: "calculator",
    fromPriceUSD: 15,
    params: [
      { name: "tankTier", type: "enum", required: true, options: Object.keys(TIER_PRICING), description: "Tank tier band: lower (Tier I-VII), 8 (Tier VIII), 9_10 (Tier IX-X), 11 (Tier XI)." },
      { name: "isSpg", type: "boolean", required: false, description: "Is the vehicle an SPG (artillery)? +100% (doubles the base)." },
      { name: "getReplays", type: "boolean", required: false, description: "Receive the battle replay file? +20% of the SPG-adjusted base." },
    ],
  },
  "tier-leveling": {
    id: "tier-leveling",
    name: "Tier Leveling",
    route: "/services/tier-leveling",
    pricingType: "calculator",
    params: [
      { name: "fromTier", type: "number", required: true, min: 1, max: 10, description: "Starting tier (1-10). The from-tier itself is not charged." },
      { name: "toTier", type: "number", required: true, min: 2, max: 11, description: "Target tier (2-11, must be > from)." },
      { name: "isSPG", type: "boolean", required: false, description: "SPG (artillery)? +30% of base." },
      { name: "dontUseBoosters", type: "boolean", required: false, description: "Don't use your XP Boosters? +30% of base." },
      { name: "selectedSilverIds", type: "enum", required: false, options: TIER_SILVER_OPTIONS.map((o) => o.id), description: "Optional silver-farming add-on (none / 10m / 20m)." },
    ],
    note: "SPG and no-boosters surcharges are each +30% of the raw base (additive, not compounded). Silver add-on is flat.",
  },
  "campaign-missions": {
    id: "campaign-missions",
    name: "Campaign Missions",
    route: "/services/campaign-missions",
    pricingType: "composite",
    fromPriceUSD: 5,
    params: [
      { name: "missions", type: "object", required: true, description: 'Use the price_campaign tool (NOT calculate_price). Pass a flat list of { tank, class, mission }, e.g. [{ "tank": "Object 260", "class": "ht", "mission": 15 }, { "tank": "Object 260", "class": "mt", "mission": 9 }]. The campaign (1.0/2.0/3.0) is inferred from the reward tank. class: 1.0 lt/mt/ht/td/spg, 2.0 union/bloc/alliance/coalition, 3.0 vanguard/ambush/assistance. mission is 1-15 or "all".' },
    ],
    note: "Use the price_campaign tool. Reward tanks → campaign: 1.0 Stug IV / T-28 Concept / T-55A / Object 260; 2.0 Excalibur / Chimera / Object 279 (e); 3.0 Windhund / Dravec / Black Rock. Per-mission pricing; all 15 of one branch = -15%; all branches of a tank = -25% (mutually exclusive). Honors / 'second task' (+50%/mission) is confirmed by a manager, not the calculator.",
  },
  "wn8-boost": {
    id: "wn8-boost",
    name: "WN8 / Winrate / Damage Boost",
    route: "/services/wn8-boost",
    pricingType: "calculator",
    params: [
      { name: "serviceType", type: "enum", required: true, options: ["wn8", "winrate", "damage"], description: "Which boost: wn8, winrate, or damage. Selects the pricing table." },
      { name: "tier", type: "enum", required: true, options: [...Object.keys(WN8_PRICING), ...Object.keys(WINRATE_PRICING), ...Object.keys(DAMAGE_PRICING)], description: "The target performance band our driver plays at on YOUR account to deliver this boost — the result we produce, not your current stats. wn8: 2500-3000/3000-4000/4000+. winrate: 60%/65%/70%. damage: 4000+/4500+/5000+." },
      { name: "numberOfBattles", type: "number", required: true, min: MIN_BATTLES, description: `Number of battles (minimum ${MIN_BATTLES}).` },
      { name: "playSPG", type: "boolean", required: false, description: "Play on SPG? +100%. Only applies to wn8 tiers 2500-3000 & 3000-4000 and winrate 60%." },
      { name: "getReplays", type: "boolean", required: false, description: "Get the replays? +10% of the post-discount total." },
    ],
    note: "Volume discount: 50-99 battles 15%, 100+ battles 20%.",
  },
  onslaught: {
    id: "onslaught",
    name: "Onslaught Rating",
    route: "/services/onslaught",
    pricingType: "calculator",
    fromPriceUSD: 3,
    params: [
      { name: "currentPoints", type: "number", required: true, min: MIN_POINTS, max: MAX_POINTS - 100, description: "Current rating points (0-4400)." },
      { name: "targetPoints", type: "number", required: true, min: 100, max: MAX_POINTS, description: "Target rating points (100-4500, must be > current)." },
      { name: "playWithBooster", type: "boolean", required: false, description: "Play in a platoon / with a booster? +40% of the base boost price." },
      { name: "silverOption", type: "enum", required: false, options: ["none", "10m", "20m"], description: "Optional silver add-on (none / 10M credits / 20M credits)." },
      { name: "completeMissions", type: "boolean", required: false, description: "Complete the 30 event missions? +$40 flat." },
    ],
    note: "Tiered per-100-points pricing; higher rating bands cost more per 100 points.",
  },
  "mark-of-excellence": {
    id: "mark-of-excellence",
    name: "Mark of Excellence (MoE)",
    route: "/services/mark-of-excellence",
    pricingType: "calculator",
    fromPriceUSD: 0.3,
    params: [
      { name: "fromProgress", type: "number", required: true, min: 1, max: 94, description: "Current MoE percentage (1-94)." },
      { name: "toProgress", type: "number", required: true, min: 2, max: 95, description: "Target MoE percentage (2-95, must be > from)." },
      { name: "difficulty", type: "enum", required: false, options: ["easy", "hard", "spg"], description: "Tank difficulty: easy (+0%), hard/all Tier X-XI (+30%), spg (+50%). Ignored if a special vehicle is chosen." },
      { name: "specialVehicle", type: "enum", required: false, options: SPECIAL_VEHICLES.map((v) => v.id), description: "Optional special/reward vehicle. Its fee REPLACES the difficulty multiplier." },
      { name: "silverOption", type: "enum", required: false, options: ["none", "10m", "20m"], description: "Optional silver add-on (flat, added after the multiplier)." },
    ],
    note: "Banded per-point pricing; higher MoE % costs far more per point. Special vehicle fee takes precedence over difficulty.",
  },
  "exp-farm": {
    id: "exp-farm",
    name: "EXP Farming",
    route: "/services/exp-farm",
    pricingType: "calculator",
    fromPriceUSD: 3,
    params: [
      { name: "expAmount", type: "number", required: true, min: 10, description: "XP amount in thousands (e.g. 50 = 50,000 XP; minimum 10)." },
      { name: "wn8Tier", type: "enum", required: true, options: Object.keys(EXP_PRICING), description: "The WN8 our driver plays at on YOUR account while farming XP — this sets the per-10k rate and your account's stats footprint. It is NOT your current WN8: under-2500 / over-2500." },
      { name: "cannotUseXPBoosters", type: "boolean", required: false, description: "Don't use your XP Boosters? +30% on the post-discount amount." },
    ],
    note: "Priced per 10k XP. Volume discount: 100k+ 10%, 250k+ 15%, 500k+ 20%.",
  },
  "arcade-cabinet": {
    id: "arcade-cabinet",
    name: "Arcade Cabinet (Event)",
    route: "/services/arcade-cabinet",
    pricingType: "deferred",
    params: [],
    note: "Event landing page with no calculator of its own. Pricing is deferred to credit-farm ($4.5/M credits, $7/100 bonds) and exp-farm (from $3). AWAITING OWNER DECISION on whether it should have its own calculator.",
  },
}

// ---------------------------------------------------------------------------
// Deterministic price dispatch
// ---------------------------------------------------------------------------

export type PriceQuote = {
  serviceId: ServiceId
  currency: "USD"
  total: number
  breakdown: Record<string, number>
}

/** Catalog lookup used by the get_service_pricing tool. */
export function getServiceDescriptor(serviceId: ServiceId): ServiceDescriptor {
  const d = SERVICE_CATALOG[serviceId]
  if (!d) throw new Error(`Unknown service: ${serviceId}`)
  return d
}

/**
 * The single deterministic entry point for the calculate_price tool.
 * Dispatches to the same pure pricing function the website page uses.
 * Throws on unknown service or a service that has no calculator (flat/deferred
 * services are handled explicitly).
 */
export function calculatePrice(serviceId: ServiceId, params: Record<string, unknown>): PriceQuote {
  const usd = (total: number, breakdown: Record<string, number>): PriceQuote => ({
    serviceId,
    currency: "USD",
    total,
    breakdown,
  })

  switch (serviceId) {
    case "credit-farm": {
      const r = priceCreditFarm({
        serviceType: params.serviceType as "credits" | "bonds",
        tier: String(params.tier),
        amount: Number(params.amount),
        cannotUseSilverBoosters: Boolean(params.cannotUseSilverBoosters),
      })
      return usd(r.total, { base: r.base, discountPercent: r.discountPercent, silverCharge: r.silverCharge })
    }
    case "referral-program":
      return usd(priceReferralProgram().total, {})
    case "battle-pass": {
      const r = priceBattlePass({ currentLevel: Number(params.currentLevel), targetLevel: Number(params.targetLevel) })
      return usd(r.total, { levelsToBoost: r.levelsToBoost, basePrice: r.basePrice, discount: r.discount })
    }
    case "ace-tanker": {
      const r = priceAceTanker({
        tankTier: String(params.tankTier),
        isSpg: Boolean(params.isSpg),
        getReplays: Boolean(params.getReplays),
      })
      return usd(r.total, { base: r.base, spgExtra: r.spgExtra, replaysExtra: r.replaysExtra })
    }
    case "tier-leveling": {
      const r = priceTierLeveling({
        fromTier: Number(params.fromTier),
        toTier: Number(params.toTier),
        isSPG: Boolean(params.isSPG),
        dontUseBoosters: Boolean(params.dontUseBoosters),
        selectedSilverIds: params.selectedSilverIds ? String(params.selectedSilverIds) : "none",
      })
      return usd(r.total, { base: r.base, noBoostersCharge: r.noBoostersCharge, spgCharge: r.spgCharge, silverCost: r.silverCost })
    }
    case "campaign-missions": {
      const r = priceCampaignMissions(params.campaignId as CampaignId, params.selectedMissions as SelectedMissions)
      return usd(r.total, { original: r.original, discount: r.discount })
    }
    case "wn8-boost": {
      const r = priceWn8Boost({
        serviceType: params.serviceType as "wn8" | "winrate" | "damage",
        tier: String(params.tier),
        numberOfBattles: Number(params.numberOfBattles),
        playSPG: Boolean(params.playSPG),
        getReplays: Boolean(params.getReplays),
      })
      return usd(r.total, { base: r.base, discountPercent: r.discountPercent })
    }
    case "onslaught": {
      const r = priceOnslaught({
        currentPoints: Number(params.currentPoints),
        targetPoints: Number(params.targetPoints),
        playWithBooster: Boolean(params.playWithBooster),
        silverOption: params.silverOption ? String(params.silverOption) : "none",
        completeMissions: Boolean(params.completeMissions),
      })
      return usd(r.total, { base: r.base, boosterCharge: r.boosterCharge, silverCharge: r.silverCharge, missionsCharge: r.missionsCharge })
    }
    case "mark-of-excellence": {
      const r = priceMarkOfExcellence({
        fromProgress: Number(params.fromProgress),
        toProgress: Number(params.toProgress),
        difficulty: params.difficulty ? String(params.difficulty) : "",
        specialVehicle: params.specialVehicle ? String(params.specialVehicle) : "",
        silverOption: params.silverOption ? String(params.silverOption) : "none",
      })
      return usd(r.total, { base: r.base })
    }
    case "exp-farm": {
      const r = priceExpFarm({
        expAmount: Number(params.expAmount),
        wn8Tier: String(params.wn8Tier),
        cannotUseXPBoosters: Boolean(params.cannotUseXPBoosters),
      })
      return usd(r.total, { base: r.base, discountPercent: r.discountPercent, xpBoostersCharge: r.xpBoostersCharge })
    }
    case "arcade-cabinet":
      throw new Error(
        "arcade-cabinet has no own calculator — defer pricing to credit-farm and exp-farm (pending owner decision).",
      )
    default: {
      const _exhaustive: never = serviceId
      throw new Error(`Unhandled service: ${String(_exhaustive)}`)
    }
  }
}

export { getCampaignConfig }
