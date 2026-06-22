"use client";
import { useState } from "react";
import { Vehicle, getLatestMileage, getOilChangeStatusV2, predictOilChangeMonths, saveProfile, getProfile } from "@/lib/profile";

interface Props {
  vehicles: Vehicle[];
  onUpdate: (updated: Vehicle[]) => void;
}

export default function MileageCheckin({ vehicles, onUpdate }: Props) {
  const [open, setOpen] = useState(false);
  const [mileageInputs, setMileageInputs] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  if (!vehicles.length) return null;

  // Show checkin card if any vehicle hasn't been updated in 30+ days
  const needsCheckin = vehicles.some((v) => {
    if (!v.mileageHistory.length) return true;
    const last = v.mileageHistory[v.mileageHistory.length - 1];
    const daysSince = (Date.now() - new Date(last.date).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince >= 30;
  });

  // Show oil change warnings even if checkin not due
  const hasWarnings = vehicles.some((v) => {
    const s = getOilChangeStatusV2(v);
    return s === "overdue" || s === "due-soon";
  });

  if (!needsCheckin && !hasWarnings) return null;

  const handleSave = () => {
    const now = new Date().toISOString();
    const updated = vehicles.map((v) => {
      const raw = mileageInputs[v.id];
      const m = raw ? parseInt(raw) : NaN;
      if (isNaN(m) || m <= 0) return v;
      const history = [...v.mileageHistory, { date: now, mileage: m }];
      return { ...v, mileageHistory: history };
    });

    const profile = getProfile();
    if (profile) {
      saveProfile({ ...profile, vehicles: updated });
    }
    onUpdate(updated);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setOpen(false);
      setMileageInputs({});
    }, 1500);
  };

  return (
    <div className="mb-6">
      {/* Oil change alerts */}
      {vehicles.map((v) => {
        const status = getOilChangeStatusV2(v);
        if (!status || status === "ok") return null;
        const latest = getLatestMileage(v);
        const predicted = predictOilChangeMonths(v);
        return (
          <div
            key={v.id}
            className={`rounded-2xl p-4 mb-3 flex items-start gap-3 ${
              status === "overdue"
                ? "bg-red-50 border border-red-100"
                : "bg-orange-50 border border-orange-100"
            }`}
          >
            <span className="text-2xl shrink-0">{status === "overdue" ? "🔴" : "🟡"}</span>
            <div className="flex-1 min-w-0">
              <p className={`font-bold text-sm ${status === "overdue" ? "text-red-700" : "text-orange-700"}`}>
                {v.nickname || v.make || "Your vehicle"} — oil change {status === "overdue" ? "overdue" : "due soon"}
              </p>
              <p className={`text-xs mt-0.5 ${status === "overdue" ? "text-red-500" : "text-orange-500"}`}>
                {latest ? `${latest.toLocaleString()} mi on record` : ""}
                {predicted !== null && predicted > 0
                  ? ` · ~${Math.round(predicted)} month${Math.round(predicted) === 1 ? "" : "s"} away at your pace`
                  : ""}
              </p>
            </div>
          </div>
        );
      })}

      {/* Monthly mileage check-in card */}
      {needsCheckin && !open && (
        <button
          onClick={() => setOpen(true)}
          className="w-full bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3 text-left"
        >
          <span className="text-2xl shrink-0">📍</span>
          <div className="flex-1">
            <p className="font-bold text-sm text-blue-800">Monthly mileage check-in</p>
            <p className="text-xs text-blue-500 mt-0.5">
              Update your mileage so we can predict your next oil change
            </p>
          </div>
          <span className="text-blue-400 text-sm shrink-0">Update →</span>
        </button>
      )}

      {needsCheckin && open && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-gray-900 mb-1">What&apos;s your mileage?</h3>
          <p className="text-xs text-gray-400 mb-4">Check your dashboard — it only takes a second.</p>

          <div className="space-y-3 mb-5">
            {vehicles.map((v) => (
              <div key={v.id}>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                  {v.nickname || v.make || `Vehicle`}
                  {v.make && v.nickname ? ` (${v.make})` : ""}
                </label>
                <input
                  type="number"
                  placeholder={`e.g. ${(getLatestMileage(v) ?? 50000).toLocaleString()}`}
                  value={mileageInputs[v.id] ?? ""}
                  onChange={(e) => setMileageInputs((prev) => ({ ...prev, [v.id]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                />
              </div>
            ))}
          </div>

          {saved ? (
            <div className="w-full py-3 bg-green-500 text-white font-bold rounded-xl text-sm text-center">
              ✓ Saved
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm text-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-bold text-sm"
              >
                Save mileage →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
