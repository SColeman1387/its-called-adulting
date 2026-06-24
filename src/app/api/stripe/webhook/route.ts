import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const subscription = event.data.object as Stripe.Subscription;

  switch (event.type) {
    case "checkout.session.completed": {
      const userId = session.metadata?.userId;
      if (!userId) break;
      await supabaseAdmin
        .from("profiles")
        .update({
          subscription_status: "active",
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
        })
        .eq("id", userId);
      // Award 100 bonus points for subscribing — only once per user
      const { data: existing } = await supabaseAdmin
        .from("points_ledger")
        .select("id")
        .eq("user_id", userId)
        .eq("type", "signup_bonus")
        .maybeSingle();
      if (!existing) {
        await supabaseAdmin.from("points_ledger").insert({
          id: `signup_bonus_${userId}`,
          user_id: userId,
          type: "signup_bonus",
          points: 100,
          label: "Welcome bonus — subscribed to Adulting Pro",
        });
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const status = subscription.status === "active" ? "active" : "inactive";
      await supabaseAdmin
        .from("profiles")
        .update({ subscription_status: status })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
