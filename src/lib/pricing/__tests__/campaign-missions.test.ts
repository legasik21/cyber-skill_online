import { describe, it, expect } from "vitest";
import {
  priceCampaignMissions,
  getCampaignConfig,
  type CampaignId,
} from "../campaign-missions";
import { normalizeCampaignMissions, type FlatMission } from "../campaign-input";
import { calculatePrice } from "../catalog";

const full = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

describe("priceCampaignMissions parity", () => {
  it("1.0 stug-iv lt [1,8,15] => 11", () => {
    expect(
      priceCampaignMissions("1.0", { "stug-iv": { lt: [1, 8, 15] } }).total
    ).toBeCloseTo(11, 2);
  });

  it("1.0 stug-iv lt full => 25", () => {
    expect(
      priceCampaignMissions("1.0", { "stug-iv": { lt: full } }).total
    ).toBeCloseTo(25, 2);
  });

  it("1.0 object-260 td [8] => 12", () => {
    expect(
      priceCampaignMissions("1.0", { "object-260": { td: [8] } }).total
    ).toBeCloseTo(12, 2);
  });

  it("1.0 stug-iv full tank => 110", () => {
    expect(
      priceCampaignMissions("1.0", {
        "stug-iv": { lt: full, mt: full, ht: full, td: full, spg: full },
      }).total
    ).toBeCloseTo(110, 2);
  });

  it("2.0 excalibur union [1,2,3] => 12", () => {
    expect(
      priceCampaignMissions("2.0", { excalibur: { union: [1, 2, 3] } }).total
    ).toBeCloseTo(12, 2);
  });

  it("2.0 chimera bloc full => 95", () => {
    expect(
      priceCampaignMissions("2.0", { chimera: { bloc: full } }).total
    ).toBeCloseTo(95, 2);
  });

  it("2.0 excalibur coalition [1..5] => 16", () => {
    expect(
      priceCampaignMissions("2.0", { excalibur: { coalition: [1, 2, 3, 4, 5] } })
        .total
    ).toBeCloseTo(16, 2);
  });

  it("2.0 excalibur full tank => 206", () => {
    expect(
      priceCampaignMissions("2.0", {
        excalibur: { union: full, bloc: full, alliance: full, coalition: full },
      }).total
    ).toBeCloseTo(206, 2);
  });

  it("3.0 black-rock vanguard [1] => 12", () => {
    expect(
      priceCampaignMissions("3.0", { "black-rock": { vanguard: [1] } }).total
    ).toBeCloseTo(12, 2);
  });

  it("3.0 windhund vanguard [1,2,3] => 12", () => {
    expect(
      priceCampaignMissions("3.0", { windhund: { vanguard: [1, 2, 3] } }).total
    ).toBeCloseTo(12, 2);
  });

  it("3.0 black-rock vanguard full => 146", () => {
    expect(
      priceCampaignMissions("3.0", { "black-rock": { vanguard: full } }).total
    ).toBeCloseTo(146, 2);
  });

  it("3.0 windhund full tank => 158", () => {
    expect(
      priceCampaignMissions("3.0", {
        windhund: { vanguard: full, ambush: full, assistance: full },
      }).total
    ).toBeCloseTo(158, 2);
  });
});

// ---------------------------------------------------------------------------
// PARITY: the flat parse path (normalizeCampaignMissions -> priceCampaignMissions)
// must produce IDENTICAL pricing to the nested priceCampaignMissions, and the
// catalog price helper (calculatePrice("campaign-missions", ...)) must agree on the
// total. Covers all three campaigns + an explicit -15% (full-type) and -25%
// (full-tank) discount case. Selections are randomized with a deterministic PRNG.
// ---------------------------------------------------------------------------
describe("campaign-missions parity — flat parse === nested === catalog helper", () => {
  // deterministic PRNG (LCG) so failures are reproducible
  let seed = 987654321;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rnd() * arr.length)];
  const ALL = Array.from({ length: 15 }, (_, k) => k + 1);
  const campaigns: CampaignId[] = ["1.0", "2.0", "3.0"];

  // The flat path keys missions by the reward-tank DISPLAY name + class id, so it
  // exercises the resolver. Build a flat list from a nested selection.
  const toFlat = (
    campaignId: CampaignId,
    sel: Record<string, Record<string, number[]>>,
  ): FlatMission[] => {
    const cfg = getCampaignConfig(campaignId);
    const items: FlatMission[] = [];
    for (const [tankId, types] of Object.entries(sel)) {
      const tankName = cfg.tanks.find((t) => t.id === tankId)?.name ?? tankId;
      for (const [typeId, nums] of Object.entries(types)) {
        for (const n of nums) items.push({ tank: tankName, class: typeId, mission: n });
      }
    }
    return items;
  };

  const assertParity = (
    label: string,
    campaignId: CampaignId,
    sel: Record<string, Record<string, number[]>>,
    expectDiscount: "none" | "some",
  ) => {
    const nested = priceCampaignMissions(campaignId, sel);

    const parsed = normalizeCampaignMissions(toFlat(campaignId, sel));
    expect(parsed.ok, `${label}: flat parse should succeed`).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.campaignId).toBe(campaignId);
    const flat = priceCampaignMissions(parsed.campaignId, parsed.selectedMissions);

    expect(flat, `${label}: flat path == nested`).toEqual(nested);

    // catalog price helper agrees on the total
    const viaCatalog = calculatePrice("campaign-missions", {
      campaignId,
      selectedMissions: sel,
    });
    expect(viaCatalog.total, `${label}: catalog helper total`).toBe(nested.total);

    if (expectDiscount === "none") expect(nested.discount).toBe(0);
    else expect(nested.discount, `${label}: discount applied`).toBeGreaterThan(0);
  };

  it("randomized partial selections across all three campaigns (no discount)", () => {
    for (const campaignId of campaigns) {
      const cfg = getCampaignConfig(campaignId);
      for (let i = 0; i < 4; i++) {
        const tank = pick(cfg.tanks).id;
        const type = pick(cfg.missionTypes).id;
        // 2-3 distinct mission numbers (never a full 15 -> stays partial)
        const a = 1 + Math.floor(rnd() * 6);
        const b = 8 + Math.floor(rnd() * 6);
        const sel = { [tank]: { [type]: [a, b] } };
        assertParity(`${campaignId} partial #${i}`, campaignId, sel, "none");
      }
    }
  });

  it("full-type selection -> -15% parity (all three campaigns)", () => {
    for (const campaignId of campaigns) {
      const cfg = getCampaignConfig(campaignId);
      const tank = pick(cfg.tanks).id;
      const type = pick(cfg.missionTypes).id;
      const sel = { [tank]: { [type]: [...ALL] } };
      assertParity(`${campaignId} full-type`, campaignId, sel, "some");
    }
  });

  it("full-tank selection -> -25% parity (all three campaigns)", () => {
    for (const campaignId of campaigns) {
      const cfg = getCampaignConfig(campaignId);
      const tank = pick(cfg.tanks).id;
      const sel: Record<string, Record<string, number[]>> = { [tank]: {} };
      for (const t of cfg.missionTypes) sel[tank][t.id] = [...ALL];
      assertParity(`${campaignId} full-tank`, campaignId, sel, "some");
    }
  });
});
