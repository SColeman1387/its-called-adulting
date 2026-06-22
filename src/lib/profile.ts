export type ServiceType =
  | "oil_change"
  | "tire_rotation"
  | "brakes"
  | "tires"
  | "battery"
  | "air_filter"
  | "transmission"
  | "coolant"
  | "inspection"
  | "other";

export const SERVICE_LABELS: Record<ServiceType, string> = {
  oil_change: "Oil Change",
  tire_rotation: "Tire Rotation",
  brakes: "Brakes",
  tires: "Tires",
  battery: "Battery",
  air_filter: "Air Filter",
  transmission: "Transmission Service",
  coolant: "Coolant Flush",
  inspection: "Inspection / State Inspection",
  other: "Other",
};

export interface ServiceRecord {
  id: string;
  date: string;             // ISO date string
  serviceType: ServiceType;
  mileage?: number;
  cost?: number;
  shop?: string;
  notes?: string;
  receiptUrl?: string;      // Supabase Storage public URL
}

export interface Vehicle {
  id: string;
  nickname: string;        // "My Truck", "Wife's SUV"
  year?: string;
  make?: string;           // make + model, e.g. "Ford F-150"
  oilChangeInterval?: 3000 | 5000 | 7500 | 10000;
  lastOilChangeMileage?: number;
  lastOilChangeDate?: string;
  mileageHistory: { date: string; mileage: number }[];  // ordered oldest→newest
  serviceHistory: ServiceRecord[];
}

export function getLatestMileage(v: Vehicle): number | undefined {
  if (!v.mileageHistory.length) return undefined;
  return v.mileageHistory[v.mileageHistory.length - 1].mileage;
}

export function getMilesUntilOilChangeV2(v: Vehicle): number | null {
  const current = getLatestMileage(v);
  if (!current || !v.lastOilChangeMileage || !v.oilChangeInterval) return null;
  return v.oilChangeInterval - (current - v.lastOilChangeMileage);
}

export function getOilChangeStatusV2(v: Vehicle): "overdue" | "due-soon" | "ok" | null {
  const miles = getMilesUntilOilChangeV2(v);
  if (miles === null) return null;
  if (miles <= 0) return "overdue";
  if (miles <= 500) return "due-soon";
  return "ok";
}

// Estimate avg miles/month from history, return predicted months until oil change
export function predictOilChangeMonths(v: Vehicle): number | null {
  const history = v.mileageHistory;
  if (history.length < 2 || !v.lastOilChangeMileage || !v.oilChangeInterval) return null;
  const first = history[0];
  const last = history[history.length - 1];
  const monthsElapsed = (new Date(last.date).getTime() - new Date(first.date).getTime()) / (1000 * 60 * 60 * 24 * 30);
  if (monthsElapsed < 0.5) return null;
  const milesPerMonth = (last.mileage - first.mileage) / monthsElapsed;
  if (milesPerMonth <= 0) return null;
  const milesLeft = getMilesUntilOilChangeV2(v);
  if (milesLeft === null) return null;
  return Math.max(0, milesLeft / milesPerMonth);
}

// States where hard freezes are rare — pool winterizing, hose winterizing
// and freeze-focused content should be suppressed
const WARM_CLIMATE_STATES = new Set([
  "Florida", "Hawaii", "Arizona", "California",
  "Louisiana", "Mississippi", "Alabama", "Georgia",
  "South Carolina", "Texas", "Nevada", "New Mexico",
]);

export function isWarmClimate(state?: string): boolean {
  if (!state) return false;
  return WARM_CLIMATE_STATES.has(state);
}

export interface UserProfile {
  homeType: "apartment" | "rent-house" | "own-house" | null;
  hasCar: boolean;
  carYear?: string;
  carMake?: string;
  currentMileage?: number;
  lastOilChangeMileage?: number;
  oilChangeInterval?: 3000 | 5000 | 7500 | 10000;
  preferredOilShop?: string;
  preferredOilShopPhone?: string;
  hasPool: boolean;
  poolType?: "above-ground" | "in-ground";
  hasYard: boolean;
  hasPets: boolean;
  city?: string;
  state?: string;
  hasWaterSoftener: boolean;
  hasDryer: boolean;
  hasFireplace: boolean;
  hasBoat: boolean;
  hasGolfCart: boolean;
  hasUTV: boolean;
  hasRV: boolean;
  vehicles: Vehicle[];
  setupComplete: boolean;
}

export function getMilesUntilOilChange(profile: UserProfile): number | null {
  if (!profile.hasCar || !profile.currentMileage || !profile.lastOilChangeMileage || !profile.oilChangeInterval) return null;
  const milesDriven = profile.currentMileage - profile.lastOilChangeMileage;
  return profile.oilChangeInterval - milesDriven;
}

export function getOilChangeStatus(profile: UserProfile): "overdue" | "due-soon" | "ok" | null {
  const miles = getMilesUntilOilChange(profile);
  if (miles === null) return null;
  if (miles <= 0) return "overdue";
  if (miles <= 500) return "due-soon";
  return "ok";
}

const PROFILE_KEY = "adulting_profile";

export function getProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveProfile(profile: UserProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function clearProfile() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PROFILE_KEY);
}

export const DEFAULT_PROFILE: UserProfile = {
  homeType: null,
  hasCar: false,
  hasPool: false,
  hasYard: false,
  hasPets: false,
  hasWaterSoftener: false,
  hasDryer: true,
  hasFireplace: false,
  hasBoat: false,
  hasGolfCart: false,
  hasUTV: false,
  hasRV: false,
  vehicles: [],
  setupComplete: false,
};
