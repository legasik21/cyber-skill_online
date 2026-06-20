// Pure, dependency-free pricing module for Campaign Missions (1.0, 2.0, 3.0).
// Math is a 1:1 port of the per-page calculators. No React, no imports.

export type CampaignId = "1.0" | "2.0" | "3.0";

export type SelectedMissions = {
  [tankId: string]: {
    [typeId: string]: number[];
  };
};

export const MISSIONS_PER_TYPE = 15 as const;

type TankDef = { id: string; name: string };
type TypeDef = { id: string; name: string };
type PriceTable = Record<string, Record<string, (n: number) => number>>;

// ---------------------------------------------------------------------------
// Campaign 1.0
// ---------------------------------------------------------------------------
export const TANKS_1_0: TankDef[] = [
  { id: "stug-iv", name: "Stug IV" },
  { id: "t28-concept", name: "T-28 Concept" },
  { id: "t55a", name: "T 55A" },
  { id: "object-260", name: "Object 260" },
];

export const MISSION_TYPES_1_0: TypeDef[] = [
  { id: "lt", name: "LT" },
  { id: "mt", name: "MT" },
  { id: "ht", name: "HT" },
  { id: "td", name: "TD" },
  { id: "spg", name: "SPG" },
];

export const MISSION_PRICES_1_0: PriceTable = {
  "stug-iv": {
    lt: (n) => (n <= 7 ? 1 : n <= 14 ? 2 : 8),
    mt: (n) => (n <= 8 ? 1 : n <= 14 ? 2 : 9),
    ht: (n) => (n <= 6 ? 1 : n <= 14 ? 2 : 6),
    td: (n) => (n <= 7 ? 1 : n <= 14 ? 2 : 7),
    spg: (n) => (n <= 5 ? 1 : n <= 14 ? 2 : 9),
  },
  "t28-concept": {
    lt: (n) =>
      n <= 7 ? 2 : n === 8 ? 4 : n <= 10 ? 2 : n === 11 ? 3 : n <= 14 ? 4 : 10,
    mt: (n) =>
      n <= 5
        ? 2
        : n <= 7
        ? 3
        : n === 8
        ? 4
        : n <= 11
        ? 3
        : n === 12
        ? 8
        : n === 13
        ? 3
        : n === 14
        ? 6
        : 10,
    ht: (n) =>
      n <= 6
        ? 2
        : n === 7
        ? 4
        : n === 8
        ? 2
        : n <= 11
        ? 3
        : n === 12
        ? 5
        : n <= 14
        ? 4
        : 9,
    td: (n) =>
      n <= 2
        ? 2
        : n === 3
        ? 1
        : n <= 5
        ? 2
        : n <= 7
        ? 3
        : n === 8
        ? 4
        : n <= 13
        ? 3
        : n === 14
        ? 4
        : 8,
    spg: (n) =>
      n <= 3
        ? 2
        : n === 4
        ? 3
        : n === 5
        ? 2
        : n <= 7
        ? 4
        : n <= 9
        ? 3
        : n <= 12
        ? 4
        : n <= 14
        ? 5
        : 12,
  },
  t55a: {
    lt: (n) =>
      n <= 3
        ? 2
        : n <= 5
        ? 4
        : n === 6
        ? 8
        : n === 7
        ? 10
        : n === 8
        ? 8
        : n === 9
        ? 5
        : n === 10
        ? 4
        : n <= 12
        ? 5
        : n === 13
        ? 4
        : n === 14
        ? 7
        : 18,
    mt: (n) =>
      n === 1
        ? 2
        : n <= 4
        ? 3
        : n === 5
        ? 4
        : n === 6
        ? 5
        : n === 7
        ? 8
        : n === 8
        ? 4
        : n === 9
        ? 7
        : n === 10
        ? 4
        : n === 11
        ? 6
        : n === 12
        ? 7
        : n === 13
        ? 5
        : n === 14
        ? 4
        : 16,
    ht: (n) =>
      n <= 2
        ? 2
        : n === 3
        ? 5
        : n === 4
        ? 4
        : n === 5
        ? 3
        : n <= 7
        ? 8
        : n === 8
        ? 4
        : n === 9
        ? 2
        : n === 10
        ? 5
        : n === 11
        ? 4
        : n === 12
        ? 10
        : n === 13
        ? 4
        : n === 14
        ? 6
        : 16,
    td: (n) =>
      n <= 2
        ? 2
        : n === 3
        ? 3
        : n <= 5
        ? 4
        : n === 6
        ? 5
        : n === 7
        ? 6
        : n === 8
        ? 8
        : n === 9
        ? 4
        : n <= 13
        ? 5
        : n === 14
        ? 6
        : 16,
    spg: (n) =>
      n === 1
        ? 3
        : n <= 4
        ? 6
        : n === 5
        ? 10
        : n === 6
        ? 8
        : n === 7
        ? 6
        : n === 8
        ? 3
        : n <= 10
        ? 4
        : n === 11
        ? 9
        : n === 12
        ? 10
        : n === 13
        ? 5
        : n === 14
        ? 6
        : 30,
  },
  "object-260": {
    lt: (n) =>
      n === 1
        ? 4
        : n === 2
        ? 8
        : n <= 4
        ? 6
        : n === 5
        ? 5
        : n === 6
        ? 6
        : n === 7
        ? 16
        : n === 8
        ? 10
        : n === 9
        ? 8
        : n === 10
        ? 7
        : n === 11
        ? 8
        : n === 12
        ? 9
        : n === 13
        ? 7
        : n === 14
        ? 8
        : 20,
    mt: (n) =>
      n === 1
        ? 2
        : n === 2
        ? 8
        : n === 3
        ? 6
        : n === 4
        ? 5
        : n <= 6
        ? 6
        : n === 7
        ? 7
        : n === 8
        ? 8
        : n === 9
        ? 6
        : n === 10
        ? 4
        : n === 11
        ? 8
        : n === 12
        ? 10
        : n <= 14
        ? 6
        : 20,
    ht: (n) =>
      n === 1
        ? 4
        : n === 2
        ? 5
        : n === 3
        ? 7
        : n === 4
        ? 6
        : n === 5
        ? 4
        : n === 6
        ? 6
        : n === 7
        ? 8
        : n === 8
        ? 5
        : n === 9
        ? 6
        : n === 10
        ? 5
        : n === 11
        ? 6
        : n === 12
        ? 14
        : n <= 14
        ? 6
        : 22,
    td: (n) =>
      n === 1
        ? 2
        : n === 2
        ? 8
        : n === 3
        ? 4
        : n === 4
        ? 8
        : n <= 6
        ? 6
        : n === 7
        ? 9
        : n === 8
        ? 12
        : n === 9
        ? 6
        : n === 10
        ? 10
        : n <= 14
        ? 6
        : 25,
    spg: (n) =>
      n === 1
        ? 2
        : n <= 4
        ? 4
        : n === 5
        ? 8
        : n <= 7
        ? 6
        : n === 8
        ? 8
        : n === 9
        ? 4
        : n === 10
        ? 6
        : n === 11
        ? 10
        : n === 12
        ? 12
        : n <= 14
        ? 6
        : 40,
  },
};

