import { TASKS, Task } from "./data";

// Returns the ISO week number (1–52) for a given date
export function getISOWeek(date: Date = new Date()): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// A stable key for the current week: "2025-W23"
export function getWeekKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-W${String(getISOWeek(date)).padStart(2, "0")}`;
}

// Pick this week's lesson task, cycling through all tasks deterministically
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getWeeklyLesson(profile?: any): Task {
  // Exclude guides — they're long reference docs, not quick lessons
  const eligible = TASKS.filter((t) => {
    if (t.category === "guides") return false;
    if (!t.requires) return true;
    if (!profile) return true;
    const reqs = Array.isArray(t.requires) ? t.requires : [t.requires];
    return reqs.every((req) => {
      switch (req) {
        case "hasCar": return !!profile.hasCar || (profile.vehicles ?? []).length > 0;
        case "hasPool": return !!profile.hasPool;
        case "hasYard": return !!profile.hasYard;
        case "hasWaterSoftener": return !!profile.hasWaterSoftener;
        case "hasDryer": return !!profile.hasDryer;
        case "hasFireplace": return !!profile.hasFireplace;
        case "homeOwner": return profile.homeType === "own-house";
        case "hasOutdoorAccess": return profile.homeType === "rent-house" || profile.homeType === "own-house";
        case "coldClimate": return !["Florida","Hawaii","Arizona","California","Louisiana","Mississippi","Alabama","Georgia","South Carolina","Texas","Nevada","New Mexico"].includes(profile.state ?? "");
        case "hasBoat": return !!profile.hasBoat;
        case "hasGolfCart": return !!profile.hasGolfCart;
        case "hasUTV": return !!profile.hasUTV;
        case "hasRV": return !!profile.hasRV;
        default: return true;
      }
    });
  });

  const week = getISOWeek();
  const year = new Date().getFullYear();
  // Offset by year so it doesn't repeat the same week every year
  const index = (week + year * 52) % eligible.length;
  return eligible[index];
}

// ─── localStorage record types ───────────────────────────────────────────────

export interface LessonRecord {
  weekKey: string;
  taskId: string;
  response: "learned" | "knew-it" | null;
  viewedAt: string;
}

const STORAGE_KEY = "ica_learning";

export function getLearningHistory(): LessonRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch { return []; }
}

export function getThisWeekRecord(): LessonRecord | null {
  const key = getWeekKey();
  return getLearningHistory().find((r) => r.weekKey === key) ?? null;
}

export function markWeekViewed(taskId: string): void {
  const key = getWeekKey();
  const history = getLearningHistory();
  if (history.find((r) => r.weekKey === key)) return; // already recorded
  history.push({ weekKey: key, taskId, response: null, viewedAt: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function recordResponse(taskId: string, response: "learned" | "knew-it"): void {
  const key = getWeekKey();
  const history = getLearningHistory();
  const idx = history.findIndex((r) => r.weekKey === key);
  if (idx >= 0) {
    history[idx].response = response;
  } else {
    history.push({ weekKey: key, taskId, response, viewedAt: new Date().toISOString() });
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

// Count consecutive weeks with a response (streak)
export function getLearningStreak(): number {
  const history = getLearningHistory().filter((r) => r.response !== null);
  if (history.length === 0) return 0;

  // Sort by weekKey descending
  const sorted = [...history].sort((a, b) => b.weekKey.localeCompare(a.weekKey));
  const thisWeek = getWeekKey();

  let streak = 0;
  let expected = thisWeek;

  for (const record of sorted) {
    if (record.weekKey === expected) {
      streak++;
      // Move expected back one week
      expected = prevWeekKey(expected);
    } else {
      break;
    }
  }
  return streak;
}

function prevWeekKey(key: string): string {
  // key format: "2025-W23"
  const [yearStr, wStr] = key.split("-W");
  let year = parseInt(yearStr);
  let week = parseInt(wStr) - 1;
  if (week < 1) {
    year -= 1;
    week = 52;
  }
  return `${year}-W${String(week).padStart(2, "0")}`;
}
