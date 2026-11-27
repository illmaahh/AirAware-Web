export type TransportMode =
  | "Petrol car"
  | "Diesel car"
  | "Petrol motorcycle"
  | "Electric vehicle"
  | "Bus"
  | "Metro / rail"
  | "Bicycle / walk";

export const MODES: TransportMode[] = [
  "Petrol car",
  "Diesel car",
  "Petrol motorcycle",
  "Electric vehicle",
  "Bus",
  "Metro / rail",
  "Bicycle / walk",
];

const GASOLINE_KG_CO2_PER_LITRE = 8.887 / 3.785411784;
const DIESEL_KG_CO2_PER_LITRE = 10.18 / 3.785411784;
const GRID_KG_CO2_PER_KWH = 0.71;

// Educational defaults. These assumptions should remain visible in the UI.
const PASSENGER_KG_PER_KM: Partial<Record<TransportMode, number>> = {
  Bus: 0.1255,
  "Metro / rail": 0.05,
  "Bicycle / walk": 0,
};

// Guardrails prevent malformed or extreme form values from producing Infinity/NaN.
const MAX_ONE_WAY_DISTANCE_KM = 5_000;
const MAX_TRIPS_PER_WEEK = 14;
const MAX_OCCUPANTS = 100;
const MAX_EFFICIENCY = 100;

export interface CommuteInputs {
  mode: TransportMode;
  distanceKm: number;
  tripsPerWeek: number;
  occupants: number;
  fuelEfficiency?: number;
  evKwhPer100Km?: number;
}

export interface CommuteResult {
  mode: TransportMode;
  monthlyKm: number;
  monthlyCo2Kg: number;
  annualCo2Tonnes: number;
}

function boundedNumber(value: number, fallback: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(Math.max(value, min), max);
}

export function monthlyDistance(distanceKm: number, tripsPerWeek: number): number {
  const distance = boundedNumber(distanceKm, 0, 0, MAX_ONE_WAY_DISTANCE_KM);
  const trips = boundedNumber(tripsPerWeek, 0, 0, MAX_TRIPS_PER_WEEK);
  return distance * 2 * trips * (52 / 12);
}

export function calculateCommute(inputs: CommuteInputs): CommuteResult {
  if (!MODES.includes(inputs.mode)) throw new RangeError("Unsupported transport mode.");

  const monthlyKm = monthlyDistance(inputs.distanceKm, inputs.tripsPerWeek);
  const occupants = Math.round(boundedNumber(inputs.occupants, 1, 1, MAX_OCCUPANTS));
  const fuelEfficiency = boundedNumber(inputs.fuelEfficiency ?? 15, 15, 1, MAX_EFFICIENCY);
  const evEfficiency = boundedNumber(inputs.evKwhPer100Km ?? 16, 16, 1, MAX_EFFICIENCY);

  let monthlyCo2Kg: number;
  switch (inputs.mode) {
    case "Petrol car":
      monthlyCo2Kg = (monthlyKm / fuelEfficiency) * GASOLINE_KG_CO2_PER_LITRE / occupants;
      break;
    case "Diesel car":
      monthlyCo2Kg = (monthlyKm / fuelEfficiency) * DIESEL_KG_CO2_PER_LITRE / occupants;
      break;
    case "Petrol motorcycle":
      monthlyCo2Kg = (monthlyKm / fuelEfficiency) * GASOLINE_KG_CO2_PER_LITRE;
      break;
    case "Electric vehicle":
      monthlyCo2Kg = (monthlyKm * evEfficiency / 100) * GRID_KG_CO2_PER_KWH / occupants;
      break;
    case "Bus":
    case "Metro / rail":
    case "Bicycle / walk":
      monthlyCo2Kg = monthlyKm * (PASSENGER_KG_PER_KM[inputs.mode] ?? 0);
      break;
  }

  const safeMonthlyCo2Kg = Number.isFinite(monthlyCo2Kg) ? Math.max(monthlyCo2Kg, 0) : 0;
  return {
    mode: inputs.mode,
    monthlyKm,
    monthlyCo2Kg: safeMonthlyCo2Kg,
    annualCo2Tonnes: (safeMonthlyCo2Kg * 12) / 1_000,
  };
}
