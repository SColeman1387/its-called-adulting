const KEY = "ica_points_ledger";

// Max points a user can earn per calendar month (excludes deductions).
// At 125 pts/mo it takes ~4 months to reach the 500-pt ($10) gift card,
// meaning users earn back at most ~50% of their $4.99/mo subscription.
export const MONTHLY_EARN_CAP = 125;

export interface PointEvent {
  id: string;
  type: "task_complete" | "lesson_complete" | "tool_acquired" | "referral" | "signup";
  points: number;
  label: string;
  ts: string;
  refId?: string; // task id, tool id, etc.
}

export const POINT_VALUES: Record<PointEvent["type"], number> = {
  task_complete:    10,
  lesson_complete:  25,
  tool_acquired:    20,
  referral:        100,
  signup:           50,
};

export const GIFT_CARD_TIERS = [
  { id: "gc10",  label: "$10 Gift Card",  points: 500,   value: 10 },
  { id: "gc25",  label: "$25 Gift Card",  points: 1250,  value: 25 },
];

function getLedger(): PointEvent[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLedger(ledger: PointEvent[]) {
  localStorage.setItem(KEY, JSON.stringify(ledger));
}

export function getTotalPoints(): number {
  return getLedger().reduce((sum, e) => sum + e.points, 0);
}

export function getLedgerEntries(): PointEvent[] {
  return getLedger().slice().reverse();
}

export function getMonthlyEarned(): number {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  return getLedger()
    .filter((e) => e.points > 0 && e.ts >= monthStart)
    .reduce((sum, e) => sum + e.points, 0);
}

export function getMonthlyRemaining(): number {
  return Math.max(0, MONTHLY_EARN_CAP - getMonthlyEarned());
}

function hasEarned(type: PointEvent["type"], refId: string): boolean {
  return getLedger().some((e) => e.type === type && e.refId === refId);
}

export function awardPoints(
  type: PointEvent["type"],
  label: string,
  refId: string
): number {
  if (hasEarned(type, refId)) return 0;

  const rawPoints = POINT_VALUES[type];

  // Referrals are self-funding (each signup = $4.99/mo revenue) so they
  // bypass the monthly cap entirely.
  const points = type === "referral" ? rawPoints : Math.min(rawPoints, Math.max(0, getMonthlyRemaining()));

  const event: PointEvent = {
    id: crypto.randomUUID(),
    type,
    points,
    label,
    ts: new Date().toISOString(),
    refId,
  };
  const ledger = getLedger();
  ledger.push(event);
  saveLedger(ledger);
  return points;
}

export function deductPoints(points: number, label: string): boolean {
  const current = getTotalPoints();
  if (current < points) return false;
  const event: PointEvent = {
    id: crypto.randomUUID(),
    type: "task_complete", // repurposed as spend marker
    points: -points,
    label,
    ts: new Date().toISOString(),
  };
  const ledger = getLedger();
  ledger.push(event);
  saveLedger(ledger);
  return true;
}
