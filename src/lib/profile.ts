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
  setupComplete: false,
};
