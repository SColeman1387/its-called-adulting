"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Submission {
  id: number;
  didntKnow: string;
  whyMatters: string;
  category: string;
  cost: string;
  submittedAt: string;
}

const COST_LABELS: Record<string, string> = {
  "nothing-yet": "No cost yet",
  "under-100": "Under $100",
  "100-500": "$100–$500",
  "500-2000": "$500–$2,000",
  "over-2000": "Over $2,000",
  "stress": "Stress / embarrassment",
};

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filter, setFilter] = useState<"all" | "unreviewed">("all");

  useEffect(() => {
    const raw = localStorage.getItem("ica_suggestions");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setSubmissions(parsed.reverse());
      } catch {
        setSubmissions([]);
      }
    }
  }, []);

  const clearAll = () => {
    if (confirm("Delete all submissions? This cannot be undone.")) {
      localStorage.removeItem("ica_suggestions");
      setSubmissions([]);
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-4 pb-16">
      <div className="pt-8 pb-2">
        <Link href="/home" className="text-sm text-orange-600 font-medium">← Home</Link>
      </div>

      <div className="pt-4 pb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Submissions</h1>
          <p className="text-gray-400 text-sm">{submissions.length} total · &ldquo;What else didn&apos;t you know?&rdquo;</p>
        </div>
        {submissions.length > 0 && (
          <button onClick={clearAll} className="text-xs text-red-400 font-medium border border-red-100 rounded-lg px-3 py-1.5 hover:bg-red-50">
            Clear all
          </button>
        )}
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-gray-400 text-sm">No submissions yet.</p>
          <p className="text-gray-300 text-xs mt-1">Share the app and they&apos;ll show up here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <p className="text-sm font-semibold text-gray-900 leading-relaxed flex-1">&ldquo;{s.didntKnow}&rdquo;</p>
              </div>

              {s.whyMatters && (
                <p className="text-xs text-gray-500 mb-3 leading-relaxed border-l-2 border-orange-200 pl-3">
                  {s.whyMatters}
                </p>
              )}

              <div className="flex flex-wrap gap-2 mt-2">
                {s.category && (
                  <span className="text-xs bg-blue-50 text-blue-600 font-medium px-2 py-0.5 rounded-full">
                    {s.category}
                  </span>
                )}
                {s.cost && (
                  <span className="text-xs bg-orange-50 text-orange-600 font-medium px-2 py-0.5 rounded-full">
                    {COST_LABELS[s.cost] || s.cost}
                  </span>
                )}
                <span className="text-xs text-gray-300 ml-auto">
                  {new Date(s.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 bg-gray-50 rounded-2xl p-4 text-center">
        <p className="text-xs text-gray-400 leading-relaxed">
          Submissions are currently stored locally on this device.<br />
          A future version will sync them to a server so you can review from anywhere.
        </p>
      </div>
    </main>
  );
}
