"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { getSupabase } from "@/lib/supabase";

const TIER1_THRESHOLD = 6;   // tools acquired
const TIER2_THRESHOLD = 12;  // all tools + 6 months

const TIER1_OPTIONS = [
  { id: "multi-tool", label: "Multi-Tool", emoji: "🔧", desc: "Pocket-sized, handles 12 jobs" },
  { id: "tire-inflator", label: "Tire Inflator", emoji: "💨", desc: "Cordless, fits in your trunk" },
];

const TIER2_OPTIONS = [
  { id: "drill", label: "Cordless Drill Kit", emoji: "🔩", desc: "20V, 2 batteries, charger included" },
  { id: "jump-pack", label: "Lithium Jump Pack", emoji: "⚡", desc: "Jump your car without another vehicle" },
  { id: "tire-inflator", label: "Premium Tire Inflator", emoji: "💨", desc: "Digital, auto-shutoff, with gauge" },
];

interface RewardRow {
  tier: string;
  reward_choice: string | null;
  status: string;
}

export default function RewardsPage() {
  const { user, loading } = useAuth();
  const [toolCount, setToolCount] = useState(0);
  const [monthsElapsed, setMonthsElapsed] = useState(0);
  const [rewards, setRewards] = useState<RewardRow[]>([]);
  const [redeeming, setRedeeming] = useState<"tier1" | "tier2" | null>(null);
  const [choice, setChoice] = useState("");
  const [form, setForm] = useState({ name: "", address: "", city: "", state: "", zip: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;
    const supabase = getSupabase();

    supabase
      .from("tool_acquisitions")
      .select("id", { count: "exact" })
      .eq("user_id", user.id)
      .then(({ count }) => setToolCount(count ?? 0));

    supabase
      .from("profiles")
      .select("created_at")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.created_at) {
          const created = new Date(data.created_at);
          const now = new Date();
          const months =
            (now.getFullYear() - created.getFullYear()) * 12 +
            (now.getMonth() - created.getMonth());
          setMonthsElapsed(months);
        }
      });

    supabase
      .from("rewards")
      .select("tier, reward_choice, status")
      .eq("user_id", user.id)
      .then(({ data }) => setRewards(data ?? []));
  }, [user]);

  const tier1Eligible = toolCount >= TIER1_THRESHOLD;
  const tier2Eligible = toolCount >= TIER2_THRESHOLD && monthsElapsed >= 6;
  const tier1Claimed = rewards.some((r) => r.tier === "tier1");
  const tier2Claimed = rewards.some((r) => r.tier === "tier2");

  const handleRedeem = async () => {
    if (!user || !redeeming || !choice) return;
    setSubmitting(true);
    const supabase = getSupabase();
    await supabase.from("rewards").insert({
      user_id: user.id,
      tier: redeeming,
      reward_choice: choice,
      status: "pending",
      ship_name: form.name,
      ship_address: form.address,
      ship_city: form.city,
      ship_state: form.state,
      ship_zip: form.zip,
      ship_phone: form.phone,
    });
    setSubmitting(false);
    setSuccess(true);
    setRedeeming(null);
  };

  if (loading) return null;

  if (!user) {
    return (
      <main className="max-w-sm mx-auto px-6 pt-20 text-center">
        <div className="text-5xl mb-4">🏆</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Sign in to view rewards</h1>
        <p className="text-gray-500 text-sm mb-6">Earn real tools by building your adulting toolkit.</p>
        <Link href="/auth?redirect=/rewards" className="inline-block bg-orange-500 text-white font-bold px-6 py-3 rounded-2xl text-sm">
          Create account →
        </Link>
      </main>
    );
  }

  if (success) {
    return (
      <main className="max-w-sm mx-auto px-6 pt-20 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Reward redeemed!</h1>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          We&apos;ll process your order and ship it to the address you provided. You&apos;ll hear from us within a few days.
        </p>
        <Link href="/home" className="inline-block bg-orange-500 text-white font-bold px-6 py-3 rounded-2xl text-sm">
          Back to home →
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 pb-24">
      <div className="pt-8 pb-4">
        <Link href="/home" className="text-sm text-orange-600 font-medium mb-4 inline-block">← Home</Link>
        <h1 className="text-2xl font-bold text-gray-900">Rewards</h1>
        <p className="text-gray-500 text-sm mt-1">Build your toolkit, earn real tools — on us.</p>
      </div>

      {/* Progress summary */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">Your toolkit progress</span>
          <span className="text-sm font-bold text-orange-600">{toolCount} / 12 tools</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="bg-orange-400 h-3 rounded-full transition-all"
            style={{ width: `${(toolCount / 12) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1.5">
          <span>Tier 1 at 6 tools</span>
          <span>Tier 2 at 12 tools + 6 months</span>
        </div>
      </div>

      {/* Tier 1 */}
      <div className={`rounded-2xl border-2 p-5 mb-4 ${tier1Eligible ? "border-orange-200 bg-orange-50" : "border-gray-100 bg-gray-50"}`}>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">🥈</span>
          <div>
            <div className="font-bold text-gray-900">Tier 1 Reward</div>
            <div className="text-xs text-gray-500">Acquire any 6 tools</div>
          </div>
          {tier1Claimed && <span className="ml-auto text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">✓ Claimed</span>}
          {tier1Eligible && !tier1Claimed && <span className="ml-auto text-xs bg-orange-500 text-white font-bold px-2 py-0.5 rounded-full">Ready!</span>}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          {TIER1_OPTIONS.map((opt) => (
            <div key={opt.id} className="bg-white rounded-xl p-3 border border-gray-100 text-center">
              <div className="text-2xl mb-1">{opt.emoji}</div>
              <div className="text-xs font-bold text-gray-900">{opt.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{opt.desc}</div>
            </div>
          ))}
        </div>

        {tier1Eligible && !tier1Claimed ? (
          <button
            onClick={() => setRedeeming("tier1")}
            className="w-full py-3 bg-orange-500 text-white font-bold rounded-xl text-sm hover:bg-orange-600 transition-colors"
          >
            Redeem Tier 1 reward →
          </button>
        ) : !tier1Eligible ? (
          <div className="text-center text-xs text-gray-400 py-2">
            {TIER1_THRESHOLD - toolCount} more tool{TIER1_THRESHOLD - toolCount !== 1 ? "s" : ""} to go
          </div>
        ) : null}
      </div>

      {/* Tier 2 */}
      <div className={`rounded-2xl border-2 p-5 mb-6 ${tier2Eligible ? "border-yellow-200 bg-yellow-50" : "border-gray-100 bg-gray-50"}`}>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">🥇</span>
          <div>
            <div className="font-bold text-gray-900">Tier 2 Reward</div>
            <div className="text-xs text-gray-500">All 12 tools + 6 months with the app</div>
          </div>
          {tier2Claimed && <span className="ml-auto text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">✓ Claimed</span>}
          {tier2Eligible && !tier2Claimed && <span className="ml-auto text-xs bg-yellow-500 text-white font-bold px-2 py-0.5 rounded-full">Ready!</span>}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          {TIER2_OPTIONS.map((opt) => (
            <div key={opt.id} className="bg-white rounded-xl p-3 border border-gray-100 text-center">
              <div className="text-2xl mb-1">{opt.emoji}</div>
              <div className="text-xs font-bold text-gray-900">{opt.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{opt.desc}</div>
            </div>
          ))}
        </div>

        {tier2Eligible && !tier2Claimed ? (
          <button
            onClick={() => setRedeeming("tier2")}
            className="w-full py-3 bg-yellow-500 text-white font-bold rounded-xl text-sm hover:bg-yellow-600 transition-colors"
          >
            Redeem Tier 2 reward →
          </button>
        ) : !tier2Eligible ? (
          <div className="text-center text-xs text-gray-400 py-2">
            {toolCount < 12 ? `${12 - toolCount} more tools` : `${6 - monthsElapsed} more months`} to unlock
          </div>
        ) : null}
      </div>

      {/* Redemption form sheet */}
      {redeeming && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setRedeeming(null)} />
          <div className="relative bg-white rounded-t-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 pt-5 pb-4 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Claim your {redeeming === "tier1" ? "Tier 1" : "Tier 2"} reward</h2>
              <button onClick={() => setRedeeming(null)} className="text-gray-400 text-2xl leading-none">×</button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Choose your reward</label>
                <div className="grid grid-cols-2 gap-2">
                  {(redeeming === "tier1" ? TIER1_OPTIONS : TIER2_OPTIONS).map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setChoice(opt.id)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${choice === opt.id ? "border-orange-400 bg-orange-50" : "border-gray-100 bg-white"}`}
                    >
                      <div className="text-2xl mb-1">{opt.emoji}</div>
                      <div className="text-xs font-bold text-gray-900">{opt.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {[
                { key: "name", label: "Full name", placeholder: "Jane Smith" },
                { key: "address", label: "Street address", placeholder: "123 Main St" },
                { key: "city", label: "City", placeholder: "Columbus" },
                { key: "state", label: "State", placeholder: "OH" },
                { key: "zip", label: "ZIP code", placeholder: "43215" },
                { key: "phone", label: "Phone (optional)", placeholder: "614-555-0100" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">{label}</label>
                  <input
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              ))}

              <button
                onClick={handleRedeem}
                disabled={!choice || !form.name || !form.address || !form.city || !form.zip || submitting}
                className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl text-sm hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Submit redemption →"}
              </button>
              <div className="h-2" />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
