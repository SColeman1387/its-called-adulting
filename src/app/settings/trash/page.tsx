"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export default function TrashReminderPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [trashDay, setTrashDay] = useState<number | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [permissionState, setPermissionState] = useState<string>("default");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setUserId(data.user.id);
      supabase.from("profiles").select("trash_day").eq("id", data.user.id).single().then(({ data: p }) => {
        if (p?.trash_day != null) { setTrashDay(p.trash_day); setEnabled(true); }
      });
    });
    if ("Notification" in window) setPermissionState(Notification.permission);
  }, []);

  const requestAndSubscribe = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("Push notifications aren't supported on this browser.");
      return false;
    }

    const permission = await Notification.requestPermission();
    setPermissionState(permission);
    if (permission !== "granted") return false;

    const reg = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
    });

    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, subscription: sub }),
    });

    return true;
  };

  const save = async () => {
    if (trashDay === null) return;
    setSaving(true);

    const subscribed = await requestAndSubscribe();
    if (!subscribed) { setSaving(false); return; }

    await supabase.from("profiles").update({ trash_day: trashDay }).eq("id", userId!);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const disable = async () => {
    await supabase.from("profiles").update({ trash_day: null }).eq("id", userId!);
    setEnabled(false);
    setTrashDay(null);
  };

  return (
    <main className="max-w-lg mx-auto px-4 pb-16">
      <div className="pt-8 pb-4">
        <Link href="/home" className="text-sm text-orange-600 font-medium">← Home</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-3">🗑️ Trash Reminders</h1>
        <p className="text-gray-500 text-sm mt-1">Never miss trash day again. Pick your pickup day and we'll remind you the morning before and again on the day itself.</p>
      </div>

      {permissionState === "denied" && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-4">
          <p className="text-sm text-red-700 font-medium">Notifications blocked</p>
          <p className="text-xs text-red-500 mt-1">Go to your browser settings and allow notifications for this site, then come back.</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-3">What day is your trash picked up?</label>
          <div className="grid grid-cols-4 gap-2">
            {DAYS.map((day, i) => (
              <button
                key={day}
                onClick={() => { setTrashDay(i); setEnabled(true); }}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  trashDay === i
                    ? "bg-orange-500 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={save}
          disabled={trashDay === null || saving}
          className="w-full py-3.5 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 disabled:opacity-50 transition-colors"
        >
          {saving ? "Setting up…" : saved ? "✓ Reminders saved!" : "Enable Trash Reminders"}
        </button>

        {enabled && trashDay !== null && (
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-1">
              Reminding you every {DAYS[trashDay]} — morning before and morning of.
            </p>
            <button onClick={disable} className="text-xs text-red-400 hover:text-red-600">
              Turn off reminders
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 bg-orange-50 rounded-2xl p-4">
        <p className="text-xs text-orange-700 font-medium mb-1">💡 How it works</p>
        <ul className="text-xs text-orange-600 space-y-1">
          <li>• Morning before trash day: heads up reminder</li>
          <li>• Morning of trash day: reminder until you tap "Done!"</li>
          <li>• Resets automatically every week</li>
        </ul>
      </div>
    </main>
  );
}
