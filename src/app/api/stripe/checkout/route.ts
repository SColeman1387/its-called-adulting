import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const { userId, email, redirectUrl } = await req.json();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    customer_email: email ?? undefined,
    metadata: { userId: userId ?? "" },
    success_url: `${redirectUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://itscalledadulting.com"}/rewards?subscribed=1`,
    cancel_url:  `${redirectUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://itscalledadulting.com"}/rewards`,
  });

  return NextResponse.json({ url: session.url });
}
