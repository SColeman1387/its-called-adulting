import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TIER_AMOUNTS: Record<string, number> = {
  gc10: 10,
  gc25: 25,
};

const TIER_POINTS: Record<string, number> = {
  gc10: 500,
  gc25: 1250,
};

// In-memory rate limit: max 2 redemptions per userId per 24h window
const recentRedemptions = new Map<string, number[]>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const windowMs = 24 * 60 * 60 * 1000;
  const times = (recentRedemptions.get(userId) ?? []).filter(t => now - t < windowMs);
  if (times.length >= 2) return true;
  recentRedemptions.set(userId, [...times, now]);
  return false;
}

async function sendAdminNotification(opts: {
  userEmail: string;
  amount: number;
  tierId: string;
  userId: string;
  pointsAfter: number;
}) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return; // no email configured, skip silently

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "It's Called Adulting <noreply@itscalledadulting.com>",
      to: ["scoleman@musclemender.com"],
      subject: `🎁 Gift card request — $${opts.amount} for ${opts.userEmail}`,
      html: `
        <h2>New gift card redemption request</h2>
        <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
          <tr><td style="padding:6px 12px;font-weight:bold">User email</td><td style="padding:6px 12px">${opts.userEmail}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold">Amount</td><td style="padding:6px 12px">$${opts.amount} Amazon gift card</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold">User ID</td><td style="padding:6px 12px">${opts.userId}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold">Points remaining</td><td style="padding:6px 12px">${opts.pointsAfter}</td></tr>
        </table>
        <p style="margin-top:24px">
          <strong>To fulfill:</strong> Go to
          <a href="https://www.amazon.com/gift-cards/b?ie=UTF8&node=2238192011">amazon.com/gift-cards</a>,
          purchase a $${opts.amount} gift card, and email it to <strong>${opts.userEmail}</strong>.
        </p>
        <p style="color:#888;font-size:12px">It's Called Adulting admin notification</p>
      `,
    }),
  });
}

export async function POST(req: NextRequest) {
  const { userId, tierId, tierLabel, points, email } = await req.json();
  if (!userId || !tierId || !email) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (isRateLimited(userId)) {
    return NextResponse.json({ error: "Too many redemptions. Please wait 24 hours." }, { status: 429 });
  }

  const amount = TIER_AMOUNTS[tierId];
  if (!amount) return NextResponse.json({ error: "Invalid tier" }, { status: 400 });

  const requiredPoints = points ?? TIER_POINTS[tierId];

  // Verify user has enough points in DB before redeeming
  const { data: profile } = await supabase
    .from("profiles")
    .select("points")
    .eq("id", userId)
    .single();

  if (!profile || (profile.points ?? 0) < requiredPoints) {
    return NextResponse.json({ error: "Insufficient points" }, { status: 403 });
  }

  const pointsAfter = (profile.points ?? 0) - requiredPoints;

  // Deduct points
  await supabase
    .from("profiles")
    .update({ points: pointsAfter })
    .eq("id", userId);

  // Save redemption as pending manual fulfillment
  await supabase.from("rewards").insert({
    user_id: userId,
    tier: tierId,
    reward_choice: tierLabel ?? `$${amount} Amazon Gift Card`,
    status: "pending_manual",
    ship_name: email,
    ship_address: "digital",
    ship_city: "digital",
    ship_state: "digital",
    ship_zip: "00000",
  });

  // Notify admin to fulfill manually
  await sendAdminNotification({ userEmail: email, amount, tierId, userId, pointsAfter });

  return NextResponse.json({ ok: true, manual: true });
}
