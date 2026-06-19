"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Tip {
  id: string;
  task_id: string;
  task_title: string;
  tip: string;
  original_tip: string;
  location: string | null;
  is_location_specific: boolean;
  status: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  approved: "bg-green-100 text-green-700",
  pending_review: "bg-yellow-100 text-yellow-700",
  rejected_ai: "bg-red-100 text-red-600",
  rejected_admin: "bg-gray-100 text-gray-500",
};

export default function AdminTipsPage() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [filter, setFilter] = useState<"pending_review" | "approved" | "rejected_ai" | "all">("pending_review");
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => { fetchTips(); }, []);

  const fetchTips = async () => {
    const { data } = await supabase
      .from("community_tips")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setTips(data);
  };

  const act = async (id: string, action: "approve" | "reject") => {
    setSaving(id);
    await fetch("/api/tips/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    await fetchTips();
    setSaving(null);
  };

  const filtered = filter === "all" ? tips : tips.filter((t) => t.status === filter);
  const counts = {
    all: tips.length,
    pending_review: tips.filter((t) => t.status === "pending_review").length,
    approved: tips.filter((t) => t.status === "approved").length,
    rejected_ai: tips.filter((t) => t.status === "rejected_ai").length,
  };

  return (
    <main className="max-w-3xl mx-auto px-4 pb-16">
      <div className="pt-8 pb-4">
        <Link href="/admin" className="text-sm text-orange-600 font-medium">← Admin</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Community Tips</h1>
        <p className="text-gray-400 text-sm mt-1">Claude auto-reviews submissions. Anything flagged as pending needs your eyes.</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {([
          { key: "pending_review", label: "Needs Review" },
          { key: "rejected_ai", label: "AI Rejected" },
          { key: "approved", label: "Live" },
          { key: "all", label: "All" },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              filter === key ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {label}
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${filter === key ? "bg-white/20" : "bg-white text-gray-500"}`}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No tips in this category.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((t) => (
            <div key={t.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t.task_title}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[t.status] ?? "bg-gray-100 text-gray-500"}`}>
                      {t.status.replace(/_/g, " ")}
                    </span>
                    {t.location && (
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">📍 {t.location}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-900 font-medium leading-relaxed">{t.tip}</p>
                  {t.original_tip && t.original_tip !== t.tip && (
                    <p className="text-xs text-gray-400 mt-1 italic">Original: "{t.original_tip}"</p>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-300 mb-3">
                {new Date(t.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>

              {(t.status === "pending_review" || t.status === "rejected_ai") && (
                <div className="flex gap-2">
                  <button
                    onClick={() => act(t.id, "approve")}
                    disabled={saving === t.id}
                    className="flex-1 py-2 bg-green-500 text-white text-xs font-bold rounded-xl hover:bg-green-600 disabled:opacity-60"
                  >
                    {saving === t.id ? "Saving…" : "✓ Approve & publish"}
                  </button>
                  <button
                    onClick={() => act(t.id, "reject")}
                    disabled={saving === t.id}
                    className="flex-1 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 disabled:opacity-60"
                  >
                    ✗ Reject
                  </button>
                </div>
              )}

              {t.status === "approved" && (
                <button
                  onClick={() => act(t.id, "reject")}
                  disabled={saving === t.id}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  Remove from live
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
