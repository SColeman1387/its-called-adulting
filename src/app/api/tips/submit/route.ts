import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(req: NextRequest) {
  const { taskId, taskTitle, tip, location, userId } = await req.json();
  if (!taskId || !tip?.trim()) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // Fetch existing approved tips for this task to check duplicates
  const { data: existing } = await supabase
    .from("community_tips")
    .select("tip")
    .eq("task_id", taskId)
    .eq("status", "approved");

  const existingList = (existing ?? []).map((r: { tip: string }) => `- ${r.tip}`).join("\n");

  const prompt = `You are reviewing a user-submitted tip for a home adulting app called "It's Called Adulting". The app teaches 18-25 year olds practical life skills.

Task: "${taskTitle}"
Submitted tip: "${tip}"
${location ? `Submitter's location: ${location}` : ""}

${existingList ? `Existing approved tips for this task:\n${existingList}\n` : ""}

Review this tip and respond with ONLY valid JSON in this exact format:
{
  "verdict": "approve" | "reject",
  "reason": "one sentence reason",
  "improved_tip": "optional improved/cleaned up version of the tip (only if approving)",
  "is_location_specific": true | false,
  "quality_score": 1-10
}

Reject if: duplicate of existing tip, inappropriate/offensive, dangerous advice, spam, too vague (e.g. "be careful"), or unrelated to the task.
Approve if: genuinely useful, specific, safe, and adds value beyond what's already there.
Clean up grammar/spelling in improved_tip but keep the author's voice.`;

  let verdict = "pending_review";
  let improvedTip = tip.trim();
  let isLocationSpecific = false;

  try {
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });

    const text = (msg.content[0] as { type: string; text: string }).text;
    const parsed = JSON.parse(text);

    if (parsed.verdict === "approve") {
      verdict = "approved";
      improvedTip = parsed.improved_tip ?? tip.trim();
      isLocationSpecific = parsed.is_location_specific ?? false;
    } else {
      verdict = "rejected_ai";
    }
  } catch {
    // If Claude fails, fall back to manual review
    verdict = "pending_review";
  }

  const { error } = await supabase.from("community_tips").insert({
    task_id: taskId,
    task_title: taskTitle,
    tip: improvedTip,
    original_tip: tip.trim(),
    location: location?.trim() || null,
    is_location_specific: isLocationSpecific,
    status: verdict,
    submitted_by: userId ?? null,
    created_at: new Date().toISOString(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    ok: true,
    status: verdict,
    message: verdict === "approved"
      ? "Your tip was approved and is now live!"
      : verdict === "rejected_ai"
      ? "Thanks — this tip was too similar to an existing one or didn't meet our quality bar."
      : "Thanks! Your tip is under review and will appear soon.",
  });
}
