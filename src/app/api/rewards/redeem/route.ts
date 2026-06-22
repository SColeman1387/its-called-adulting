import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TREMENDOUS_API_URL = process.env.TREMENDOUS_API_URL ?? "https://testflight.tremendous.com/api/v2";
const TREMENDOUS_API_KEY = process.env.TREMENDOUS_API_KEY!;

const TIER_AMOUNTS: Record<string, number> = {
  gc10: 10,
  gc25: 25,
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

export async function POST(req: NextRequest) {
  if (process.env.NEXT_PUBLIC_REWARDS_LIVE !== "true") {
    return NextResponse.json({ error: "Redemption not yet available." }, { status: 503 });
  }

  const { userId, tierId, tierLabel, points, email } = await req.json();
  if (!userId || !tierId || !email) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (isRateLimited(userId)) {
    return NextResponse.json({ error: "Too many redemptions. Please wait 24 hours." }, { status: 429 });
  }

  const amount = TIER_AMOUNTS[tierId];
  if (!amount) return NextResponse.json({ error: "Invalid tier" }, { status: 400 });

  // Verify user has enough points in DB before redeeming
  const { data: profile } = await supabase
    .from("profiles")
    .select("points")
    .eq("id", userId)
    .single();

  if (!profile || (profile.points ?? 0) < points) {
    return NextResponse.json({ error: "Insufficient points" }, { status: 403 });
  }

  // Send the gift card via Tremendous
  const tremendous = await fetch(`${TREMENDOUS_API_URL}/orders`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${TREMENDOUS_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      payment: { funding_source_id: "BALANCE" },
      rewards: [{
        value: { denomination: amount, currency_code: "USD" },
        delivery: { method: "EMAIL" },
        recipient: { email, name: email },
        products: ["AMAZON_GIFTCARD"],
      }],
    }),
  });

  const tremendousData = await tremendous.json();

  if (!tremendous.ok) {
    console.error("Tremendous error:", tremendousData);
    // Save as pending so admin can manually fulfill
    await supabase.from("rewards").insert({
      user_id: userId,
      tier: tierId,
      reward_choice: tierLabel,
      status: "pending_manual",
      ship_name: email,
      ship_address: "digital",
      ship_city: "digital",
      ship_state: "digital",
      ship_zip: "00000",
      tremendous_error: JSON.stringify(tremendousData),
    });
    return NextResponse.json({ ok: true, manual: true });
  }

  const orderId = tremendousData?.order?.id ?? null;

  // Save successful redemption
  await supabase.from("rewards").insert({
    user_id: userId,
    tier: tierId,
    reward_choice: tierLabel,
    status: "sent",
    ship_name: email,
    ship_address: "digital",
    ship_city: "digital",
    ship_state: "digital",
    ship_zip: "00000",
    tremendous_order_id: orderId,
  });

  return NextResponse.json({ ok: true, manual: false, orderId });
}
