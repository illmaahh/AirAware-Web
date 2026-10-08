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

const GASOLINE_KG_CO2_PER_L = 8.887 / 3.785411784;
const DIESEL_KG_CO2_PER_L = 10.180 / 3.785411784;
const GRID_KG_CO2_PER_KWH = 0.710;

// Educational prototype defaults. Keep methodology visible in the UI.
const PASSENGER_KG_PER_KM: Record<string, number> = {
  "Bus": 0.1255,
  "Metro / rail": 0.05,
  "Bicycle / walk": 0,
};

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

export function monthlyDistance(distanceKm: number, tripsPerWeek: number) {
  return Math.max(distanceKm, 0) * 2 * Math.max(tripsPerWeek, 0) * (52 / 12);
}

export function calculateCommute(inputs: CommuteInputs): CommuteResult {
  const km = monthlyDistance(inputs.distanceKm, inputs.tripsPerWeek);
  const occupants = Math.max(Math.round(inputs.occupants || 1), 1);
  const efficiency = Math.max(inputs.fuelEfficiency || 15, 1);
  const evUse = Math.max(inputs.evKwhPer100Km || 16, 1);

  let co2 = 0;

  if (inputs.mode === "Petrol car") {
    co2 = (km / efficiency) * GASOLINE_KG_CO2_PER_L / occupants;
  } else if (inputs.mode === "Diesel car") {
    co2 = (km / efficiency) * DIESEL_KG_CO2_PER_L / occupants;
  } else if (inputs.mode === "Petrol motorcycle") {
    co2 = (km / efficiency) * GASOLINE_KG_CO2_PER_L;
  } else if (inputs.mode === "Electric vehicle") {
    const kwh = km * evUse / 100;
    co2 = kwh * GRID_KG_CO2_PER_KWH / occupants;
  } else {
    co2 = km * PASSENGER_KG_PER_KM[inputs.mode];
  }

  return {
    mode: inputs.mode,
    monthlyKm: km,
    monthlyCo2Kg: Math.max(co2, 0),
    annualCo2Tonnes: Math.max(co2, 0) * 12 / 1000,
  };
}
