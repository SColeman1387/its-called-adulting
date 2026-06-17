export interface Trip {
  id: string;
  miles: number;
  date: string; // ISO date string
  label?: string;
}

const TRIPS_KEY = "ica_trips";
const BASELINE_KEY = "ica_mileage_baseline"; // { mileage: number, date: string }

export function getTrips(): Trip[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(TRIPS_KEY) || "[]"); }
  catch { return []; }
}

export function logTrip(miles: number, label?: string): Trip {
  const trip: Trip = { id: Date.now().toString(), miles, date: new Date().toISOString(), label };
  const trips = getTrips();
  trips.push(trip);
  localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
  return trip;
}

export function deleteTrip(id: string): void {
  const trips = getTrips().filter((t) => t.id !== id);
  localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
}

// Set a baseline: "at this date, odometer was X"
export function setMileageBaseline(mileage: number, date?: string): void {
  localStorage.setItem(BASELINE_KEY, JSON.stringify({ mileage, date: date || new Date().toISOString() }));
}

export function getMileageBaseline(): { mileage: number; date: string } | null {
  try { return JSON.parse(localStorage.getItem(BASELINE_KEY) || "null"); }
  catch { return null; }
}

// Estimated current mileage = baseline + all trips logged since baseline
export function getEstimatedMileage(): number | null {
  const baseline = getMileageBaseline();
  if (!baseline) return null;
  const baselineDate = new Date(baseline.date).getTime();
  const milesSinceBaseline = getTrips()
    .filter((t) => new Date(t.date).getTime() >= baselineDate)
    .reduce((sum, t) => sum + t.miles, 0);
  return baseline.mileage + milesSinceBaseline;
}

// Miles driven since a specific odometer reading (for oil change tracking)
export function getMilesSince(odometerAtEvent: number, baselineMileage: number): number {
  const current = getEstimatedMileage() ?? baselineMileage;
  return Math.max(0, current - odometerAtEvent);
}

// Rolling 30-day avg miles per day
export function getAvgMilesPerDay(): number | null {
  const trips = getTrips();
  if (trips.length === 0) return null;
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recent = trips.filter((t) => new Date(t.date).getTime() > thirtyDaysAgo);
  if (recent.length === 0) return null;
  const total = recent.reduce((sum, t) => sum + t.miles, 0);
  // Days spanned
  const oldest = Math.min(...recent.map((t) => new Date(t.date).getTime()));
  const days = Math.max(1, (Date.now() - oldest) / (24 * 60 * 60 * 1000));
  return total / days;
}

// Project how many days until oil change is due
export function getDaysUntilOilChange(interval: number, lastChangeMileage: number): number | null {
  const avg = getAvgMilesPerDay();
  const current = getEstimatedMileage();
  if (!avg || !current) return null;
  const milesLeft = interval - (current - lastChangeMileage);
  if (milesLeft <= 0) return 0;
  return Math.ceil(milesLeft / avg);
}