// ---------------------------------------------------------------------------
// Campaign 2.0
// ---------------------------------------------------------------------------
export const TANKS_2_0: TankDef[] = [
  { id: "excalibur", name: "Excalibur" },
  { id: "chimera", name: "Chimera" },
  { id: "object-279e", name: "Object 279 (e)" },
];

export const MISSION_TYPES_2_0: TypeDef[] = [
  { id: "union", name: "Union" },
  { id: "bloc", name: "Bloc" },
  { id: "alliance", name: "Alliance" },
  { id: "coalition", name: "Coalition" },
];

export const MISSION_PRICES_2_0: PriceTable = {
  excalibur: {
    union: (n) =>
      n === 1 ? 3 : n === 2 ? 5 : n === 3 ? 4 : n === 4 ? 3 : n === 5 ? 5 : n === 6 ? 4 : n === 7 ? 5 : n === 8 ? 3 : n <= 10 ? 4 : n === 11 ? 5 : n === 12 ? 8 : n === 13 ? 3 : n === 14 ? 5 : 8,
    bloc: (n) =>
      n === 1 ? 4 : n === 2 ? 5 : n === 3 ? 6 : n === 4 ? 4 : n === 5 ? 3 : n === 6 ? 5 : n === 7 ? 9 : n === 8 ? 6 : n <= 11 ? 4 : n === 12 ? 8 : n === 13 ? 5 : n === 14 ? 8 : 10,
    alliance: (n) =>
      n === 1 ? 4 : n === 2 ? 3 : n === 3 ? 4 : n === 4 ? 3 : n === 5 ? 4 : n <= 7 ? 3 : n === 8 ? 4 : n <= 10 ? 3 : n === 11 ? 5 : n === 12 ? 6 : n <= 14 ? 5 : 8,
    coalition: (n) =>
      n <= 2 ? 3 : n === 3 ? 4 : n <= 5 ? 3 : n <= 7 ? 4 : n <= 9 ? 3 : n <= 11 ? 5 : n === 12 ? 2 : n <= 14 ? 3 : 9,
  },
  chimera: {
    union: (n) =>
      n === 1 ? 2 : n === 2 ? 4 : n === 3 ? 3 : n <= 5 ? 5 : n === 6 ? 9 : n === 7 ? 4 : n === 8 ? 10 : n === 9 ? 5 : n === 10 ? 3 : n <= 12 ? 6 : n <= 14 ? 10 : 16,
    bloc: (n) =>
      n === 1 ? 6 : n === 2 ? 8 : n <= 4 ? 3 : n === 5 ? 7 : n === 6 ? 5 : n === 7 ? 8 : n === 8 ? 10 : n === 9 ? 5 : n === 10 ? 7 : n === 11 ? 9 : n === 12 ? 4 : n === 13 ? 11 : n === 14 ? 8 : 18,
    alliance: (n) =>
      n === 1 ? 8 : n <= 3 ? 4 : n === 4 ? 8 : n === 5 ? 10 : n === 6 ? 5 : n === 7 ? 3 : n <= 9 ? 8 : n === 10 ? 6 : n === 11 ? 5 : n === 12 ? 9 : n === 13 ? 5 : n === 14 ? 4 : 14,
    coalition: (n) =>
      n === 1 ? 4 : n === 2 ? 5 : n === 3 ? 3 : n === 4 ? 4 : n === 5 ? 9 : n === 6 ? 4 : n === 7 ? 8 : n === 8 ? 3 : n === 9 ? 4 : n === 10 ? 6 : n === 11 ? 8 : n <= 13 ? 7 : n === 14 ? 15 : 17,
  },
  "object-279e": {
    union: (n) =>
      n <= 2 ? 8 : n === 3 ? 6 : n === 4 ? 7 : n === 5 ? 6 : n === 6 ? 8 : n === 7 ? 20 : n === 8 ? 5 : n === 9 ? 4 : n === 10 ? 5 : n === 11 ? 6 : n === 12 ? 4 : n === 13 ? 12 : n === 14 ? 7 : 16,
    bloc: (n) =>
      n === 1 ? 5 : n === 2 ? 8 : n <= 6 ? 5 : n === 7 ? 9 : n === 8 ? 3 : n === 9 ? 7 : n === 10 ? 8 : n === 11 ? 4 : n === 12 ? 6 : n === 13 ? 10 : n === 14 ? 4 : 16,
    alliance: (n) =>
      n <= 2 ? 4 : n === 3 ? 10 : n <= 6 ? 5 : n === 7 ? 8 : n === 8 ? 18 : n === 9 ? 8 : n === 10 ? 7 : n === 11 ? 5 : n === 12 ? 6 : n === 13 ? 12 : n === 14 ? 6 : 16,
    coalition: (n) =>
      n === 1 ? 9 : n === 2 ? 4 : n === 3 ? 6 : n === 4 ? 18 : n === 5 ? 6 : n === 6 ? 5 : n === 7 ? 6 : n === 8 ? 16 : n === 9 ? 7 : n <= 13 ? 6 : n === 14 ? 8 : 16,
  },
};

