const KEY = "ica_points_ledger";

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
  { id: "gc10",  label: "$10 Amazon Gift Card",  points: 500,   value: 10 },
  { id: "gc25",  label: "$25 Amazon Gift Card",  points: 1250,  value: 25 },
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

function hasEarned(type: PointEvent["type"], refId: string): boolean {
  return getLedger().some((e) => e.type === type && e.refId === refId);
}

export function awardPoints(
  type: PointEvent["type"],
  label: string,
  refId: string
): number {
  if (hasEarned(type, refId)) return 0;
  const points = POINT_VALUES[type];
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
