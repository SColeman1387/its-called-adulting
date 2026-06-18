"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { TOOLS } from "@/lib/toolkit";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Submission {
  id: string;
  user_id: string;
  tool_id: string;
  photo_url: string;
  verification_status: string;
  created_at: string;
  email?: string;
}

const POINT_VALUES: Record<string, number> = { tool_acquired: 20 };

export default function VerifyToolsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filter, setFilter] = useState<"pending" | "verified" | "denied" | "all">("pending");
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => { fetchSubmissions(); }, []);

  const fetchSubmissions = async () => {
    const { data } = await supabaseAdmin
      .from("tool_acquisitions")
      .select("*, profiles(email)")
      .not("photo_url", "is", null)
      .order("created_at", { ascending: false });

    if (data) {
      setSubmissions(data.map((r: Submission & { profiles?: { email: string } }) => ({
        ...r,
        email: r.profiles?.email ?? "—",
      })));
    }
  };

  const updateStatus = async (id: string, userId: string, toolId: string, status: "verified" | "denied") => {
    setSaving(id);

    await supabaseAdmin
      .from("tool_acquisitions")
      .update({
        verification_status: status,
        verified_at: status === "verified" ? new Date().toISOString() : null,
      })
      .eq("id", id);

    // Award points on approval
    if (status === "verified") {
      const tool = TOOLS.find((t) => t.id === toolId);
      await supabaseAdmin.from("points_ledger").upsert({
        user_id: userId,
        type: "tool_acquired",
        points: POINT_VALUES.tool_acquired,
        label: tool ? tool.name : toolId,
        ref_id: `verified-${toolId}`,
        ts: new Date().toISOString(),
      }, { onConflict: "user_id,ref_id" });
    }

    await fetchSubmissions();
    setSaving(null);
  };

  const getSignedUrl = async (path: string) => {
    // If already a full URL just open it
    if (path.startsWith("http")) { window.open(path, "_blank"); return; }
    const { data } = await supabaseAdmin.storage.from("tool-photos").createSignedUrl(path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  const filtered = filter === "all" ? submissions : submissions.filter((s) => s.verification_status === filter);
  const counts = {
    all: submissions.length,
    pending: submissions.filter((s) => s.verification_status === "pending").length,
    verified: submissions.filter((s) => s.verification_status === "verified").length,
    denied: submissions.filter((s) => s.verification_status === "denied").length,
  };

  return (
    <main className="max-w-3xl mx-auto px-4 pb-16">
      <div className="pt-8 pb-4">
        <Link href="/admin" className="text-sm text-orange-600 font-medium">← Admin</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Tool Verifications</h1>
        <p className="text-gray-400 text-sm mt-1">Review photo submissions — approve to award Adulting Bucks.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {(["pending", "all", "verified", "denied"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              filter === s ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${filter === s ? "bg-white/20" : "bg-white text-gray-500"}`}>
              {counts[s]}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          No {filter === "all" ? "" : filter} submissions.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((s) => {
            const tool = TOOLS.find((t) => t.id === s.tool_id);
            return (
              <div key={s.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 flex items-start gap-4">
                  {/* Tool photo thumbnail */}
                  <button
                    onClick={() => getSignedUrl(s.photo_url)}
                    className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={s.photo_url}
                      alt={tool?.name ?? s.tool_id}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23f3f4f6'/%3E%3Ctext x='40' y='45' text-anchor='middle' font-size='24'%3E📷%3C/text%3E%3C/svg%3E"; }}
                    />
                    <span className="text-xs text-gray-400 block text-center mt-1">Tap to view</span>
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-lg">{tool?.emoji ?? "🔧"}</span>
                      <span className="font-bold text-gray-900 text-sm">{tool?.name ?? s.tool_id}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        s.verification_status === "pending" ? "bg-yellow-100 text-yellow-700" :
                        s.verification_status === "verified" ? "bg-green-100 text-green-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {s.verification_status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{s.email}</p>
                    <p className="text-xs text-gray-300 mt-0.5">
                      {new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>

                    {s.verification_status === "pending" && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => updateStatus(s.id, s.user_id, s.tool_id, "verified")}
                          disabled={saving === s.id}
                          className="flex-1 py-2 bg-green-500 text-white text-xs font-bold rounded-xl hover:bg-green-600 disabled:opacity-60"
                        >
                          {saving === s.id ? "Saving…" : "✓ Approve (+20 pts)"}
                        </button>
                        <button
                          onClick={() => updateStatus(s.id, s.user_id, s.tool_id, "denied")}
                          disabled={saving === s.id}
                          className="flex-1 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 disabled:opacity-60"
                        >
                          ✗ Deny
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