// ---------------------------------------------------------------------------
// Campaign 3.0
// ---------------------------------------------------------------------------
export const TANKS_3_0: TankDef[] = [
  { id: "windhund", name: "Windhund" },
  { id: "dravec", name: "Dravec" },
  { id: "black-rock", name: "Black Rock" },
];

export const MISSION_TYPES_3_0: TypeDef[] = [
  { id: "vanguard", name: "Vanguard" },
  { id: "ambush", name: "Ambush" },
  { id: "assistance", name: "Assistance" },
];

export const MISSION_PRICES_3_0: PriceTable = {
  windhund: {
    vanguard: (n) =>
      n <= 4 ? 4 : n <= 7 ? 3 : n === 8 ? 4 : n === 9 ? 6 : n === 10 ? 4 : n <= 12 ? 5 : n === 13 ? 3 : n === 14 ? 4 : 8,
    ambush: (n) =>
      n === 1 ? 4 : n === 2 ? 6 : n <= 4 ? 4 : n <= 6 ? 3 : n === 7 ? 4 : n === 8 ? 5 : n === 9 ? 6 : n <= 11 ? 5 : n === 12 ? 7 : 6,
    assistance: (n) =>
      n === 1 ? 4 : n === 2 ? 6 : n <= 4 ? 4 : n === 5 ? 3 : n === 6 ? 5 : n === 7 ? 4 : n === 8 ? 5 : n === 9 ? 4 : n === 10 ? 5 : n === 11 ? 6 : n <= 13 ? 4 : n === 14 ? 6 : 8,
  },
  dravec: {
    vanguard: (n) =>
      n === 1 ? 8 : n <= 3 ? 6 : n === 4 ? 5 : n === 5 ? 4 : n === 6 ? 5 : n === 7 ? 6 : n === 8 ? 5 : n === 9 ? 12 : n <= 11 ? 6 : n === 12 ? 7 : n === 13 ? 6 : n === 14 ? 8 : 12,
    ambush: (n) =>
      n === 1 ? 4 : n === 2 ? 7 : n <= 5 ? 6 : n === 6 ? 10 : n === 7 ? 5 : n === 8 ? 9 : n === 9 ? 7 : n === 10 ? 6 : n === 11 ? 8 : n === 12 ? 14 : n === 13 ? 9 : n === 14 ? 8 : 20,
    assistance: (n) =>
      n === 1 ? 10 : n <= 5 ? 6 : n === 6 ? 8 : n === 7 ? 12 : n === 8 ? 8 : n === 9 ? 10 : n <= 14 ? 8 : 12,
  },
  "black-rock": {
    vanguard: (n) =>
      n === 1 ? 12 : n === 2 ? 6 : n === 3 ? 8 : n === 4 ? 6 : n <= 6 ? 7 : n === 7 ? 8 : n <= 10 ? 10 : n === 11 ? 14 : n === 12 ? 15 : n === 13 ? 18 : n === 14 ? 16 : 25,
    ambush: (n) =>
      n <= 2 ? 8 : n === 3 ? 12 : n === 4 ? 10 : n === 5 ? 8 : n <= 7 ? 12 : n === 8 ? 9 : n === 9 ? 12 : n === 10 ? 10 : n === 11 ? 16 : n === 12 ? 13 : n === 13 ? 15 : 22,
    assistance: (n) =>
      n === 1 ? 12 : n === 2 ? 20 : n === 3 ? 6 : n === 4 ? 12 : n === 5 ? 11 : n === 6 ? 12 : n === 7 ? 14 : n === 8 ? 12 : n <= 10 ? 8 : n === 11 ? 7 : n === 12 ? 8 : n === 13 ? 14 : n === 14 ? 10 : 12,
  },
};

