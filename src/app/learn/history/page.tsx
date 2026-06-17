"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getLearningHistory, getLearningStreak, LessonRecord } from "@/lib/learning";
import { TASKS, CATEGORIES } from "@/lib/data";

export default function LearningHistoryPage() {
  const [history, setHistory] = useState<LessonRecord[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const h = getLearningHistory().sort((a, b) => b.weekKey.localeCompare(a.weekKey));
    setHistory(h);
    setStreak(getLearningStreak());
  }, []);

  const learned = history.filter((r) => r.response === "learned").length;
  const knewIt = history.filter((r) => r.response === "knew-it").length;
  const total = history.length;

  return (
    <main className="max-w-2xl mx-auto px-4 pb-24">
      <div className="pt-8 pb-4">
        <Link href="/learn" className="text-sm text-orange-600 font-medium">← This Week</Link>
      </div>

      <div className="pt-2 pb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Your Learning History</h1>
        <p className="text-gray-400 text-sm">Every lesson you&apos;ve seen, week by week.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-orange-500">{streak}</p>
          <p className="text-xs text-gray-400 mt-0.5">Week streak 🔥</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{learned}</p>
          <p className="text-xs text-gray-400 mt-0.5">Learned 💡</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{total}</p>
          <p className="text-xs text-gray-400 mt-0.5">Total seen 👀</p>
        </div>
      </div>

      {total > 0 && (
        <div className="mb-6 bg-orange-50 rounded-2xl p-3">
          <div className="flex items-center justify-between text-xs text-orange-700 mb-1.5">
            <span className="font-semibold">Knowledge base</span>
            <span>{learned + knewIt} of {total} lessons absorbed</span>
          </div>
          <div className="w-full bg-orange-100 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all"
              style={{ width: `${total > 0 ? Math.round(((learned + knewIt) / total) * 100) : 0}%` }}
            />
          </div>
        </div>
      )}

      {history.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📚</div>
          <p className="text-gray-500 text-sm mb-4">No lessons yet.</p>
          <Link href="/learn" className="inline-block bg-orange-500 text-white text-sm font-bold px-5 py-3 rounded-xl hover:bg-orange-600">
            Start This Week&apos;s Lesson →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((record) => {
            const task = TASKS.find((t) => t.id === record.taskId);
            const category = task ? CATEGORIES.find((c) => c.id === task.category) : null;
            const [yearStr, wStr] = record.weekKey.split("-W");
            const weekLabel = `Week ${parseInt(wStr)}, ${yearStr}`;

            return (
              <Link
                key={record.weekKey}
                href={task ? `/task/${task.id}` : "/learn"}
                className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-sm transition-shadow"
              >
                <span className="text-2xl mt-0.5">{category?.icon ?? "📖"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-xs text-gray-400">{weekLabel}</span>
                    {record.response === "learned" && (
                      <span className="text-xs bg-orange-100 text-orange-700 font-semibold px-2 py-0.5 rounded-full">💡 Learned</span>
                    )}
                    {record.response === "knew-it" && (
                      <span className="text-xs bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded-full">✋ Knew it</span>
                    )}
                    {!record.response && (
                      <span className="text-xs bg-blue-50 text-blue-500 font-semibold px-2 py-0.5 rounded-full">👀 Viewed</span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{task?.title ?? record.taskId}</p>
                  {task && (
                    <p className="text-xs text-orange-600 mt-0.5 line-clamp-1 font-medium">💡 {task.howDidIKnow}</p>
                  )}
                </div>
                <span className="text-gray-300 text-lg self-center">›</span>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
