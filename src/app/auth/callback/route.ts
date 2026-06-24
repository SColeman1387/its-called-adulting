import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Apply referral if the user signed up via a ref code
      const refCode = data.user.user_metadata?.referral_code;
      if (refCode) {
        // Find the referrer and create the referral record
        const { data: referrer } = await supabase
          .from("profiles")
          .select("id")
          .eq("referral_code", refCode)
          .single();

        if (referrer) {
          await supabaseAdmin.from("referrals").insert({
            referrer_id: referrer.id,
            referred_id: data.user.id,
          });
          await supabaseAdmin
            .from("profiles")
            .update({ referred_by: referrer.id })
            .eq("id", data.user.id);
          // Award +50 points to the referrer
          const ledgerId = `referral_${referrer.id}_${data.user.id}`;
          const { data: existing } = await supabaseAdmin
            .from("points_ledger")
            .select("id")
            .eq("id", ledgerId)
            .maybeSingle();
          if (!existing) {
            await supabaseAdmin.from("points_ledger").insert({
              id: ledgerId,
              user_id: referrer.id,
              type: "referral",
              points: 100,
              label: `Friend joined — referral bonus`,
            });
          }
        }
      }

      // Update display name from metadata
      const displayName = data.user.user_metadata?.display_name;
      if (displayName) {
        await supabase
          .from("profiles")
          .update({ display_name: displayName })
          .eq("id", data.user.id);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=auth_callback_failed`);
}
