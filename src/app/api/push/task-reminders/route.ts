import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Mirror of data.ts checkIntervals — keep in sync if tasks change
const RECURRING_TASKS: { id: string; title: string; intervalDays: number }[] = [
  { id: "tire-pressure", title: "Check Tire Pressure", intervalDays: 30 },
  { id: "oil-change", title: "Oil Change", intervalDays: 90 },
  { id: "air-filter", title: "Replace Air Filter", intervalDays: 90 },
  { id: "rotate-tires", title: "Rotate Tires", intervalDays: 150 },
  { id: "wiper-blades", title: "Replace Wiper Blades", intervalDays: 180 },
  { id: "hvac-filter", title: "Replace HVAC Filter", intervalDays: 90 },
  { id: "gutter-cleaning", title: "Clean Gutters", intervalDays: 180 },
  { id: "water-softener", title: "Add Water Softener Salt", intervalDays: 30 },
  { id: "pool-maintenance", title: "Pool Chemical Check", intervalDays: 7 },
  { id: "lawn-fertilize", title: "Fertilize Lawn", intervalDays: 60 },
  { id: "chimney", title: "Chimney Inspection", intervalDays: 365 },
  { id: "dryer-vent", title: "Clean Dryer Vent", intervalDays: 365 },
];

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get all users with push subscriptions
  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("user_id, subscription");

  if (!subs?.length) return NextResponse.json({ sent: 0 });

  const now = Date.now();
  let sent = 0;

  for (const sub of subs) {
    const userId = sub.user_id;

    // Get this user's task completions
    const { data: completions } = await supabase
      .from("task_completions")
      .select("task_id, completed_at")
      .eq("user_id", userId);

    const completionMap = new Map(
      (completions ?? []).map((c) => [c.task_id, new Date(c.completed_at).getTime()])
    );

    // Find tasks that are due (or overdue) for this user
    const dueTasks: typeof RECURRING_TASKS = [];
    for (const task of RECURRING_TASKS) {
      const lastDone = completionMap.get(task.id);
      if (!lastDone) continue; // never done — don't remind, let home screen surface it
      const daysSince = (now - lastDone) / (1000 * 60 * 60 * 24);
      if (daysSince >= task.intervalDays) {
        dueTasks.push(task);
      }
    }

    if (!dueTasks.length) continue;

    // Send one notification listing what's due (not one per task — avoid spam)
    const title = dueTasks.length === 1
      ? `⏰ ${dueTasks[0].title} is due`
      : `⏰ ${dueTasks.length} tasks due on your list`;
    const body = dueTasks.length === 1
      ? "Tap to see what needs to get done."
      : dueTasks.slice(0, 3).map((t) => t.title).join(", ") + (dueTasks.length > 3 ? " & more" : "");

    try {
      await webpush.sendNotification(
        JSON.parse(sub.subscription),
        JSON.stringify({ title, body, url: "/home" })
      );
      sent++;
    } catch (e) {
      console.error("Push failed for", userId, e);
    }
  }

  return NextResponse.json({ sent });
}
