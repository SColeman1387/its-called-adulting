export interface TaskCompletion {
  taskId: string;
  completedAt: string; // ISO
  mileageAtCompletion?: number;
}

const KEY = "ica_completions";

export function getCompletions(): TaskCompletion[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
}

export function recordCompletion(taskId: string, mileage?: number): void {
  const all = getCompletions();
  all.push({ taskId, completedAt: new Date().toISOString(), mileageAtCompletion: mileage });
  localStorage.setItem(KEY, JSON.stringify(all));
  // Also keep the old simple list in sync for the homepage badge count
  const simple: string[] = JSON.parse(localStorage.getItem("ica_completed_tasks") || "[]");
  if (!simple.includes(taskId)) simple.push(taskId);
  localStorage.setItem("ica_completed_tasks", JSON.stringify(simple));
}

// How many times this task has been completed
export function getCompletionCount(taskId: string): number {
  return getCompletions().filter((c) => c.taskId === taskId).length;
}

// Last completion date for a task
export function getLastCompletion(taskId: string): Date | null {
  const all = getCompletions()
    .filter((c) => c.taskId === taskId)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  return all.length > 0 ? new Date(all[0].completedAt) : null;
}

// Streak = number of consecutive on-schedule completions
// intervalDays: expected interval between completions (e.g. 30 for monthly)
// A completion counts toward the streak if it was within 1.5× the interval of the previous one
export function getTaskStreak(taskId: string, intervalDays: number): number {
  const completions = getCompletions()
    .filter((c) => c.taskId === taskId)
    .map((c) => new Date(c.completedAt).getTime())
    .sort((a, b) => b - a); // newest first

  if (completions.length === 0) return 0;

  let streak = 1;
  const window = intervalDays * 1.5 * 24 * 60 * 60 * 1000; // grace = 50% over interval

  for (let i = 0; i < completions.length - 1; i++) {
    const gap = completions[i] - completions[i + 1];
    if (gap <= window) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// Is this task due based on its interval?
export function isTaskDue(taskId: string, intervalDays: number): boolean {
  const last = getLastCompletion(taskId);
  if (!last) return true;
  const daysSince = (Date.now() - last.getTime()) / (24 * 60 * 60 * 1000);
  return daysSince >= intervalDays;
}

// Days until/overdue
export function getDaysUntilDue(taskId: string, intervalDays: number): number {
  const last = getLastCompletion(taskId);
  if (!last) return 0;
  const daysSince = (Date.now() - last.getTime()) / (24 * 60 * 60 * 1000);
  return Math.round(intervalDays - daysSince);
}
