"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  TOOLS,
  Tool,
  getFirstOpenDate,
  getMonthsElapsed,
  getAcquiredTools,
  markToolAcquired,
  unmarkToolAcquired,
} from "@/lib/toolkit";
import { awardPoints } from "@/lib/points";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";

type VerificationStatus = "unverified" | "pending" | "verified" | "denied";

export default function ToolkitPage() {
  const { user } = useAuth();
  const [acquired, setAcquired] = useState<string[]>([]);
  const [monthsElapsed, setMonthsElapsed] = useState(0);
  const [selected, setSelected] = useState<Tool | null>(null);
  const [verificationMap, setVerificationMap] = useState<Record<string, VerificationStatus>>({});

  // Photo upload state
  const [uploadStep, setUploadStep] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getFirstOpenDate();
    setMonthsElapsed(getMonthsElapsed());
    setAcquired(getAcquiredTools());
  }, []);

  useEffect(() => {
    if (!user) return;
    const supabase = getSupabase();
    supabase
      .from("tool_acquisitions")
      .select("tool_id, verification_status")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data) {
          const map: Record<string, VerificationStatus> = {};
          data.forEach((r: { tool_id: string; verification_status: VerificationStatus }) => {
            map[r.tool_id] = r.verification_status;
          });
          setVerificationMap(map);
        }
      });
  }, [user]);

  const unlockedIds = new Set(TOOLS.filter((t) => t.month <= monthsElapsed + 1).map((t) => t.id));
  const featured = TOOLS[Math.min(monthsElapsed, 11)];
  const acquiredCount = acquired.filter((id) => unlockedIds.has(id)).length;
  const unlockedCount = unlockedIds.size;

  const handlePhotoUpload = async (file: File, toolId: string) => {
    if (!user) { setUploadError("Sign in to verify tool ownership."); return; }
    setUploadStep("uploading");
    setUploadError(null);

    try {
      const supabase = getSupabase();
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/${toolId}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("tool-photos")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("tool-photos").getPublicUrl(path);

      // Upsert into tool_acquisitions
      const { error: dbError } = await supabase.from("tool_acquisitions").upsert({
        user_id: user.id,
        tool_id: toolId,
        photo_url: publicUrl || path,
        verification_status: "pending",
      }, { onConflict: "user_id,tool_id" });

      if (dbError) throw dbError;

      // Mark locally so UI updates
      markToolAcquired(toolId);
      setAcquired((a) => [...a, toolId]);
      setVerificationMap((m) => ({ ...m, [toolId]: "pending" }));
      setUploadStep("done");
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed. Try again.");
      setUploadStep("error");
    }
  };

  const statusBadge = (toolId: string) => {
    const status = verificationMap[toolId];
    if (!status || status === "unverified") return null;
    const styles: Record<string, string> = {
      pending:  "bg-yellow-100 text-yellow-700",
      verified: "bg-green-100 text-green-700",
      denied:   "bg-red-100 text-red-700",
    };
    const labels: Record<string, string> = {
      pending:  "⏳ Pending review",
      verified: "✓ Verified",
      denied:   "✗ Not approved",
    };
    return (
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <main className="max-w-2xl mx-auto px-4 pb-24">
      {/* Header */}
      <div className="pt-8 pb-4">
        <Link href="/home" className="text-sm text-orange-600 font-medium mb-4 inline-block">← Home</Link>
        <h1 className="text-2xl font-bold text-gray-900">Your Toolkit</h1>
        <p className="text-gray-500 text-sm mt-1">
          One essential tool per month. Verify ownership with a photo to earn Adulting Bucks.
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

      {/* Featured tool */}
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
                  <span className="text-xs bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full">Month {featured.month}</span>
                  {acquired.includes(featured.id) && statusBadge(featured.id)}
                </div>
                <p className="text-sm text-orange-700 font-medium mt-1">{featured.tagline}</p>
                <p className="text-xs text-gray-500 mt-1">{featured.cost}</p>
              </div>
              <span className="text-gray-300 text-lg self-center">›</span>
            </div>
          </button>
        </div>
      )}

      {/* All 12 tools */}
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
                !unlocked ? "bg-gray-50 border-gray-100 opacity-60 cursor-default"
                : owned ? "bg-green-50 border-green-200 hover:border-green-300"
                : "bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200"
              }`}
            >
              <div className={`relative flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                !unlocked ? "bg-gray-100" : owned ? "bg-green-100" : "bg-orange-50"
              }`}>
                {unlocked ? tool.emoji : "🔒"}
                {owned && verificationMap[tool.id] === "verified" && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>
                )}
                {owned && verificationMap[tool.id] === "pending" && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-white text-xs font-bold">⏳</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-semibold text-sm ${!unlocked ? "text-gray-400" : "text-gray-900"}`}>
                    {unlocked ? tool.name : `Month ${tool.month} — Locked`}
                  </span>
                  {unlocked && owned && statusBadge(tool.id)}
                </div>
                {unlocked && <p className="text-xs text-gray-500 mt-0.5 truncate">{tool.tagline}</p>}
                {!unlocked && <p className="text-xs text-gray-400 mt-0.5">Unlocks in {tool.month - (monthsElapsed + 1)} month{tool.month - (monthsElapsed + 1) !== 1 ? "s" : ""}</p>}
              </div>
              {unlocked && <span className="text-gray-300 text-lg">›</span>}
            </button>
          );
        })}
      </div>

      {/* Tool detail sheet */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setSelected(null); setUploadStep("idle"); setUploadError(null); }} />
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
              <button onClick={() => { setSelected(null); setUploadStep("idle"); setUploadError(null); }} className="text-gray-400 hover:text-gray-600 text-2xl leading-none ml-3">×</button>
            </div>

            <div className="px-5 py-4 space-y-4">
              <p className="text-orange-700 font-semibold text-sm">{selected.tagline}</p>

              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">💡</span>
                  <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">How was I supposed to know that?</span>
                </div>
                <p className="text-sm text-gray-800 leading-relaxed">{selected.whyItMatters}</p>
              </div>

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

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">Pro Tip</h3>
                <p className="text-sm text-blue-900 leading-relaxed">{selected.proTip}</p>
              </div>

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

              {/* Verification / ownership section */}
              {!acquired.includes(selected.id) && uploadStep === "idle" && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                  <h3 className="text-sm font-bold text-gray-900 mb-1">📸 Already have this tool?</h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Take a quick photo of your {selected.name} to verify ownership and earn <strong>+20 Adulting Bucks</strong>.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoUpload(file, selected.id);
                    }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 bg-green-500 text-white font-bold rounded-xl text-sm hover:bg-green-600 transition-colors"
                  >
                    📷 Take a photo to verify →
                  </button>
                </div>
              )}

              {uploadStep === "uploading" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-center">
                  <div className="text-2xl mb-2">⏳</div>
                  <p className="text-sm font-semibold text-yellow-800">Uploading your photo…</p>
                </div>
              )}

              {uploadStep === "done" && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
                  <div className="text-2xl mb-2">✅</div>
                  <p className="text-sm font-bold text-green-800">Photo submitted for review!</p>
                  <p className="text-xs text-green-600 mt-1">You'll earn +20 Adulting Bucks once approved — usually within 24 hours.</p>
                </div>
              )}

              {uploadStep === "error" && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                  <p className="text-sm text-red-700 font-semibold">{uploadError}</p>
                  <button onClick={() => { setUploadStep("idle"); setUploadError(null); }} className="text-xs text-red-500 mt-2 underline">Try again</button>
                </div>
              )}

              {acquired.includes(selected.id) && uploadStep !== "done" && (
                <div className="space-y-2">
                  {statusBadge(selected.id) && (
                    <div className="flex justify-center">{statusBadge(selected.id)}</div>
                  )}
                  {verificationMap[selected.id] === "denied" && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-700 text-center">
                      Photo wasn&apos;t clear enough. Try a new photo in better lighting.
                      <button
                        onClick={() => { setUploadStep("idle"); setAcquired((a) => a.filter((id) => id !== selected.id)); }}
                        className="block mx-auto mt-2 text-red-500 underline"
                      >Re-submit photo</button>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      unmarkToolAcquired(selected.id);
                      setAcquired((a) => a.filter((id) => id !== selected.id));
                      setVerificationMap((m) => { const n = { ...m }; delete n[selected.id]; return n; });
                      setSelected(null);
                    }}
                    className="w-full py-3 rounded-2xl bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600 font-bold text-sm transition-all"
                  >
                    Remove from my toolkit
                  </button>
                </div>
              )}

              <div className="h-2" />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
