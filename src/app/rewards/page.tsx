"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getTotalPoints, getLedgerEntries, deductPoints, GIFT_CARD_TIERS, POINT_VALUES, PointEvent, getMonthlyRemaining, MONTHLY_EARN_CAP } from "@/lib/points";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
import { useSubscription } from "@/lib/useSubscription";

const TYPE_LABELS: Record<PointEvent["type"], string> = {
  task_complete:   "✅ Completed a task",
  lesson_complete: "📖 Weekly lesson",
  tool_acquired:   "🔧 Added a tool",
  referral:        "👋 Referred a friend",
  signup:          "🎉 Joined the app",
};

export default function RewardsPage() {
  const { user } = useAuth();
  const { status: subStatus, stripeCustomerId } = useSubscription();
  const [points, setPoints] = useState(0);
  const [ledger, setLedger] = useState<PointEvent[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [step, setStep] = useState<"choose" | "confirm" | "done">("choose");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Start with localStorage points
    const localPoints = getTotalPoints();
    const localLedger = getLedgerEntries();
    setPoints(localPoints);
    setLedger(localLedger);

    // Merge with Supabase points_ledger for logged-in users
    if (!user) return;
    const supabase = getSupabase();
    supabase
      .from("points_ledger")
      .select("id, type, points, label, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!data || data.length === 0) return;
        const dbTotal = data.reduce((sum, r) => sum + (r.points ?? 0), 0);
        const dbLedger: PointEvent[] = data.map((r) => ({
          id: r.id,
          type: r.type as PointEvent["type"],
          points: r.points,
          label: r.label ?? r.type,
          ts: r.created_at,
        }));
        // Combine: DB points + local points, deduplicate by id
        const localIds = new Set(localLedger.map((e) => e.id));
        const merged = [...dbLedger.filter((e) => !localIds.has(e.id)), ...localLedger];
        merged.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
        setPoints(localPoints + dbTotal);
        setLedger(merged);
      });
  }, [user]);

  const selectedTier = GIFT_CARD_TIERS.find((t) => t.id === selected);

  const handleRedeem = async () => {
    if (!selectedTier) return;
    if (!email.trim()) { setError("Enter your email so we can send the code."); return; }
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/rewards/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user?.id ?? null,
        tierId: selectedTier.id,
        tierLabel: selectedTier.label,
        points: selectedTier.points,
        email: email.trim(),
      }),
    });

    if (!res.ok) {
      setError("Something went wrong. Try again.");
      setSubmitting(false);
      return;
    }

    deductPoints(selectedTier.points, `Redeemed ${selectedTier.label}`);
    setPoints(getTotalPoints());
    setLedger(getLedgerEntries());
    setStep("done");
    setSubmitting(false);
  };

  return (
    <main className="max-w-lg mx-auto px-4 pb-24">

      {/* Header */}
      <div className="pt-8 pb-2">
        <Link href="/home" className="text-sm text-orange-600 font-medium mb-4 inline-block">← Home</Link>
        <h1 className="text-2xl font-bold text-gray-900">Adulting Bucks</h1>
        <p className="text-gray-400 text-sm mt-1">Earn points, redeem for gift cards.</p>
      </div>

      {/* Paywall for non-subscribers */}
      {subStatus !== "loading" && subStatus !== "active" && (
        <div className="bg-[#0f1f3d] rounded-3xl p-7 mt-4 mb-2 text-white text-center">
          <div className="text-4xl mb-3">⭐</div>
          <h2 className="text-xl font-black mb-2">Adulting Pro — $4.99/mo</h2>
          <p className="text-blue-200 text-sm leading-relaxed mb-5">
            Earn Adulting Bucks for every task, lesson, and tool. Redeem for real gift cards — automatically sent to your inbox.
          </p>
          <ul className="text-left space-y-2 mb-6">
            {[
              "Earn points for every task completed",
              "Earn points for weekly lessons",
              "Redeem for gift cards",
              "Gift cards sent automatically — no waiting",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-white/90">
                <span className="text-orange-400 font-bold mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <button
            onClick={async () => {
              try {
                const res = await fetch("/api/stripe/checkout", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ userId: user?.id, email: user?.email, redirectUrl: window.location.origin }),
                });
                const json = await res.json();
                if (!res.ok) throw new Error(json.error || `API error ${res.status}`);
                if (json.url) window.location.href = json.url;
                else throw new Error("No checkout URL returned");
              } catch (err) {
                console.error("Checkout error:", err);
                alert("Checkout error: " + (err instanceof Error ? err.message : String(err)));
              }
            }}
            className="w-full py-4 bg-orange-500 text-white font-black rounded-2xl hover:bg-orange-600 transition-colors text-base"
          >
            Start Adulting Pro — $4.99/mo →
          </button>
          <p className="text-xs text-blue-300 mt-3">Cancel anytime. No contracts.</p>
        </div>
      )}

      {/* Manage subscription link for active subscribers */}
      {subStatus === "active" && stripeCustomerId && (
        <div className="mt-4 mb-2 text-center">
          <button
            onClick={async () => {
              const res = await fetch("/api/stripe/portal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ customerId: stripeCustomerId }),
              });
              const json = await res.json();
              if (json.url) window.location.href = json.url;
              else alert("Could not open billing portal: " + (json.error ?? "unknown error"));
            }}
            className="text-xs text-gray-400 underline"
          >
            Manage or cancel subscription
          </button>
        </div>
      )}

      {/* Subscriber content */}
      {subStatus === "active" && <>
      <div className="bg-[#0f1f3d] rounded-3xl p-6 mt-4 mb-6 text-white text-center">
        <p className="text-sm text-blue-300 font-semibold uppercase tracking-widest mb-1">Your balance</p>
        <p className="text-6xl font-black mb-1">{points.toLocaleString()}</p>
        <p className="text-blue-300 text-sm">Adulting Bucks</p>
        <div className="mt-4 bg-white/10 rounded-xl px-4 py-2">
          <p className="text-xs text-blue-200">
            {getMonthlyRemaining() > 0
              ? <>{getMonthlyRemaining()} of {MONTHLY_EARN_CAP} pts remaining to earn this month</>
              : <>Monthly limit reached — resets next month</>}
          </p>
          <div className="w-full bg-white/20 rounded-full h-1.5 mt-1.5">
            <div
              className="bg-orange-400 h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min(100, ((MONTHLY_EARN_CAP - getMonthlyRemaining()) / MONTHLY_EARN_CAP) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* How to earn */}
      <div className="bg-gray-50 rounded-2xl p-5 mb-6">
        <h2 className="text-sm font-bold text-gray-700 mb-3">How to earn</h2>
        <div className="space-y-2">
          {(Object.entries(POINT_VALUES) as [PointEvent["type"], number][]).map(([type, pts]) => (
            <div key={type} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{TYPE_LABELS[type]}</span>
              <span className="font-bold text-orange-500">+{pts} pts</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gift card tiers */}
      <h2 className="text-base font-bold text-gray-900 mb-3">Redeem for gift cards</h2>
      <div className="space-y-3 mb-6">
        {GIFT_CARD_TIERS.map((tier) => {
          const canAfford = points >= tier.points;
          const ptsNeeded = tier.points - points;
          return (
            <button
              key={tier.id}
              onClick={() => canAfford && setSelected(tier.id)}
              className={`w-full text-left rounded-2xl border-2 p-5 transition-all ${
                selected === tier.id
                  ? "border-orange-500 bg-orange-50"
                  : canAfford
                  ? "border-gray-100 bg-white hover:border-orange-200"
                  : "border-gray-100 bg-white opacity-50"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-gray-900">{tier.label}</span>
                {canAfford ? (
                  <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">Available</span>
                ) : (
                  <span className="text-xs bg-gray-100 text-gray-500 font-medium px-2 py-0.5 rounded-full">
                    Need {ptsNeeded.toLocaleString()} more
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400">{tier.points.toLocaleString()} Adulting Bucks</p>
            </button>
          );
        })}
      </div>

      {/* Redeem button */}
      {selected && step === "choose" && (
        <button
          onClick={() => setStep("confirm")}
          className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-colors"
        >
          Redeem {selectedTier?.label} →
        </button>
      )}

      {/* Confirm step */}
      {step === "confirm" && selectedTier && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-1">Confirm redemption</h3>
          <p className="text-sm text-gray-500 mb-4">
            We&apos;ll email you an gift card code within <strong>1–2 business days</strong>.
            This will deduct <strong>{selectedTier.points.toLocaleString()} points</strong> from your balance.
          </p>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
            Email to send the code to
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 mb-4"
          />
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          <div className="flex gap-3">
            <button
              onClick={() => setStep("choose")}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleRedeem}
              disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Confirm →"}
            </button>
          </div>
        </div>
      )}

      {/* Done state */}
      {step === "done" && (
        <div className="text-center py-8">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Request submitted!</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Your request is in. We&apos;ll send your gift card to <strong>{email}</strong> within 1–2 business days.
          </p>
          <Link href="/home" className="inline-block bg-orange-500 text-white font-bold px-8 py-3 rounded-2xl text-sm">
            Back to home →
          </Link>
        </div>
      )}

      {/* Points history */}
      {ledger.length > 0 && step === "choose" && (
        <div className="mt-8">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-sm text-gray-400 font-medium w-full text-center"
          >
            {showHistory ? "Hide" : "Show"} points history ({ledger.length} events)
          </button>
          {showHistory && (
            <div className="mt-4 space-y-2">
              {ledger.map((e) => (
                <div key={e.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50">
                  <div>
                    <p className="text-gray-700 font-medium">{e.label}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(e.ts).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <span className={`font-bold ${e.points > 0 ? "text-orange-500" : "text-gray-400"}`}>
                    {e.points > 0 ? "+" : ""}{e.points}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      </>}

    </main>
  );
}