// ---------------------------------------------------------------------------
// Per-campaign config + fallback prices
// ---------------------------------------------------------------------------
type CampaignConfig = {
  tanks: TankDef[];
  missionTypes: TypeDef[];
  prices: PriceTable;
  fallback: number;
};

const CAMPAIGNS: Record<CampaignId, CampaignConfig> = {
  "1.0": {
    tanks: TANKS_1_0,
    missionTypes: MISSION_TYPES_1_0,
    prices: MISSION_PRICES_1_0,
    fallback: 5,
  },
  "2.0": {
    tanks: TANKS_2_0,
    missionTypes: MISSION_TYPES_2_0,
    prices: MISSION_PRICES_2_0,
    fallback: 15,
  },
  "3.0": {
    tanks: TANKS_3_0,
    missionTypes: MISSION_TYPES_3_0,
    prices: MISSION_PRICES_3_0,
    fallback: 20,
  },
};

export function getCampaignConfig(campaignId: CampaignId): {
  tanks: TankDef[];
  missionTypes: TypeDef[];
  prices: PriceTable;
} {
  const cfg = CAMPAIGNS[campaignId];
  return { tanks: cfg.tanks, missionTypes: cfg.missionTypes, prices: cfg.prices };
}

// Calculate price for a single mission within a campaign.
export function getMissionPrice(
  campaignId: CampaignId,
  tankId: string,
  typeId: string,
  missionNumber: number
): number {
  const cfg = CAMPAIGNS[campaignId];
  return cfg.prices[tankId]?.[typeId]?.(missionNumber) ?? cfg.fallback;
}

