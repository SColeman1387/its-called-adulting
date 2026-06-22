"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getProfile } from "@/lib/profile";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SubscribePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // If already subscribed, redirect to rewards
    const p = getProfile();
    // Redirect already-subscribed users (checked via Supabase below if needed)
  }, []);

  const startCheckout = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await supabase.auth.getUser();
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: data.user?.id ?? "",
          email: data.user?.email ?? "",
          redirectUrl: window.location.origin,
        }),
      });
      const json = await res.json();
      if (json.url) window.location.href = json.url;
      else throw new Error("No checkout URL returned");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-md w-full">

        {/* Back */}
        <Link href="/home" className="text-sm text-orange-500 font-medium mb-8 inline-block">
          ← Back to app
        </Link>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">

          {/* Header */}
          <div className="bg-orange-500 px-8 py-8 text-white text-center">
            <div className="text-4xl mb-3">⭐</div>
            <h1 className="text-2xl font-black mb-1">Adulting Pro</h1>
            <div className="text-orange-100 text-sm">Earn real rewards for growing up</div>
          </div>

          {/* Price */}
          <div className="px-8 pt-6 pb-2 text-center">
            <span className="text-5xl font-black text-gray-900">$4.99</span>
            <span className="text-gray-400 text-lg">/month</span>
            <p className="text-gray-400 text-xs mt-1">Cancel anytime. No contracts.</p>
          </div>

          {/* 20% progress bar */}
          <div className="mx-8 mb-2 bg-orange-50 rounded-2xl p-4 border border-orange-100">
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-gray-700">$10 Gift Card Progress</span>
              <span className="text-orange-500">100 / 500 pts</span>
            </div>
            <div className="w-full bg-orange-100 rounded-full h-2.5 mb-2">
              <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: "20%" }} />
            </div>
            <p className="text-xs text-orange-700 text-center font-medium">
              Subscribe now → instant 100 bonus points → already 20% of the way to your first gift card
            </p>
          </div>

          {/* Features */}
          <ul className="px-8 py-6 space-y-3">
            {[
              { icon: "🏆", text: "Earn Adulting Bucks for every task you complete" },
              { icon: "🎁", text: "Redeem points for gift cards — sent automatically" },
              { icon: "🔧", text: "Unlock a 12-tool starter toolkit over your first year" },
              { icon: "💡", text: "100 bonus points just for subscribing today" },
              { icon: "✅", text: "Everything in the free plan, forever" },
            ].map(({ icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <span className="text-lg shrink-0">{icon}</span>
                <span className="text-sm text-gray-700">{text}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="px-8 pb-8">
            {error && <p className="text-red-500 text-xs text-center mb-3">{error}</p>}
            <button
              onClick={startCheckout}
              disabled={loading}
              className="w-full bg-orange-500 text-white font-bold py-4 rounded-2xl text-base hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200 disabled:opacity-60"
            >
              {loading ? "Redirecting to checkout…" : "Start Adulting Pro →"}
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">
              Secure checkout via Stripe. Cancel anytime in Settings.
            </p>
          </div>
        </div>

        {/* Free plan reminder */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Just want the free plan?{" "}
          <Link href="/home" className="text-orange-500 font-medium hover:underline">
            Go to the app →
          </Link>
        </p>
      </div>
    </main>
  );
}
