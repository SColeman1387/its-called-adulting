import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const now = new Date();
  const weekKey = `${now.getFullYear()}-W${Math.ceil((now.getDate() - now.getDay() + 1 + 6) / 7)}`;

  await supabase.from("profiles").update({ trash_done_week: weekKey }).eq("id", userId);

  return NextResponse.json({ ok: true });
}