// Engine: shared across all campaigns. 1:1 port of the page useMemo.
export function priceCampaignMissions(
  campaignId: CampaignId,
  selectedMissions: SelectedMissions
): { total: number; original: number; discount: number } {
  const cfg = CAMPAIGNS[campaignId];
  const missionTypes = cfg.missionTypes;

  let totalPrice = 0;
  let originalPrice = 0;
  let totalDiscount = 0;

  Object.entries(selectedMissions).forEach(([tankId, tankMissions]) => {
    const isFullTank = missionTypes.every(
      (type) => tankMissions[type.id]?.length === MISSIONS_PER_TYPE
    );

    if (isFullTank) {
      let tankBasePrice = 0;
      missionTypes.forEach((type) => {
        for (let i = 1; i <= MISSIONS_PER_TYPE; i++)
          tankBasePrice += getMissionPrice(campaignId, tankId, type.id, i);
      });

      originalPrice += tankBasePrice;
      const discounted = tankBasePrice * 0.75; // 25% off
      totalPrice += discounted;
      totalDiscount += tankBasePrice - discounted;
    } else {
      Object.entries(tankMissions).forEach(([typeId, missions]) => {
        const isFullType = missions.length === MISSIONS_PER_TYPE;
        let typeBasePrice = 0;

        missions.forEach((num) => {
          typeBasePrice += getMissionPrice(campaignId, tankId, typeId, num);
        });

        originalPrice += typeBasePrice;

        if (isFullType) {
          const discounted = typeBasePrice * 0.85; // 15% off
          totalPrice += discounted;
          totalDiscount += typeBasePrice - discounted;
        } else {
          totalPrice += typeBasePrice;
        }
      });
    }
  });

  return {
    total: Math.round(totalPrice),
    original: Math.round(originalPrice),
    discount: Math.round(totalDiscount),
  };
}
