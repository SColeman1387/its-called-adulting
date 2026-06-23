import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  const priceId = process.env.STRIPE_PRICE_ID ?? "";
  return NextResponse.json({
    keyPrefix: key.substring(0, 12),
    keyLength: key.length,
    priceIdPrefix: priceId.substring(0, 12),
    priceIdLength: priceId.length,
  });
}
