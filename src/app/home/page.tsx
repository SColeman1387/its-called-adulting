"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CATEGORIES, getSeasonalTasks, getCurrentSeason } from "@/lib/data";
import { getProfile, UserProfile, Vehicle, getMilesUntilOilChange, getOilChangeStatus } from "@/lib/profile";
import MileageCheckin from "@/components/MileageCheckin";
import { getWeeklyLesson, getThisWeekRecord, getLearningStreak } from "@/lib/learning";
import { getTotalPoints } from "@/lib/points";
import { TASK_SUPPLIES } from "@/lib/supplies";
import { Task } from "@/lib/data";
import { isTaskDue, getLastCompletion } from "@/lib/streaks";
import InstallPrompt, { IOSInstructions, useInstallState } from "@/components/InstallPrompt";
import { createClient } from "@supabase/supabase-js";
import { migrateLocalStorageToSupabase } from "@/lib/migrateLocalStorage";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const seasonEmoji: Record<string, string> = {
  spring: "🌱",
  summer: "☀️",
  fall: "🍂",
  winter: "❄️",
};

const difficultyColor: Record<string, string> = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  hard: "bg-red-100 text-red-700",
};

export default function Home() {
  const season = getCurrentSeason();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [weeklyLesson, setWeeklyLesson] = useState<Task | null>(null);
  const [lessonDone, setLessonDone] = useState(false);
  const [learningStreak, setLearningStreak] = useState(0);
  const [points, setPoints] = useState(0);
  const [trashDay, setTrashDay] = useState<number | null>(null);
  const [trashDone, setTrashDone] = useState(false);
  const [recyclingDay, setRecyclingDay] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [pendingInvite, setPendingInvite] = useState<{ token: string; parentName: string } | null>(null);
  const [showIOSHelp, setShowIOSHelp] = useState(false);
  const { platform, standalone } = useInstallState();

  useEffect(() => {
    const p = getProfile();
    if (!p?.setupComplete) {
      window.location.href = "/setup";
      return;
    }
    setProfile(p);
    setVehicles(p.vehicles ?? []);
    const raw = localStorage.getItem("ica_completed_tasks");
    if (raw) {
      try { setCompletedTasks(new Set(JSON.parse(raw))); } catch { /* ignore */ }
    }
    const lesson = getWeeklyLesson(p ?? undefined);
    setWeeklyLesson(lesson);
    const record = getThisWeekRecord();
    setLessonDone(!!record?.response);
    setLearningStreak(getLearningStreak());
    setPoints(getTotalPoints());

    // Trash reminder state
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setUserId(data.user.id);
      migrateLocalStorageToSupabase(supabase, data.user.id);
      // Check for pending parent invite
      supabase.from("parent_links")
        .select("invite_token, profiles!parent_links_parent_id_fkey(display_name, email)")
        .eq("child_id", data.user.id)
        .eq("status", "pending")
        .single()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then(({ data: invite }: { data: any }) => {
          if (invite?.invite_token) {
            const p = invite.profiles;
            setPendingInvite({
              token: invite.invite_token,
              parentName: p?.display_name ?? p?.email ?? "A parent",
            });
          }
        });

      supabase.from("profiles").select("trash_day, trash_done_week, recycling_day").eq("id", data.user.id).single().then(({ data: prof }) => {
        if (prof?.trash_day != null) setTrashDay(prof.trash_day);
        if (prof?.recycling_day != null) setRecyclingDay(prof.recycling_day);
        const now = new Date();
        const weekKey = `${now.getFullYear()}-W${Math.ceil((now.getDate() - now.getDay() + 1 + 6) / 7)}`;
        if (prof?.trash_done_week === weekKey) setTrashDone(true);
      });
    });

    // Handle trash=done from push notification tap
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("trash") === "done") {
      setTrashDone(true);
    }

    setLoaded(true);
  }, []);

  const seasonalTasks = getSeasonalTasks(profile).filter((task) => {
    if (task.checkInterval) {
      // Recurring: only show when due again
      return isTaskDue(task.id, task.checkInterval);
    } else {
      // One-time: hide once completed
      return !completedTasks.has(task.id);
    }
  });
  const oilStatus = profile ? getOilChangeStatus(profile) : null;
  const milesUntilOil = profile ? getMilesUntilOilChange(profile) : null;

  if (!loaded) return null;

  return (
    <main className="max-w-2xl mx-auto px-4 pb-24">
      <InstallPrompt />
      {/* Pending parent invite banner */}
      {pendingInvite && (
        <Link
          href={`/parent/accept?token=${pendingInvite.token}`}
          className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 mt-4 mb-2"
        >
          <span className="text-2xl">👨‍👩‍👧</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-blue-900">{pendingInvite.parentName} wants to link with you</p>
            <p className="text-xs text-blue-600">Tap to accept or decline →</p>
          </div>
        </Link>
      )}

      {/* Header */}
      <div className="pt-12 pb-6 text-center">
        <div className="text-5xl mb-3">🏠</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          It&apos;s Called Adulting
        </h1>
        <p className="text-gray-500 text-sm">
          &ldquo;How was I supposed to know that?&rdquo;
        </p>
        <p className="text-gray-400 text-xs mt-1">
          Everything your dad would have taught you — all in one place.
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 text-xs font-medium px-3 py-1.5 rounded-full">
            <span>{seasonEmoji[season]}</span>
            <span>Showing tasks for {season}{profile?.city ? ` in ${profile.city}` : profile?.state ? ` in ${profile.state}` : ""}</span>
          </div>
          <Link href="/rewards" className="inline-flex items-center gap-1.5 bg-[#0f1f3d] text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-[#1a2f55] transition-colors">
            <span>⭐</span>
            <span>{points.toLocaleString()} Adulting Bucks</span>
          </Link>
          <Link href="/settings/trash" className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors">
            <span>🗑️</span>
            <span>{trashDay !== null ? `Trash: ${DAYS[trashDay]}s` : "Set trash day"}</span>
          </Link>
        </div>
      </div>

      {/* Search bar */}
      <Link
        href="/search"
        className="flex items-center gap-3 mb-6 px-4 py-3 bg-white rounded-2xl border border-gray-200 hover:border-orange-300 transition-colors shadow-sm"
      >
        <span className="text-gray-400">🔍</span>
        <span className="text-gray-400 text-sm">Search tasks…</span>
      </Link>

      {/* Weekly Lesson Card */}
      {weeklyLesson && (
        <Link
          href="/learn"
          className={`block mb-6 rounded-2xl border-2 p-5 transition-all hover:shadow-md ${
            lessonDone
              ? "bg-gray-50 border-gray-200"
              : "bg-gradient-to-br from-orange-500 to-amber-500 border-orange-400"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold uppercase tracking-widest ${lessonDone ? "text-gray-400" : "text-orange-100"}`}>
                This Week&apos;s Lesson
              </span>
              {learningStreak > 1 && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${lessonDone ? "bg-orange-100 text-orange-600" : "bg-white bg-opacity-20 text-white"}`}>
                  🔥 {learningStreak} weeks
                </span>
              )}
            </div>
            {lessonDone && <span className="text-xs text-green-600 font-bold">✓ Done</span>}
          </div>
          <h3 className={`text-base font-bold mb-1 leading-snug ${lessonDone ? "text-gray-700" : "text-white"}`}>
            {weeklyLesson.title}
          </h3>
          <p className={`text-xs leading-relaxed line-clamp-2 ${lessonDone ? "text-gray-400" : "text-orange-100"}`}>
            💡 {weeklyLesson.howDidIKnow}
          </p>
          {!lessonDone && (
            <div className="mt-3 inline-flex items-center gap-1 bg-white bg-opacity-20 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              Open lesson →
            </div>
          )}
        </Link>
      )}

      {/* Setup prompt for new users */}
      {!profile?.setupComplete && (
        <div className="mb-6 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-5 text-white">
          <div className="text-2xl mb-1">👋 Welcome!</div>
          <div className="font-bold text-lg mb-1">Tell us what you own</div>
          <p className="text-orange-100 text-sm mb-4">
            Takes 2 minutes. We&apos;ll only show tasks that apply to you.
          </p>
          <Link
            href="/setup"
            className="inline-block bg-white text-orange-600 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-orange-50 transition-colors"
          >
            Set up my profile →
          </Link>
        </div>
      )}

      {/* Profile summary if setup complete */}
      {profile?.setupComplete && (
        <div className="mb-6 flex items-center justify-between bg-white rounded-2xl border border-gray-100 px-4 py-3">
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">Your profile:</span>{" "}
            {profile.homeType === "apartment" ? "Apartment" : profile.homeType === "rent-house" ? "Renting a house" : "Homeowner"}
            {vehicles.length > 0 ? ` · ${vehicles.length} vehicle${vehicles.length > 1 ? "s" : ""}` : profile.hasCar ? " · Car" : ""}
            {profile.hasPool ? " · Pool" : ""}
            {profile.hasYard ? " · Yard" : ""}
          </div>
          <Link href="/setup" className="text-xs text-orange-500 font-medium ml-2 shrink-0">
            Edit
          </Link>
        </div>
      )}

      {/* Trash reminder card */}
      {trashDay !== null && !trashDone && (() => {
        const now = new Date();
        const today = now.getDay();
        const tomorrow = (today + 1) % 7;
        const isToday = today === trashDay;
        const isTomorrow = tomorrow === trashDay;
        if (!isToday && !isTomorrow) return null;
        return (
          <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-2xl border bg-blue-50 border-blue-200">
            <span className="text-xl">🗑️</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-blue-800">
                {isToday ? "Trash day today!" : "Trash day tomorrow!"}
              </p>
              <p className="text-xs text-blue-600">
                {isToday ? "Have you set out your bins?" : "Don't forget to set out your bins tonight."}
              </p>
            </div>
            <button
              onClick={async () => {
                setTrashDone(true);
                if (userId) {
                  await fetch("/api/push/trash-done", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId }),
                  });
                }
              }}
              className="shrink-0 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-blue-700"
            >
              ✓ Done!
            </button>
          </div>
        );
      })()}

      {/* Recycling reminder card */}
      {recyclingDay !== null && (() => {
        const now = new Date();
        const today = now.getDay();
        const tomorrow = (today + 1) % 7;
        const isToday = today === recyclingDay;
        const isTomorrow = tomorrow === recyclingDay;
        if (!isToday && !isTomorrow) return null;
        return (
          <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-2xl border bg-green-50 border-green-200">
            <span className="text-xl">♻️</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-green-800">
                {isToday ? "Recycling day today!" : "Recycling day tomorrow!"}
              </p>
              <p className="text-xs text-green-600">
                {isToday ? "Have you set out your recycling bins?" : "Don't forget to set out your recycling tonight."}
              </p>
            </div>
          </div>
        );
      })()}

      {/* Vehicle mileage check-in + oil change alerts */}
      <MileageCheckin
        vehicles={vehicles}
        onUpdate={setVehicles}
      />

      {/* Completed tasks badge */}
      {completedTasks.size > 0 && (
        <div className="mb-6 flex items-center gap-2 bg-green-50 border border-green-100 rounded-2xl px-4 py-3">
          <span className="text-green-600 text-lg">✓</span>
          <span className="text-sm text-green-700 font-medium">
            {completedTasks.size} task{completedTasks.size !== 1 ? "s" : ""} completed all-time
          </span>
        </div>
      )}

      {/* Toolkit shortcut */}
      <Link
        href="/toolkit"
        className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-r from-slate-800 to-gray-900 rounded-2xl hover:opacity-90 transition-opacity"
      >
        <span className="text-3xl">🔧</span>
        <div className="flex-1">
          <div className="font-bold text-white text-sm">Your Adulting Toolkit</div>
          <div className="text-gray-400 text-xs mt-0.5">12 essential tools — one unlocks each month</div>
        </div>
        <span className="text-gray-500 text-lg">›</span>
      </Link>

      {/* Categories */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Browse by Category
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.id}`}
              className={`flex items-center gap-3 p-4 rounded-2xl ${cat.bgColor} hover:opacity-80 transition-opacity`}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className={`font-semibold text-sm ${cat.color}`}>
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Seasonal tasks */}
      <section>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          {seasonEmoji[season]} Right Now — {season.charAt(0).toUpperCase() + season.slice(1)} Tasks
        </h2>
        {seasonalTasks.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            <div className="text-3xl mb-3">✓</div>
            <p className="font-medium text-gray-500">All caught up!</p>
            <p className="mt-1">No tasks due right now. Check back soon.</p>
            <Link href="/setup" className="text-orange-500 font-medium mt-3 inline-block">Update your profile →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {seasonalTasks.map((task) => {
              const lastDone = task.checkInterval ? getLastCompletion(task.id) : null;
              return (
                <Link
                  key={task.id}
                  href={`/task/${task.id}`}
                  className="flex items-start gap-4 p-4 rounded-2xl transition-shadow border bg-white shadow-sm hover:shadow-md border-gray-100"
                >
                  <span className="text-2xl mt-0.5">
                    {CATEGORIES.find((c) => c.id === task.category)?.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-gray-900">{task.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColor[task.difficulty]}`}>
                        {task.difficulty}
                      </span>
                      {lastDone && (
                        <span className="text-xs text-orange-500 font-medium">↻ due again</span>
                      )}
                    </div>
                    <p className="text-orange-600 text-xs mt-1 line-clamp-2 font-medium leading-relaxed">
                      💡 {task.howDidIKnow}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">⏱ {task.timeEstimate}</p>
                    {TASK_SUPPLIES[task.id] && (
                      <a
                        href={TASK_SUPPLIES[task.id][0].amazonUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-[#FF9900] hover:underline"
                      >
                        🛒 Need supplies for this? →
                      </a>
                    )}
                  </div>
                  <span className="text-gray-300 text-lg self-center">›</span>
                </Link>
              );
            })}
          </div>
        )}
        <Link
          href="/category/home"
          className="mt-4 block text-center text-sm text-orange-600 font-medium py-3"
        >
          Browse all tasks →
        </Link>
      </section>

      {/* What else didn't you know? */}
      <section className="mt-6">
        <Link
          href="/suggest"
          className="flex items-center gap-4 p-5 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl hover:opacity-90 transition-opacity"
        >
          <span className="text-3xl">💡</span>
          <div className="flex-1">
            <div className="font-bold text-white text-sm">What else didn&apos;t you know?</div>
            <div className="text-gray-400 text-xs mt-0.5">
              Tell us what blindsided you — good submissions become guides
            </div>
          </div>
          <span className="text-gray-500 text-lg">›</span>
        </Link>
      </section>

      {/* iOS Add to Home Screen — always accessible, shown when not in standalone */}
      {platform === "ios" && !standalone && (
        <section className="mt-6">
          <button
            onClick={() => setShowIOSHelp(true)}
            className="w-full flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl hover:bg-blue-100 transition-colors text-left"
          >
            <span className="text-2xl">📱</span>
            <div className="flex-1">
              <div className="font-semibold text-blue-900 text-sm">Add to Home Screen</div>
              <div className="text-blue-600 text-xs mt-0.5">Opens like a real app — no browser bar</div>
            </div>
            <span className="text-blue-400 text-lg">›</span>
          </button>
        </section>
      )}
      {showIOSHelp && <IOSInstructions onClose={() => setShowIOSHelp(false)} />}

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center justify-around px-2 py-2 z-50">
        <Link href="/home" className="flex flex-col items-center gap-0.5 px-3 py-1 text-orange-500">
          <span className="text-xl">🏠</span>
          <span className="text-xs font-medium">Home</span>
        </Link>
        <Link href="/learn" className="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-400 hover:text-gray-600 relative">
          <span className="text-xl">📚</span>
          <span className="text-xs font-medium">Learn</span>
          {!lessonDone && <span className="absolute top-0 right-2 w-2 h-2 bg-orange-500 rounded-full" />}
        </Link>
        <Link href="/toolkit" className="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-400 hover:text-gray-600">
          <span className="text-xl">🔧</span>
          <span className="text-xs font-medium">Toolkit</span>
        </Link>
        {vehicles.length > 0 && (
          <Link href="/vehicles" className="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-400 hover:text-gray-600">
            <span className="text-xl">🚗</span>
            <span className="text-xs font-medium">Vehicles</span>
          </Link>
        )}
        <Link href="/rewards" className="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-400 hover:text-gray-600">
          <span className="text-xl">🏆</span>
          <span className="text-xs font-medium">Rewards</span>
        </Link>
        <Link href="/share" className="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-400 hover:text-gray-600">
          <span className="text-xl">🔗</span>
          <span className="text-xs font-medium">Share</span>
        </Link>
      </nav>
    </main>
  );
}
