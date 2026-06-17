"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TOOLS,
  Tool,
  getFirstOpenDate,
  getMonthsElapsed,
  getUnlockedTools,
  getFeaturedTool,
  getAcquiredTools,
  markToolAcquired,
  unmarkToolAcquired,
} from "@/lib/toolkit";
import { awardPoints } from "@/lib/points";

export default function ToolkitPage() {
  const [acquired, setAcquired] = useState<string[]>([]);
  const [monthsElapsed, setMonthsElapsed] = useState(0);
  const [firstOpen, setFirstOpen] = useState<Date | null>(null);
  const [selected, setSelected] = useState<Tool | null>(null);

  useEffect(() => {
    // Reading from localStorage — triggers first-open date recording on first visit
    setFirstOpen(getFirstOpenDate());
    setMonthsElapsed(getMonthsElapsed());
    setAcquired(getAcquiredTools());
  }, []);

  const unlockedIds = new Set(TOOLS.filter((t) => t.month <= monthsElapsed + 1).map((t) => t.id));
  const featured = TOOLS[Math.min(monthsElapsed, 11)];
  const acquiredCount = acquired.filter((id) => unlockedIds.has(id)).length;
  const unlockedCount = unlockedIds.size;

  const toggle = (toolId: string) => {
    if (acquired.includes(toolId)) {
      unmarkToolAcquired(toolId);
      setAcquired((a) => a.filter((id) => id !== toolId));
    } else {
      markToolAcquired(toolId);
      const tool = TOOLS.find((t) => t.id === toolId);
      if (tool) awardPoints("tool_acquired", tool.name, toolId);
      setAcquired((a) => [...a, toolId]);
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-4 pb-24">
      {/* Header */}
      <div className="pt-8 pb-4">
        <Link href="/home" className="text-sm text-orange-600 font-medium mb-4 inline-block">
          ← Home
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Your Toolkit</h1>
        <p className="text-gray-500 text-sm mt-1">
          One essential tool per month for your first year as an adult. No fluff — just the 12 tools that handle 90% of everything.
        </p>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">Collection Progress</span>
          <span className="text-sm font-bold text-orange-600">{acquiredCount} / {unlockedCount} owned</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="bg-orange-400 h-3 rounded-full transition-all"
            style={{ width: unlockedCount > 0 ? `${(acquiredCount / 12) * 100}%` : "0%" }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {unlockedCount < 12
            ? `${12 - unlockedCount} more tool${12 - unlockedCount !== 1 ? "s" : ""} unlock over your first year`
            : "Full toolkit unlocked — nice work!"}
        </p>
      </div>

      {/* This month's featured tool */}
      {unlockedCount >= 1 && (
        <div className="mb-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            {monthsElapsed === 0 ? "🎉 Your First Tool" : `🏆 Month ${Math.min(monthsElapsed + 1, 12)} Unlock`}
          </h2>
          <button
            onClick={() => setSelected(featured)}
            className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
              acquired.includes(featured.id)
                ? "bg-green-50 border-green-200"
                : "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 hover:border-orange-400"
            }`}
          >
            <div className="flex items-start gap-4">
              <span className="text-4xl">{featured.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-gray-900">{featured.name}</span>
                  <span className="text-xs bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full">
                    Month {featured.month}
                  </span>
                  {acquired.includes(featured.id) && (
                    <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">✓ Owned</span>
                  )}
                </div>
                <p className="text-sm text-orange-700 font-medium mt-1">{featured.tagline}</p>
                <p className="text-xs text-gray-500 mt-1">{featured.cost}</p>
              </div>
              <span className="text-gray-300 text-lg self-center">›</span>
            </div>
          </button>
        </div>
      )}

      {/* All 12 tools grid */}
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">All 12 Tools</h2>
      <div className="space-y-3">
        {TOOLS.map((tool) => {
          const unlocked = unlockedIds.has(tool.id);
          const owned = acquired.includes(tool.id);
          return (
            <button
              key={tool.id}
              onClick={() => unlocked && setSelected(tool)}
              disabled={!unlocked}
              className={`w-full text-left flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                !unlocked
                  ? "bg-gray-50 border-gray-100 opacity-60 cursor-default"
                  : owned
                  ? "bg-green-50 border-green-200 hover:border-green-300"
                  : "bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200"
              }`}
            >
              <div className={`relative flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                !unlocked ? "bg-gray-100" : owned ? "bg-green-100" : "bg-orange-50"
              }`}>
                {unlocked ? tool.emoji : "🔒"}
                {owned && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    ✓
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-semibold text-sm ${!unlocked ? "text-gray-400" : "text-gray-900"}`}>
                    {unlocked ? tool.name : `Month ${tool.month} — Locked`}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    !unlocked ? "bg-gray-100 text-gray-400" :
                    owned ? "bg-green-100 text-green-700" :
                    "bg-orange-50 text-orange-600"
                  }`}>
                    Month {tool.month}
                  </span>
                </div>
                {unlocked && (
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{tool.tagline}</p>
                )}
                {!unlocked && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Unlocks in {tool.month - (monthsElapsed + 1)} month{tool.month - (monthsElapsed + 1) !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
              {unlocked && <span className="text-gray-300 text-lg">›</span>}
            </button>
          );
        })}
      </div>

      {/* Tool detail sheet */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative bg-white rounded-t-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 pt-5 pb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{selected.emoji}</span>
                <div>
                  <h2 className="font-bold text-gray-900 text-lg leading-tight">{selected.name}</h2>
                  <span className="text-xs bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full">
                    Month {selected.month} · {selected.cost}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none ml-3">×</button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* Tagline */}
              <p className="text-orange-700 font-semibold text-sm">{selected.tagline}</p>

              {/* Why it matters */}
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">💡</span>
                  <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">How was I supposed to know that?</span>
                </div>
                <p className="text-sm text-gray-800 leading-relaxed">{selected.whyItMatters}</p>
              </div>

              {/* Used for */}
              <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">What You'll Use It For</h3>
                <ul className="space-y-2">
                  {selected.usedFor.map((use, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-orange-400 font-bold mt-0.5">→</span>
                      {use}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pro tip */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">Pro Tip</h3>
                <p className="text-sm text-blue-900 leading-relaxed">{selected.proTip}</p>
              </div>

              {/* Where to buy */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Where to Buy</h3>
                <p className="text-sm text-gray-700 mb-3">{selected.whereToBuy}</p>
                <a
                  href={selected.amazonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-[#FF9900] text-white font-bold rounded-xl text-sm hover:bg-[#e88a00] transition-colors"
                >
                  <span>🛒</span> Buy on Amazon →
                </a>
                <p className="text-xs text-gray-400 text-center mt-2">We may earn a small commission — at no extra cost to you.</p>
              </div>

              {/* Mark as acquired */}
              <button
                onClick={() => { toggle(selected.id); setSelected(null); }}
                className={`w-full py-4 rounded-2xl font-bold text-sm transition-all ${
                  acquired.includes(selected.id)
                    ? "bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                {acquired.includes(selected.id) ? "✓ Owned — tap to unmark" : "✓ I have this tool"}
              </button>

              <div className="h-2" />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
