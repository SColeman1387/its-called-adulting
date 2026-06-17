"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { getSupabase } from "@/lib/supabase";
import { TOOLS } from "@/lib/toolkit";

interface LinkedKid {
  child_id: string;
  status: string;
  child_name: string | null;
  child_email: string | null;
  tool_count: number;
  task_count: number;
}

export default function ParentPage() {
  const { user, loading } = useAuth();
  const [kids, setKids] = useState<LinkedKid[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [selectedKid, setSelectedKid] = useState<string | null>(null);
  const [kidTools, setKidTools] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    const supabase = getSupabase();

    supabase
      .from("parent_links")
      .select(`
        child_id,
        status,
        profiles!parent_links_child_id_fkey (display_name, email)
      `)
      .eq("parent_id", user.id)
      .then(async ({ data }) => {
        if (!data) return;
        const enriched = await Promise.all(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.map(async (link: any) => {
            const [{ count: toolCount }, { count: taskCount }] = await Promise.all([
              supabase
                .from("tool_acquisitions")
                .select("id", { count: "exact" })
                .eq("user_id", link.child_id),
              supabase
                .from("task_completions")
                .select("id", { count: "exact" })
                .eq("user_id", link.child_id),
            ]);
            return {
              child_id: link.child_id,
              status: link.status,
              child_name: link.profiles?.display_name ?? null,
              child_email: link.profiles?.email ?? null,
              tool_count: toolCount ?? 0,
              task_count: taskCount ?? 0,
            };
          })
        );
        setKids(enriched);
      });
  }, [user]);

  const loadKidTools = async (childId: string) => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("tool_acquisitions")
      .select("tool_id")
      .eq("user_id", childId);
    setKidTools(data?.map((r: { tool_id: string }) => r.tool_id) ?? []);
    setSelectedKid(childId);
  };

  const sendInvite = async () => {
    if (!user || !inviteEmail) return;
    setInviting(true);
    // In production: send an email via Supabase Edge Function or Resend.
    // For now we just create a pending link with a token they can accept.
    const token = Math.random().toString(36).slice(2, 10).toUpperCase();
    const supabase = getSupabase();

    // Find the child by email
    const { data: childProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", inviteEmail)
      .single();

    if (childProfile) {
      await supabase.from("parent_links").insert({
        parent_id: user.id,
        child_id: childProfile.id,
        status: "pending",
        invite_token: token,
      });
    }
    setInviting(false);
    setInviteSent(true);
    setInviteEmail("");
  };

  if (loading) return null;

  if (!user) {
    return (
      <main className="max-w-sm mx-auto px-6 pt-20 text-center">
        <div className="text-5xl mb-4">👨‍👩‍👧</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Parent Dashboard</h1>
        <p className="text-gray-500 text-sm mb-6">Sign in to link with your kid and see their progress.</p>
        <Link href="/auth?redirect=/parent" className="inline-block bg-orange-500 text-white font-bold px-6 py-3 rounded-2xl text-sm">
          Sign in →
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 pb-24">
      <div className="pt-8 pb-4">
        <Link href="/home" className="text-sm text-orange-600 font-medium mb-4 inline-block">← Home</Link>
        <h1 className="text-2xl font-bold text-gray-900">Parent Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          See your kid&apos;s progress — tools collected, tasks completed, weekly lessons. Read-only; they control their app.
        </p>
      </div>

      {/* Invite form */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 mb-6">
        <h2 className="font-bold text-gray-900 text-sm mb-1">Link with your kid</h2>
        <p className="text-xs text-gray-500 mb-3">Enter the email address they signed up with. They&apos;ll get a notification to approve the link.</p>
        {inviteSent ? (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-medium">
            ✓ Request sent — they&apos;ll need to approve it in their app.
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="kid@example.com"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
            <button
              onClick={sendInvite}
              disabled={!inviteEmail || inviting}
              className="px-4 py-3 bg-orange-500 text-white font-bold rounded-xl text-sm hover:bg-orange-600 transition-colors disabled:opacity-50 shrink-0"
            >
              {inviting ? "…" : "Send"}
            </button>
          </div>
        )}
      </div>

      {/* Linked kids */}
      {kids.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          No linked accounts yet. Enter your kid&apos;s email above to get started.
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Linked accounts</h2>
          {kids.map((kid) => (
            <div key={kid.child_id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-lg font-bold text-orange-600 shrink-0">
                    {(kid.child_name ?? kid.child_email ?? "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-sm">{kid.child_name ?? kid.child_email}</span>
                      {kid.status === "pending" && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 font-bold px-2 py-0.5 rounded-full">Pending</span>
                      )}
                      {kid.status === "accepted" && (
                        <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">✓ Linked</span>
                      )}
                    </div>
                    {kid.status === "accepted" && (
                      <div className="flex gap-4 mt-2">
                        <div className="text-center">
                          <div className="text-xl font-black text-orange-500">{kid.tool_count}</div>
                          <div className="text-xs text-gray-400">tools</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-black text-green-500">{kid.task_count}</div>
                          <div className="text-xs text-gray-400">tasks done</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-black text-blue-500">{Math.round((kid.tool_count / 12) * 100)}%</div>
                          <div className="text-xs text-gray-400">toolkit</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {kid.status === "accepted" && (
                <div className="border-t border-gray-50 px-5 py-3">
                  <button
                    onClick={() => selectedKid === kid.child_id ? setSelectedKid(null) : loadKidTools(kid.child_id)}
                    className="text-xs text-orange-600 font-semibold"
                  >
                    {selectedKid === kid.child_id ? "Hide toolkit ↑" : "View toolkit →"}
                  </button>

                  {selectedKid === kid.child_id && (
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {TOOLS.map((tool) => {
                        const owned = kidTools.includes(tool.id);
                        return (
                          <div
                            key={tool.id}
                            className={`rounded-xl p-2 text-center border ${owned ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-100 opacity-40"}`}
                          >
                            <div className="text-xl">{tool.emoji}</div>
                            <div className="text-xs text-gray-600 mt-0.5 leading-tight">{tool.name.split(" ")[0]}</div>
                            {owned && <div className="text-green-500 text-xs font-bold">✓</div>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
