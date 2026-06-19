"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Props {
  taskId: string;
  taskTitle: string;
}

export default function TipSubmitter({ taskId, taskTitle }: Props) {
  const [open, setOpen] = useState(false);
  const [tip, setTip] = useState("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ message: string; status: string } | null>(null);

  const submit = async () => {
    if (!tip.trim()) return;
    setSubmitting(true);

    const { data } = await supabase.auth.getUser();
    const userId = data.user?.id ?? null;

    const res = await fetch("/api/tips/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, taskTitle, tip, location, userId }),
    });

    const json = await res.json();
    setResult(json);
    setSubmitting(false);
    setTip("");
    setLocation("");
  };

  if (result) {
    return (
      <div className={`rounded-2xl p-4 text-center ${result.status === "approved" ? "bg-green-50 border border-green-200" : "bg-gray-50 border border-gray-100"}`}>
        <p className="text-sm font-medium text-gray-800">{result.status === "approved" ? "🎉" : "👍"} {result.message}</p>
        <button onClick={() => { setResult(null); setOpen(false); }} className="text-xs text-gray-400 mt-2 hover:text-gray-600">
          Close
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3 border border-dashed border-orange-200 rounded-2xl text-sm text-orange-500 font-medium hover:bg-orange-50 transition-colors"
      >
        💡 Got a tip? Share it with others →
      </button>
    );
  }

  return (
    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-orange-900">Share a tip</h3>
        <button onClick={() => setOpen(false)} className="text-gray-400 text-xs hover:text-gray-600">✕ Cancel</button>
      </div>

      <textarea
        value={tip}
        onChange={(e) => setTip(e.target.value)}
        placeholder="What's something you wish you knew? e.g. 'Always check the drain plug before adding new oil — mechanics sometimes forget to tighten it.'"
        className="w-full text-sm border border-orange-200 rounded-xl p-3 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
        rows={3}
        maxLength={300}
      />
      <p className="text-xs text-gray-400 text-right mt-0.5">{tip.length}/300</p>

      <input
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="📍 Location (optional) — e.g. Ohio, Texas, NYC"
        className="w-full text-sm border border-orange-200 rounded-xl p-3 bg-white mt-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
      />
      <p className="text-xs text-gray-400 mt-1">Location helps show tips that are relevant to where you live.</p>

      <button
        onClick={submit}
        disabled={!tip.trim() || submitting}
        className="w-full mt-3 py-2.5 bg-orange-500 text-white text-sm font-bold rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-colors"
      >
        {submitting ? "Reviewing…" : "Submit tip"}
      </button>
    </div>
  );
}
