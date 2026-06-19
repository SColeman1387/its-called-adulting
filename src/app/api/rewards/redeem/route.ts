import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TREMENDOUS_API_URL = process.env.TREMENDOUS_API_URL ?? "https://testflight.tremendous.com/api/v2";
const TREMENDOUS_API_KEY = process.env.TREMENDOUS_API_KEY!;

// Map our tier IDs to dollar amounts
const TIER_AMOUNTS: Record<string, number> = {
  gc10: 10,
  gc25: 25,
};

export async function POST(req: NextRequest) {
  const { userId, tierId, tierLabel, points, email } = await req.json();
  if (!userId || !tierId || !email) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const amount = TIER_AMOUNTS[tierId];
  if (!amount) return NextResponse.json({ error: "Invalid tier" }, { status: 400 });

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
