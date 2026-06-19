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

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const todayDay = now.getDay(); // 0=Sun, 1=Mon ... 6=Sat
  const tomorrowDay = (todayDay + 1) % 7;

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, trash_day, trash_done_week")
    .not("trash_day", "is", null);

  if (!profiles?.length) return NextResponse.json({ sent: 0 });

  const weekKey = `${now.getFullYear()}-W${Math.ceil((now.getDate() - now.getDay() + 1 + 6) / 7)}`;

  let sent = 0;
  for (const profile of profiles) {
    const trashDay = profile.trash_day; // 0-6

    if (profile.trash_done_week === weekKey) continue;

    const isDayBefore = tomorrowDay === trashDay;
    const isDayOf = todayDay === trashDay;

    if (!isDayBefore && !isDayOf) continue;

    const { data: sub } = await supabase
      .from("push_subscriptions")
      .select("subscription")
      .eq("user_id", profile.id)
      .single();

    if (!sub) continue;

    try {
      await webpush.sendNotification(
        JSON.parse(sub.subscription),
        JSON.stringify({
          title: isDayBefore ? "🗑️ Trash day tomorrow!" : "🗑️ Don't forget trash today!",
          body: isDayBefore
            ? "Set out your trash & recycling tonight before bed."
            : "Have you set out your trash & recycling yet?",
          url: "/home?trash=reminder",
          actions: [{ action: "done", title: "✓ Done!" }],
        })
      );
      sent++;
    } catch (e) {
      console.error("Push failed for", profile.id, e);
    }
  }

  return NextResponse.json({ sent });
}
