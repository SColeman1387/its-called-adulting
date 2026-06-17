"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";

interface Redemption {
  id: string;
  user_id: string;
  tier: string;
  reward_choice: string | null;
  status: string;
  ship_name: string | null;
  ship_address: string | null;
  ship_city: string | null;
  ship_state: string | null;
  ship_zip: string | null;
  ship_phone: string | null;
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
  email?: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped:    "bg-purple-100 text-purple-700",
  delivered:  "bg-green-100 text-green-700",
};

const REWARD_LABELS: Record<string, string> = {
  "drill":          "🔩 Cordless Drill Kit",
  "jump-pack":      "⚡ Lithium Jump Pack",
  "tire-inflator":  "💨 Tire Inflator",
  "multi-tool":     "🔧 Multi-Tool",
};

export default function RedemptionsAdminPage() {
  const { user, loading } = useAuth();
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [tracking, setTracking] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchRedemptions();
  }, [user]);

  const fetchRedemptions = async () => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("rewards")
      .select("*, profiles(email)")
      .order("created_at", { ascending: false });

    if (data) {
      setRedemptions(
        data.map((r: Redemption & { profiles?: { email: string } }) => ({
          ...r,
          email: r.profiles?.email ?? "—",
        }))
      );
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setSaving(id);
    const supabase = getSupabase();
    await supabase
      .from("rewards")
      .update({
        status,
        tracking_number: tracking[id] ?? undefined,
        notes: notes[id] ?? undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    await fetchRedemptions();
    setSaving(null);
  };

  const filtered = filter === "all"
    ? redemptions
    : redemptions.filter((r) => r.status === filter);

  const counts = {
    all: redemptions.length,
    pending: redemptions.filter((r) => r.status === "pending").length,
    processing: redemptions.filter((r) => r.status === "processing").length,
    shipped: redemptions.filter((r) => r.status === "shipped").length,
    delivered: redemptions.filter((r) => r.status === "delivered").length,
  };

  if (loading) return null;

  if (!user) {
    return (
      <main className="max-w-sm mx-auto px-6 pt-20 text-center">
        <p className="text-gray-500">Sign in as admin to view redemptions.</p>
        <Link href="/auth?redirect=/admin/redemptions" className="mt-4 inline-block bg-orange-500 text-white font-bold px-6 py-3 rounded-2xl text-sm">
          Sign in
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 pb-16">
      <div className="pt-8 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <Link href="/admin" className="text-sm text-orange-600 font-medium">← Admin</Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Reward Redemptions</h1>
        <p className="text-gray-400 text-sm mt-1">{redemptions.length} total requests</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {(["all", "pending", "processing", "shipped", "delivered"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              filter === s
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
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
          No {filter === "all" ? "" : filter} redemptions yet.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              {/* Summary row */}
              <button
                onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                className="w-full text-left p-5 flex items-start gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-gray-900 text-sm">
                      {REWARD_LABELS[r.reward_choice ?? ""] ?? r.reward_choice ?? "—"}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status] ?? "bg-gray-100 text-gray-500"}`}>
                      {r.status}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                      {r.tier === "tier1" ? "Tier 1" : "Tier 2"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {r.email} · {r.ship_name ?? "No name"} · {r.ship_city}, {r.ship_state}
                  </div>
                  <div className="text-xs text-gray-300 mt-0.5">
                    {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </div>
                <span className="text-gray-300 text-lg">{expanded === r.id ? "↑" : "↓"}</span>
              </button>

              {/* Expanded detail */}
              {expanded === r.id && (
                <div className="border-t border-gray-50 px-5 py-4 space-y-4">
                  {/* Shipping address */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Ship to</h3>
                    <p className="text-sm text-gray-900 font-semibold">{r.ship_name}</p>
                    <p className="text-sm text-gray-600">{r.ship_address}</p>
                    <p className="text-sm text-gray-600">{r.ship_city}, {r.ship_state} {r.ship_zip}</p>
                    {r.ship_phone && <p className="text-sm text-gray-500 mt-1">📞 {r.ship_phone}</p>}
                  </div>

                  {/* Tracking number */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                      Tracking number
                    </label>
                    <input
                      defaultValue={r.tracking_number ?? ""}
                      onChange={(e) => setTracking((t) => ({ ...t, [r.id]: e.target.value }))}
                      placeholder="e.g. 1Z999AA10123456784"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 font-mono"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                      Admin notes
                    </label>
                    <textarea
                      defaultValue={r.notes ?? ""}
                      onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
                      placeholder="Internal notes (not visible to user)"
                      rows={2}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 resize-none"
                    />
                  </div>

                  {/* Status buttons */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                      Update status
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {(["pending", "processing", "shipped", "delivered"] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(r.id, s)}
                          disabled={r.status === s || saving === r.id}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            r.status === s
                              ? `${STATUS_COLORS[s]} opacity-100 cursor-default`
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {saving === r.id ? "Saving…" : s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
