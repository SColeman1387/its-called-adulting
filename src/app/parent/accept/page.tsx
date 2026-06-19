"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { Suspense } from "react";

function AcceptInviteInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "found" | "not_found" | "accepted" | "declined" | "error">("loading");
  const [parentName, setParentName] = useState<string | null>(null);
  const [linkId, setLinkId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) { setStatus("not_found"); return; }

    const supabase = getSupabase();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push(`/auth?redirect=/parent/accept?token=${token}`);
        return;
      }

      const { data: link } = await supabase
        .from("parent_links")
        .select("id, status, parent_id, profiles!parent_links_parent_id_fkey(display_name, email)")
        .eq("invite_token", token)
        .eq("child_id", data.user.id)
        .single();

      if (!link) { setStatus("not_found"); return; }
      if (link.status === "accepted") { setStatus("accepted"); return; }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const profile = link.profiles as any;
      setParentName(profile?.display_name ?? profile?.email ?? "Your parent");
      setLinkId(link.id);
      setStatus("found");
    });
  }, [token, router]);

  const respond = async (accept: boolean) => {
    if (!linkId) return;
    const supabase = getSupabase();
    await supabase
      .from("parent_links")
      .update({ status: accept ? "accepted" : "declined" })
      .eq("id", linkId);
    setStatus(accept ? "accepted" : "declined");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "not_found") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl mb-4">🤔</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Invite not found</h1>
        <p className="text-gray-500 text-sm mb-6">This invite link may have expired or already been used. Ask your parent to send a new one.</p>
        <Link href="/home" className="text-orange-600 font-semibold text-sm">← Go home</Link>
      </main>
    );
  }

  if (status === "accepted") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">You're linked!</h1>
        <p className="text-gray-500 text-sm mb-6">{parentName ?? "Your parent"} can now see your progress in the app.</p>
        <Link href="/home" className="bg-orange-500 text-white font-bold px-6 py-3 rounded-2xl text-sm">Go to home →</Link>
      </main>
    );
  }

  if (status === "declined") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl mb-4">👍</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Invite declined</h1>
        <p className="text-gray-500 text-sm mb-6">No problem — you can always accept later if you change your mind.</p>
        <Link href="/home" className="text-orange-600 font-semibold text-sm">← Go home</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        <div className="text-6xl mb-4">👨‍👩‍👧</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Parent link request</h1>
        <p className="text-gray-600 text-sm mb-8">
          <span className="font-semibold">{parentName}</span> wants to link with your account so they can see your progress — tools collected, tasks done, and weekly lessons.
          <br /><br />
          They can only <span className="font-semibold">view</span> your data. They can't change anything.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => respond(true)}
            className="w-full py-3.5 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-colors"
          >
            ✓ Accept — let them see my progress
          </button>
          <button
            onClick={() => respond(false)}
            className="w-full py-3 text-gray-400 text-sm hover:text-gray-600 transition-colors"
          >
            No thanks, decline
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-6">You can unlink at any time from your settings.</p>
      </div>
    </main>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense>
      <AcceptInviteInner />
    </Suspense>
  );
}
