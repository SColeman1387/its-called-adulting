"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getWeeklyLesson, getThisWeekRecord, markWeekViewed, recordResponse, getLearningStreak, getWeekKey } from "@/lib/learning";
import { awardPoints } from "@/lib/points";
import { CATEGORIES, Task } from "@/lib/data";
import { getProfile } from "@/lib/profile";

export default function LearnPage() {
  const [task, setTask] = useState<Task | null>(null);
  const [response, setResponse] = useState<"learned" | "knew-it" | null>(null);
  const [streak, setStreak] = useState(0);
  const [weekKey, setWeekKey] = useState("");

  useEffect(() => {
    const profile = getProfile();
    const lesson = getWeeklyLesson(profile ?? undefined);
    setTask(lesson);
    setWeekKey(getWeekKey());
    markWeekViewed(lesson.id);
    const record = getThisWeekRecord();
    setResponse(record?.response ?? null);
    setStreak(getLearningStreak());
  }, []);

  const handleResponse = (r: "learned" | "knew-it") => {
    if (!task) return;
    recordResponse(task.id, r);
    awardPoints("lesson_complete", `Weekly lesson: ${task.title}`, getWeekKey());
    setResponse(r);
    setStreak(getLearningStreak());
  };

  if (!task) return null;

  const category = CATEGORIES.find((c) => c.id === task.category);

  // Parse "2025-W23" for display
  const [yearStr, wStr] = weekKey.split("-W");
  const weekLabel = weekKey ? `Week ${parseInt(wStr)}, ${yearStr}` : "";

  return (
    <main className="max-w-2xl mx-auto px-4 pb-24">
      <div className="pt-8 pb-2 flex items-center justify-between">
        <Link href="/home" className="text-sm text-orange-600 font-medium">← Home</Link>
        <Link href="/learn/history" className="text-sm text-gray-400 hover:text-gray-600">History →</Link>
      </div>

      {/* Header */}
      <div className="pt-4 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">This Week&apos;s Lesson</span>
          {streak > 0 && (
            <span className="text-xs bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full">
              🔥 {streak} week{streak !== 1 ? "s" : ""} in a row
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400">{weekLabel}</p>
      </div>

      {/* Category pill */}
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${category?.bgColor} mb-4`}>
        <span>{category?.icon}</span>
        <span className={`text-xs font-semibold ${category?.color}`}>{category?.label}</span>
      </div>

      {/* Task title */}
      <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">{task.title}</h1>
      <p className="text-gray-500 text-sm leading-relaxed mb-6">{task.description}</p>

      {/* The HWISTKT moment — the whole point */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-100 rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span>💡</span>
          <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">How was I supposed to know that?</span>
        </div>
        <p className="text-base text-gray-900 leading-relaxed font-medium">{task.howDidIKnow}</p>
      </div>

      {/* Quick facts */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-3 text-center">
          <p className="text-lg mb-1">⏱</p>
          <p className="text-xs text-gray-500 font-medium">{task.timeEstimate}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-3 text-center">
          <p className="text-lg mb-1">
            {task.difficulty === "easy" ? "🟢" : task.difficulty === "medium" ? "🟡" : "🔴"}
          </p>
          <p className="text-xs text-gray-500 font-medium capitalize">{task.difficulty}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-3 text-center">
          <p className="text-lg mb-1">📅</p>
          <p className="text-xs text-gray-500 font-medium capitalize">{task.season}</p>
        </div>
      </div>

      {/* What you'll need (tools preview) */}
      {task.diyGuide.toolsNeeded.length > 0 && (
        <div className="bg-yellow-50 rounded-2xl border border-yellow-100 p-4 mb-6">
          <p className="text-xs font-bold text-yellow-800 uppercase tracking-wide mb-2">🧰 What you&apos;d need</p>
          <ul className="space-y-1">
            {task.diyGuide.toolsNeeded.slice(0, 3).map((tool, i) => (
              <li key={i} className="text-sm text-yellow-900">• {tool}</li>
            ))}
            {task.diyGuide.toolsNeeded.length > 3 && (
              <li className="text-xs text-yellow-600">+ {task.diyGuide.toolsNeeded.length - 3} more in the full guide</li>
            )}
          </ul>
        </div>
      )}

      {/* First step preview */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Step 1 preview</p>
        <p className="text-sm text-gray-700 leading-relaxed">{task.diyGuide.steps[0]}</p>
        <Link
          href={`/task/${task.id}`}
          className="mt-3 inline-flex items-center gap-1 text-sm text-orange-600 font-semibold hover:text-orange-700"
        >
          See all {task.diyGuide.steps.length} steps →
        </Link>
      </div>

      {/* Response buttons */}
      {!response ? (
        <div>
          <p className="text-sm font-semibold text-gray-700 text-center mb-3">Did you know this already?</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleResponse("knew-it")}
              className="py-4 rounded-2xl border-2 border-gray-200 bg-white text-sm font-bold text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              ✋ Yeah, I knew that
            </button>
            <button
              onClick={() => handleResponse("learned")}
              className="py-4 rounded-2xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-all"
            >
              💡 Learned something new
            </button>
          </div>
        </div>
      ) : (
        <div className={`rounded-2xl border p-4 text-center ${response === "learned" ? "bg-orange-50 border-orange-200" : "bg-gray-50 border-gray-200"}`}>
          <p className={`text-sm font-bold ${response === "learned" ? "text-orange-700" : "text-gray-600"}`}>
            {response === "learned" ? "💡 Marked as learned — nice!" : "✋ Good to know you're on top of it"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {streak > 1 ? `🔥 ${streak}-week streak! Come back next week.` : "Come back next week for a new lesson."}
          </p>
        </div>
      )}

      {/* Full task CTA */}
      <div className="mt-5">
        <Link
          href={`/task/${task.id}`}
          className="flex items-center justify-between p-4 bg-gray-900 rounded-2xl hover:bg-gray-800 transition-colors"
        >
          <div>
            <p className="text-white font-bold text-sm">Read the full guide</p>
            <p className="text-gray-400 text-xs mt-0.5">DIY steps, pro tips, and find a local pro</p>
          </div>
          <span className="text-gray-500 text-xl">›</span>
        </Link>
      </div>
    </main>
  );
}
