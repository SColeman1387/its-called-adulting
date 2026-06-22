"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { TASKS, CATEGORIES } from "@/lib/data";
import { recordCompletion, getTaskStreak, getCompletionCount, getLastCompletion } from "@/lib/streaks";
import { awardPoints } from "@/lib/points";
import { TASK_SUPPLIES } from "@/lib/supplies";
import { getProfile } from "@/lib/profile";
import TipSubmitter from "@/components/TipSubmitter";
import CommunityTips from "@/components/CommunityTips";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TaskPage() {
  const { id } = useParams();
  const task = TASKS.find((t) => t.id === id);
  const [mode, setMode] = useState<"choose" | "diy" | "pro">("choose");
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [completed, setCompleted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [count, setCount] = useState(0);
  const [lastDone, setLastDone] = useState<Date | null>(null);
  const [showUpsell, setShowUpsell] = useState(false);
  const [isSubscriber, setIsSubscriber] = useState(false);
  const profile = getProfile();
  const userCity = profile?.city || profile?.state || "your area";

  useEffect(() => {
    if (!task) return;
    setStreak(task.checkInterval ? getTaskStreak(task.id, task.checkInterval) : 0);
    setCount(getCompletionCount(task.id));
    setLastDone(getLastCompletion(task.id));
    // Check subscription status
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase.from("profiles").select("is_subscribed").eq("id", data.user.id).single().then(({ data: p }) => {
        setIsSubscriber(!!p?.is_subscribed);
      });
    });
  }, [task]);

  const markComplete = () => {
    if (!task) return;
    recordCompletion(task.id);
    awardPoints("task_complete", task.title, task.id);
    setCompleted(true);
    setCount((c) => c + 1);
    const newStreak = task.checkInterval ? getTaskStreak(task.id, task.checkInterval) : 0;
    setStreak(newStreak);
    // Show upsell to non-subscribers after first completion
    if (!isSubscriber) setTimeout(() => setShowUpsell(true), 800);
  };

  if (!task) {
    return <div className="p-8 text-center text-gray-500">Task not found.</div>;
  }

  const category = CATEGORIES.find((c) => c.id === task.category);
  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(task.proSearchQuery)}&tbm=lcl`;

  const toggleStep = (i: number) => {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  return (
    <main className="max-w-2xl mx-auto px-4 pb-16">

      {/* Subscription upsell modal */}
      {showUpsell && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
            <div className="text-center mb-5">
              <div className="text-5xl mb-3">⭐</div>
              <h2 className="text-xl font-black text-gray-900 mb-1">You just earned points!</h2>
              <p className="text-sm text-gray-500">Subscribe to bank them — plus get <span className="font-bold text-orange-500">100 bonus Adulting Bucks</span> just for starting.</p>
            </div>
            <div className="bg-orange-50 rounded-2xl p-4 mb-5">
              <div className="space-y-2">
                {[
                  "Earn Adulting Bucks on every task",
                  "Redeem for real gift cards",
                  "100 bonus points when you subscribe today",
                  "Cancel anytime",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-orange-900">
                    <span className="text-orange-500 font-bold">✓</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center mb-3">
              <span className="text-2xl font-black text-gray-900">$4.99</span>
              <span className="text-sm text-gray-400">/month</span>
            </div>
            <Link
              href="/rewards"
              onClick={() => setShowUpsell(false)}
              className="block w-full py-4 bg-orange-500 text-white font-bold rounded-2xl text-center hover:bg-orange-600 transition-colors mb-3"
            >
              Start earning → Get 100 bonus points
            </Link>
            <button
              onClick={() => setShowUpsell(false)}
              className="w-full text-sm text-gray-400 hover:text-gray-600 py-2"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="pt-8 pb-4">
        <Link href={`/category/${task.category}`} className="text-sm text-orange-600 font-medium mb-4 inline-block">
          ← {category?.label}
        </Link>
        <div className="flex items-start gap-3">
          <span className="text-4xl">{category?.icon}</span>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
            <div className="flex gap-2 mt-1 flex-wrap items-center">
              <span className="text-xs text-gray-500">⏱ {task.timeEstimate}</span>
              <span className="text-xs text-gray-300">•</span>
              <span className="text-xs text-gray-500 capitalize">{task.difficulty} difficulty</span>
              {task.season !== "year-round" && (
                <>
                  <span className="text-xs text-gray-300">•</span>
                  <span className="text-xs text-gray-500 capitalize">{task.season} task</span>
                </>
              )}
            </div>
            {/* Streak & completion badges */}
            <div className="flex gap-2 mt-2 flex-wrap">
              {streak >= 2 && (
                <span className="text-xs bg-orange-100 text-orange-700 font-bold px-2.5 py-1 rounded-full">
                  🔥 {streak}× streak
                </span>
              )}
              {count > 0 && (
                <span className="text-xs bg-green-100 text-green-700 font-bold px-2.5 py-1 rounded-full">
                  ✓ Done {count}× total
                </span>
              )}
              {lastDone && (
                <span className="text-xs bg-gray-100 text-gray-500 font-medium px-2.5 py-1 rounded-full">
                  Last: {lastDone.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              )}
            </div>
          </div>
        </div>
        <p className="text-gray-600 text-sm mt-3">{task.description}</p>
      </div>

      {/* "How was I supposed to know that?" — the backbone */}
      <div className="mb-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-100 p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base">💡</span>
          <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">How was I supposed to know that?</span>
        </div>
        <p className="text-sm text-gray-800 leading-relaxed font-medium">{task.howDidIKnow}</p>
      </div>

      {/* Mode chooser */}
      {mode === "choose" && (
        <div className="mt-6 space-y-3">
          <p className="text-sm font-semibold text-gray-700 mb-4">How do you want to handle this?</p>

          <button
            onClick={() => setMode("diy")}
            className="w-full flex items-center gap-4 p-5 bg-white rounded-2xl border-2 border-gray-100 hover:border-orange-300 hover:shadow-md transition-all text-left"
          >
            <span className="text-3xl">🔨</span>
            <div>
              <div className="font-semibold text-gray-900">I&apos;ll do it myself</div>
              <div className="text-xs text-gray-500 mt-0.5">Step-by-step guide with tools needed</div>
            </div>
          </button>

          <button
            onClick={() => setMode("pro")}
            className="w-full flex items-center gap-4 p-5 bg-white rounded-2xl border-2 border-gray-100 hover:border-blue-300 hover:shadow-md transition-all text-left"
          >
            <span className="text-3xl">📞</span>
            <div>
              <div className="font-semibold text-gray-900">Find a pro near me</div>
              <div className="text-xs text-gray-500 mt-0.5">4–5 star local businesses in Columbus, OH</div>
            </div>
          </button>
        </div>
      )}

      {/* DIY Guide */}
      {mode === "diy" && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 text-lg">DIY Guide</h2>
            <button onClick={() => { setMode("choose"); setCheckedSteps(new Set()); }} className="text-xs text-gray-400 hover:text-gray-600">
              ← Change
            </button>
          </div>

          {/* Tools needed */}
          <div className="bg-yellow-50 rounded-2xl p-4 mb-4">
            <h3 className="text-xs font-semibold text-yellow-800 uppercase tracking-wide mb-2">🧰 What You&apos;ll Need</h3>
            <ul className="space-y-1">
              {task.diyGuide.toolsNeeded.map((tool, i) => (
                <li key={i} className="text-sm text-yellow-900">• {tool}</li>
              ))}
            </ul>
          </div>

          {/* Intro */}
          <div className="bg-blue-50 rounded-2xl p-4 mb-4">
            <p className="text-sm text-blue-900">{task.diyGuide.intro}</p>
          </div>

          {/* Steps */}
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Steps</h3>
          <div className="space-y-2 mb-6">
            {task.diyGuide.steps.map((step, i) => (
              <button
                key={i}
                onClick={() => toggleStep(i)}
                className={`w-full flex items-start gap-3 p-4 rounded-2xl text-left transition-all border ${
                  checkedSteps.has(i)
                    ? "bg-green-50 border-green-200"
                    : "bg-white border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs font-bold transition-colors ${
                  checkedSteps.has(i)
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-gray-300 text-gray-400"
                }`}>
                  {checkedSteps.has(i) ? "✓" : i + 1}
                </div>
                <span className={`text-sm ${checkedSteps.has(i) ? "text-gray-400 line-through" : "text-gray-700"}`}>
                  {step}
                </span>
              </button>
            ))}
          </div>

          {/* Supplies you'll need */}
          {TASK_SUPPLIES[task.id] && (
            <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-6 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">🛒 You'll Need</h3>
              <div className="space-y-3">
                {TASK_SUPPLIES[task.id].map((supply) => (
                  <div key={supply.name} className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{supply.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{supply.note}</p>
                    </div>
                    <a
                      href={supply.amazonUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 bg-[#FF9900] text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#e88a00] transition-colors"
                    >
                      {supply.price}
                    </a>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-300 mt-3 text-center">Amazon links · We may earn a small commission</p>
            </div>
          )}

          {/* Community tips */}
          <CommunityTips taskId={task.id} />

          {/* Tips */}
          <div className="bg-orange-50 rounded-2xl p-4 mb-6">
            <h3 className="text-xs font-semibold text-orange-800 uppercase tracking-wide mb-2">💡 Pro Tips</h3>
            <ul className="space-y-2">
              {task.diyGuide.tips.map((tip, i) => (
                <li key={i} className="text-sm text-orange-900">• {tip}</li>
              ))}
            </ul>
          </div>

          {/* Progress */}
          {task.diyGuide.steps.length > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{checkedSteps.size} / {task.diyGuide.steps.length} steps</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${(checkedSteps.size / task.diyGuide.steps.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          <button
            onClick={() => setMode("pro")}
            className="w-full text-center text-sm text-blue-600 font-medium py-3 border border-blue-100 rounded-2xl hover:bg-blue-50 transition-colors"
          >
            Changed your mind? Find a pro instead →
          </button>

          {checkedSteps.size === task.diyGuide.steps.length && task.diyGuide.steps.length > 0 && !completed && (
            <button
              onClick={markComplete}
              className="w-full mt-3 py-4 bg-green-500 text-white font-bold rounded-2xl hover:bg-green-600 transition-colors"
            >
              ✓ Mark as complete
            </button>
          )}
          {completed && (
            <div className="mt-3 py-4 bg-green-50 border border-green-200 rounded-2xl text-center">
              <span className="text-green-600 font-bold text-sm">✓ Completed — nice work!</span>
            </div>
          )}

          <div className="mt-4">
            <TipSubmitter taskId={task.id} taskTitle={task.title} />
          </div>
        </div>
      )}

      {/* Find a Pro */}
      {mode === "pro" && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 text-lg">Find a Pro</h2>
            <button onClick={() => setMode("choose")} className="text-xs text-gray-400 hover:text-gray-600">
              ← Change
            </button>
          </div>

          <div className="bg-blue-50 rounded-2xl p-4 mb-4">
            <p className="text-sm text-blue-900">
              We&apos;re showing you top-rated local businesses near {userCity} for this job. Look for 4–5 star ratings and recent reviews.
            </p>
          </div>

          {/* Google Local Search embed prompt */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">📍</span>
              <div>
                <div className="font-semibold text-gray-900 text-sm">Local Businesses Near You</div>
                <div className="text-xs text-gray-500">{userCity} · 4–5 star rated</div>
              </div>
            </div>
            <a
              href={googleSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-blue-600 text-white text-sm font-semibold py-3 rounded-xl text-center hover:bg-blue-700 transition-colors"
            >
              🔍 Search for &quot;{task.proSearchQuery}&quot;
            </a>
            <p className="text-xs text-gray-400 mt-2 text-center">Opens Google Maps with local ratings and reviews</p>
          </div>

          {/* Contact options */}
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Once You Find a Business</h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <div className="text-2xl mb-2">📧</div>
              <div className="text-sm font-semibold text-gray-900">Request a Quote</div>
              <div className="text-xs text-gray-500 mt-1">Send an email from their listing</div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <div className="text-2xl mb-2">📞</div>
              <div className="text-sm font-semibold text-gray-900">Call Directly</div>
              <div className="text-xs text-gray-500 mt-1">Tap their number in Google</div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">What to say when you call</h3>
            <p className="text-sm text-gray-700 italic">
              &quot;Hi, I&apos;m looking to get my {task.title.toLowerCase()} done. Can you give me a rough estimate and your earliest availability?&quot;
            </p>
          </div>

          <button
            onClick={() => setMode("diy")}
            className="w-full text-center text-sm text-orange-600 font-medium py-3 border border-orange-100 rounded-2xl hover:bg-orange-50 transition-colors"
          >
            Want to try it yourself? See the DIY guide →
          </button>
        </div>
      )}
    </main>
  );
}
