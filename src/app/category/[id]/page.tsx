"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CATEGORIES, getTasksByCategory, Category } from "@/lib/data";
import { getProfile, UserProfile, getMilesUntilOilChange, getOilChangeStatus } from "@/lib/profile";
import { getTaskStreak, isTaskDue } from "@/lib/streaks";

const difficultyColor: Record<string, string> = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  hard: "bg-red-100 text-red-700",
};

export default function CategoryPage() {
  const { id } = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  useEffect(() => { setProfile(getProfile()); }, []);

  const category = CATEGORIES.find((c) => c.id === id);
  const tasks = getTasksByCategory(id as Category, profile);
  const oilStatus = id === "car" && profile ? getOilChangeStatus(profile) : null;
  const milesUntil = id === "car" && profile ? getMilesUntilOilChange(profile) : null;

  if (!category) {
    return <div className="p-8 text-center text-gray-500">Category not found.</div>;
  }

  return (
    <main className="max-w-2xl mx-auto px-4 pb-16">
      <div className="pt-8 pb-6">
        <Link href="/" className="text-sm text-orange-600 font-medium mb-4 inline-block">
          ← Back
        </Link>
        <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-2xl ${category.bgColor} mb-2`}>
          <span className="text-3xl">{category.icon}</span>
          <h1 className={`text-xl font-bold ${category.color}`}>{category.label}</h1>
        </div>
        <p className="text-gray-500 text-sm mt-2">
          {tasks.length} task{tasks.length !== 1 ? "s" : ""} in this category
        </p>
      </div>

      {/* Car dashboard banner */}
      {id === "car" && (
        <div className="mb-4">
          {oilStatus && milesUntil !== null ? (
            <Link
              href="/car"
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 mb-3 ${
                oilStatus === "overdue" ? "bg-red-50 border-red-200" :
                oilStatus === "due-soon" ? "bg-orange-50 border-orange-200" :
                "bg-green-50 border-green-200"
              }`}
            >
              <span className="text-3xl">🛢️</span>
              <div className="flex-1">
                <div className={`font-bold text-sm ${oilStatus === "overdue" ? "text-red-700" : oilStatus === "due-soon" ? "text-orange-700" : "text-green-700"}`}>
                  Oil Change {oilStatus === "overdue" ? "Overdue" : oilStatus === "due-soon" ? "Due Soon" : "On Track"}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {oilStatus === "overdue" ? `${Math.abs(milesUntil).toLocaleString()} miles past due` : `${milesUntil.toLocaleString()} miles until next change`}
                </div>
              </div>
              <span className="text-gray-300 text-lg">›</span>
            </Link>
          ) : (
            <Link
              href="/car"
              className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl border-2 border-blue-200 mb-3"
            >
              <span className="text-3xl">🚗</span>
              <div className="flex-1">
                <div className="font-bold text-blue-900 text-sm">Car Dashboard</div>
                <div className="text-xs text-blue-600 mt-0.5">Track oil changes, mileage, and your preferred shop</div>
              </div>
              <span className="text-blue-300 text-lg">›</span>
            </Link>
          )}
        </div>
      )}

      {/* Interactive tools for guides category */}
      {id === "guides" && (
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">🛠 Interactive Tools</h3>
          <div className="space-y-2 mb-4">
            <Link
              href="/tools/car-inspector"
              className="flex items-center gap-4 p-4 bg-indigo-50 rounded-2xl border-2 border-indigo-200 hover:border-indigo-400 transition-all"
            >
              <span className="text-3xl">🚗</span>
              <div className="flex-1">
                <div className="font-bold text-indigo-900 text-sm">Used Car Inspector</div>
                <div className="text-xs text-indigo-600 mt-0.5">Answer yes/no questions → get a risk score & verdict</div>
              </div>
              <span className="text-indigo-300 text-lg">›</span>
            </Link>
            <Link
              href="/tools/move-in-checklist"
              className="flex items-center gap-4 p-4 bg-green-50 rounded-2xl border-2 border-green-200 hover:border-green-400 transition-all"
            >
              <span className="text-3xl">🏠</span>
              <div className="flex-1">
                <div className="font-bold text-green-900 text-sm">Apartment Move-In Checklist</div>
                <div className="text-xs text-green-600 mt-0.5">Document everything before you unpack — protect your deposit</div>
              </div>
              <span className="text-green-300 text-lg">›</span>
            </Link>
            <Link
              href="/tools/lease-checker"
              className="flex items-center gap-4 p-4 bg-orange-50 rounded-2xl border-2 border-orange-200 hover:border-orange-400 transition-all"
            >
              <span className="text-3xl">📄</span>
              <div className="flex-1">
                <div className="font-bold text-orange-900 text-sm">Lease Red-Flag Checker</div>
                <div className="text-xs text-orange-600 mt-0.5">Know what to look for before you sign</div>
              </div>
              <span className="text-orange-300 text-lg">›</span>
            </Link>
          </div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-4 mb-3">📖 Guides</h3>
        </div>
      )}

      <div className="space-y-3">
        {tasks.map((task) => (
          <Link
            key={task.id}
            href={`/task/${task.id}`}
            className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900 text-sm">{task.title}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColor[task.difficulty]}`}>
                  {task.difficulty}
                </span>
                {task.season !== "year-round" && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-600">
                    {task.season}
                  </span>
                )}
                {task.checkInterval && (() => {
                  const s = getTaskStreak(task.id, task.checkInterval);
                  const due = isTaskDue(task.id, task.checkInterval);
                  if (s >= 2) return <span className="text-xs bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full">🔥 {s}×</span>;
                  if (due) return <span className="text-xs bg-red-50 text-red-500 font-bold px-2 py-0.5 rounded-full">Due</span>;
                  return null;
                })()}
              </div>
              <p className="text-orange-600 text-xs mt-1 line-clamp-2 font-medium leading-relaxed">💡 {task.howDidIKnow}</p>
              <p className="text-gray-400 text-xs mt-1">⏱ {task.timeEstimate}</p>
            </div>
            <span className="text-gray-300 text-lg self-center">›</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
