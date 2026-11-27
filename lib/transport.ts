export type TransportMode = "Petrol car" | "Diesel car" | "Petrol motorcycle" | "Electric vehicle" | "Bus" | "Metro / rail" | "Bicycle / walk";
export const MODES: TransportMode[] = ["Petrol car","Diesel car","Petrol motorcycle","Electric vehicle","Bus","Metro / rail","Bicycle / walk"];
const GASOLINE_KG_CO2_PER_L = 8.887 / 3.785411784, DIESEL_KG_CO2_PER_L = 10.180 / 3.785411784, GRID_KG_CO2_PER_KWH = 0.710;
const PASSENGER_KG_PER_KM: Partial<Record<TransportMode,number>> = { "Bus":0.1255, "Metro / rail":0.05, "Bicycle / walk":0 };
export interface CommuteInputs { mode: TransportMode; distanceKm: number; tripsPerWeek: number; occupants: number; fuelEfficiency?: number; evKwhPer100Km?: number }
export interface CommuteResult { mode: TransportMode; monthlyKm: number; monthlyCo2Kg: number; annualCo2Tonnes: number }
const safe = (n:number, fallback=0) => Number.isFinite(n) ? Math.max(n,0) : fallback;
export function monthlyDistance(distanceKm:number,tripsPerWeek:number) { return safe(distanceKm)*2*safe(tripsPerWeek)*(52/12); }
export function calculateCommute(inputs:CommuteInputs):CommuteResult {
 const km=monthlyDistance(inputs.distanceKm,inputs.tripsPerWeek), occupants=Math.max(Math.round(safe(inputs.occupants,1))||1,1);
 const efficiency=Math.max(safe(inputs.fuelEfficiency,15)||15,1), evUse=Math.max(safe(inputs.evKwhPer100Km,16)||16,1); let co2=0;
 if(inputs.mode==="Petrol car") co2=km/efficiency*GASOLINE_KG_CO2_PER_L/occupants;
 else if(inputs.mode==="Diesel car") co2=km/efficiency*DIESEL_KG_CO2_PER_L/occupants;
 else if(inputs.mode==="Petrol motorcycle") co2=km/efficiency*GASOLINE_KG_CO2_PER_L;
 else if(inputs.mode==="Electric vehicle") co2=km*evUse/100*GRID_KG_CO2_PER_KWH/occupants;
 else co2=km*(PASSENGER_KG_PER_KM[inputs.mode]??0);
 const total=Number.isFinite(co2)?Math.max(co2,0):0;
 return {mode:inputs.mode,monthlyKm:km,monthlyCo2Kg:total,annualCo2Tonnes:total*12/1000};
}