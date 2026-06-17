"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { getSupabase } from "@/lib/supabase";

export default function SharePage() {
  const { user, loading } = useAuth();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralCount, setReferralCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [shareMode, setShareMode] = useState<"friend" | "parent">("friend");

  useEffect(() => {
    if (!user) return;
    const supabase = getSupabase();

    supabase
      .from("profiles")
      .select("referral_code")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.referral_code) setReferralCode(data.referral_code);
      });

    supabase
      .from("referrals")
      .select("id", { count: "exact" })
      .eq("referrer_id", user.id)
      .then(({ count }) => setReferralCount(count ?? 0));
  }, [user]);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const friendLink = `${baseUrl}/auth?ref=${referralCode}`;
  const parentLink = `${baseUrl}/auth?ref=${referralCode}&mode=parent`;

  const copyLink = async (link: string) => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareNative = (link: string, text: string) => {
    if (navigator.share) {
      navigator.share({ title: "It's Called Adulting", text, url: link });
    } else {
      copyLink(link);
    }
  };

  if (loading) return null;

  if (!user) {
    return (
      <main className="max-w-sm mx-auto px-6 pt-20 text-center">
        <div className="text-5xl mb-4">🔗</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Sign in to share</h1>
        <p className="text-gray-500 text-sm mb-6">Create an account to get your personal referral link and earn rewards.</p>
        <Link href="/auth?redirect=/share" className="inline-block bg-orange-500 text-white font-bold px-6 py-3 rounded-2xl text-sm">
          Create account →
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 pb-24">
      <div className="pt-8 pb-4">
        <Link href="/home" className="text-sm text-orange-600 font-medium mb-4 inline-block">← Home</Link>
        <h1 className="text-2xl font-bold text-gray-900">Share the App</h1>
        <p className="text-gray-500 text-sm mt-1">
          Every friend who joins counts toward your rewards. Parents — this is the perfect gift for a kid heading into the real world.
        </p>
      </div>

      {/* Referral count */}
      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-6 flex items-center gap-4">
        <div className="text-4xl font-black text-orange-500">{referralCount}</div>
        <div>
          <div className="font-bold text-gray-900 text-sm">Friends joined so far</div>
          <div className="text-xs text-gray-500 mt-0.5">
            {referralCount === 0
              ? "Share your link below to get started"
              : referralCount >= 3
              ? "Amazing — you're building a crew 🙌"
              : "Keep going — 3 referrals unlocks Tier 1 reward credit"}
          </div>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex bg-gray-100 rounded-2xl p-1 mb-5">
        <button
          onClick={() => setShareMode("friend")}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${shareMode === "friend" ? "bg-white shadow-sm text-gray-900" : "text-gray-400"}`}
        >
          Share with a friend
        </button>
        <button
          onClick={() => setShareMode("parent")}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${shareMode === "parent" ? "bg-white shadow-sm text-gray-900" : "text-gray-400"}`}
        >
          Send to my kid
        </button>
      </div>

      {shareMode === "friend" && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Your referral link</h3>
            <div className="flex gap-2">
              <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5 text-xs text-gray-500 font-mono truncate border border-gray-100">
                {referralCode ? friendLink : "Loading..."}
              </div>
              <button
                onClick={() => copyLink(friendLink)}
                className="px-4 py-2.5 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-700 transition-colors shrink-0"
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>
          </div>

          <button
            onClick={() => shareNative(friendLink, "This app is actually useful — it's got step-by-step guides for all the adult stuff nobody teaches you. Check it out 👇")}
            className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl text-sm hover:bg-orange-600 transition-colors"
          >
            📤 Share with a friend
          </button>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">How rewards work</h3>
            <ul className="space-y-2 text-sm text-blue-900">
              <li className="flex gap-2"><span className="font-bold">3 referrals</span><span className="text-blue-600">→ counts toward Tier 1 reward eligibility</span></li>
              <li className="flex gap-2"><span className="font-bold">5 referrals</span><span className="text-blue-600">→ jump-starts your Tier 2 reward unlock</span></li>
            </ul>
          </div>
        </div>
      )}

      {shareMode === "parent" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white">
            <div className="text-3xl mb-2">👨‍👩‍👧</div>
            <h3 className="font-bold text-lg leading-tight mb-2">For parents of future adults</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Is your kid about to graduate, move out, or head to college? This app teaches them everything from changing a tire to reading a lease — on their own schedule, without having to ask you every time.
            </p>
            <p className="text-slate-400 text-xs mt-3">
              Once they join, you can link accounts to see their progress and know they&apos;re building real skills.
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Share link</h3>
            <div className="flex gap-2">
              <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5 text-xs text-gray-500 font-mono truncate border border-gray-100">
                {referralCode ? parentLink : "Loading..."}
              </div>
              <button
                onClick={() => copyLink(parentLink)}
                className="px-4 py-2.5 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-700 transition-colors shrink-0"
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>
          </div>

          <button
            onClick={() => shareNative(parentLink, "Hey — I found this app called It's Called Adulting. It walks you through all the real-world stuff nobody teaches you. Thought you'd actually use it 👇")}
            className="w-full py-4 bg-slate-800 text-white font-bold rounded-2xl text-sm hover:bg-slate-900 transition-colors"
          >
            📲 Send to my kid
          </button>

          <Link
            href="/parent"
            className="block w-full py-4 bg-orange-50 border border-orange-200 text-orange-700 font-bold rounded-2xl text-sm text-center hover:bg-orange-100 transition-colors"
          >
            👀 Set up parent dashboard →
          </Link>
        </div>
      )}
    </main>
  );
}
