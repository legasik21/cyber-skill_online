// Barrel for the shared pricing engine. The catalog is the primary entry point
// for the AI assistant (get_service_pricing / calculate_price). Service pages
// import their own module directly (e.g. "@/lib/pricing/credit-farm") to get the
// constants they render, so this barrel intentionally avoids `export *` (which
// would collide on shared names like SILVER_OPTIONS / WN8_TIER_LABELS).

export * from "./catalog"

export { priceCreditFarm, type CreditFarmInput, type CreditFarmResult } from "./credit-farm"
export { priceReferralProgram, REFERRAL_PRICE } from "./referral-program"
export { priceBattlePass, type BattlePassInput } from "./battle-pass"
export { priceAceTanker, type AceTankerInput } from "./ace-tanker"
export { priceTierLeveling, type TierLevelingInput, type TierLevelingPrice } from "./tier-leveling"
export {
  priceCampaignMissions,
  type CampaignId,
  type SelectedMissions,
} from "./campaign-missions"
export { priceWn8Boost, type Wn8BoostInput } from "./wn8-boost"
export { priceOnslaught, calculatePointsPrice, type OnslaughtInput } from "./onslaught"
export { priceMarkOfExcellence, calculateBasePrice, type MoeInput } from "./mark-of-excellence"
export { priceExpFarm, type ExpFarmInput } from "./exp-farm"
