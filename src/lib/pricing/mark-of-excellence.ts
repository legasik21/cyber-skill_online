// Pure, dependency-free pricing module for the Mark of Excellence service.
// 1:1 port of the inline pricing logic from the page. No React, no imports.

export const TANK_DIFFICULTIES = [
  { id: "easy", name: "Easy", multiplier: 0 },
  { id: "hard", name: "All Tier XI or Tier X", multiplier: 0.3 },
  { id: "spg", name: "SPG", multiplier: 0.5 },
] as const;

export const SPECIAL_VEHICLES = [
  { id: "black-rock", name: "Black Rock Reward Tank", fee: 0.3 },
  { id: "vz-60s", name: "Vz 60S Dravec Reward Tank", fee: 0.3 },
  { id: "hurricane", name: "Hurricane", fee: 0.3 },
  { id: "chrysler", name: "Chrysler MTC Tier VIII", fee: 0.2 },
  { id: "sfac", name: "SFAC 105 Tier VIII", fee: 0.2 },
  { id: "grom", name: "Grom Tier VIII", fee: 0.2 },
  { id: "bourrasque", name: "Bourrasque Tier VIII", fee: 0.2 },
  { id: "prototipo", name: "Prototipo 6", fee: 0.2 },
  { id: "bz-176", name: "BZ-176", fee: 0.2 },
  { id: "projekt-ion", name: "Projekt ION", fee: 0.2 },
  { id: "titt", name: "TITT", fee: 0.2 },
  { id: "skoda", name: "Skoda T56", fee: 0.2 },
  { id: "chimera", name: "Chimera", fee: 0.2 },
  { id: "elc", name: "ELC EVEN 90", fee: 0.2 },
  { id: "alembic", name: "Alembic", fee: 0.2 },
  { id: "type-59", name: "Type 59 & 59 G", fee: 0.2 },
  { id: "udarny", name: "Udarny Tier VIII", fee: 0.2 },
  { id: "charlemagne", name: "Charlemagne Tier VIII", fee: 0.2 },
  { id: "miel", name: "Miel Tier VIII", fee: 0.2 },
] as const;

export const SILVER_OPTIONS = [
  { id: "none", name: "None", addon: 0 },
  { id: "10m", name: "10M Credits", addon: 45.86 },
  { id: "20m", name: "20M Credits", addon: 81.13 },
] as const;

export const PRICE_BANDS = [
  { min: 1, max: 20, rate: 0.3 },
  { min: 20, max: 50, rate: 0.3983333333333333 },
  { min: 50, max: 65, rate: 0.5 },
  { min: 65, max: 85, rate: 1.5 },
  { min: 85, max: 95, rate: 3.5 },
] as const;

export type MoeInput = {
  fromProgress: number;
  toProgress: number;
  difficulty?: string;
  specialVehicle?: string;
  silverOption?: string;
};

function round2(x: number): number {
  return Math.round(x * 100) / 100;
}

export function calculateBasePrice(from: number, to: number): number {
  let basePrice = 0;
  for (const band of PRICE_BANDS) {
    const bandStart = Math.max(from, band.min);
    const bandEnd = Math.min(to, band.max);
    // strict start < end so shared endpoints are not double-counted
    if (bandStart < bandEnd) basePrice += (bandEnd - bandStart) * band.rate;
  }
  return basePrice;
}

export function priceMarkOfExcellence(input: MoeInput): {
  base: number;
  total: number;
} {
  const { fromProgress, toProgress, difficulty, specialVehicle, silverOption } =
    input;

  const delta = Math.max(0, toProgress - fromProgress);
  if (delta === 0) return { base: 0, total: 0 };

  const basePrice = calculateBasePrice(fromProgress, toProgress);

  let finalMultiplier = 1;
  if (specialVehicle) {
    const vehicleFee =
      SPECIAL_VEHICLES.find((v) => v.id === specialVehicle)?.fee || 0;
    finalMultiplier = 1 + vehicleFee;
  } else if (difficulty) {
    const difficultyMult =
      TANK_DIFFICULTIES.find((d) => d.id === difficulty)?.multiplier || 0;
    finalMultiplier = 1 + difficultyMult;
  }

  // Silver add-on is a flat amount, not multiplied.
  const silverAddon =
    SILVER_OPTIONS.find((s) => s.id === silverOption)?.addon || 0;

  const total = basePrice * finalMultiplier + silverAddon;

  return {
    base: round2(basePrice),
    total: round2(total),
  };
}
