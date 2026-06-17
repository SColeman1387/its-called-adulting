"use client";
import { useState } from "react";
import Link from "next/link";
import { searchTasks, CATEGORIES } from "@/lib/data";

const difficultyColor: Record<string, string> = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  hard: "bg-red-100 text-red-700",
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const results = searchTasks(query);

  return (
    <main className="max-w-2xl mx-auto px-4 pb-16">
      <div className="pt-8 pb-4">
        <Link href="/home" className="text-sm text-orange-600 font-medium">← Home</Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Search</h1>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try 'oil change', 'budget', 'mold'…"
            autoFocus
            className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-orange-400"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 text-lg"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {query.length > 0 && (
        <p className="text-xs text-gray-400 mb-4">
          {results.length === 0 ? "No results" : `${results.length} result${results.length !== 1 ? "s" : ""}`} for &ldquo;{query}&rdquo;
        </p>
      )}

      {query.length === 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Browse all categories</p>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.id}`}
              className={`flex items-center gap-3 p-4 rounded-2xl ${cat.bgColor} hover:opacity-80 transition-opacity`}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className={`font-semibold text-sm ${cat.color}`}>{cat.label}</span>
              <span className="ml-auto text-gray-300 text-lg">›</span>
            </Link>
          ))}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((task) => {
            const category = CATEGORIES.find((c) => c.id === task.category);
            return (
              <Link
                key={task.id}
                href={`/task/${task.id}`}
                className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <span className="text-2xl mt-0.5">{category?.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm">{task.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColor[task.difficulty]}`}>
                      {task.difficulty}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${category?.bgColor} ${category?.color}`}>
                      {category?.label}
                    </span>
                  </div>
                  <p className="text-orange-600 text-xs mt-1 line-clamp-2 font-medium leading-relaxed">
                    💡 {task.howDidIKnow}
                  </p>
                </div>
                <span className="text-gray-300 text-lg self-center">›</span>
              </Link>
            );
          })}
        </div>
      )}

      {query.length > 1 && results.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🤷</div>
          <p className="text-gray-500 text-sm mb-1">Nothing found for &ldquo;{query}&rdquo;</p>
          <p className="text-gray-400 text-xs mb-4">
            Think this should be in the app?
          </p>
          <Link href="/suggest" className="inline-block bg-orange-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-orange-600 transition-colors">
            Submit it →
          </Link>
        </div>
      )}
    </main>
  );
}
