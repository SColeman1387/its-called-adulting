"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getProfile, saveProfile, UserProfile } from "@/lib/profile";
import {
  getTrips, logTrip, deleteTrip, getEstimatedMileage,
  setMileageBaseline, getMileageBaseline, getAvgMilesPerDay,
  getDaysUntilOilChange, Trip,
} from "@/lib/mileage";

type Sheet = "log" | "baseline" | null;

export default function CarDashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [estimated, setEstimated] = useState<number | null>(null);
  const [avgPerDay, setAvgPerDay] = useState<number | null>(null);
  const [daysUntil, setDaysUntil] = useState<number | null>(null);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [tripMiles, setTripMiles] = useState("");
  const [tripLabel, setTripLabel] = useState("");
  const [baselineMiles, setBaselineMiles] = useState("");
  const [justSaved, setJustSaved] = useState(false);

  const reload = () => {
    const p = getProfile();
    setProfile(p);
    const t = getTrips().slice().reverse();
    setTrips(t);
    const est = getEstimatedMileage();
    setEstimated(est);
    setAvgPerDay(getAvgMilesPerDay());
    if (p?.oilChangeInterval && p?.lastOilChangeMileage) {
      setDaysUntil(getDaysUntilOilChange(p.oilChangeInterval, p.lastOilChangeMileage));
    }
    const baseline = getMileageBaseline();
    if (baseline) setBaselineMiles(String(baseline.mileage));
  };

  useEffect(() => { reload(); }, []);

  if (!profile) return null;

  const interval = profile.oilChangeInterval ?? 5000;
  const lastChange = profile.lastOilChangeMileage ?? 0;
  const milesDriven = estimated ? Math.max(0, estimated - lastChange) : null;
  const milesLeft = milesDriven !== null ? interval - milesDriven : null;
  const status: "overdue" | "due-soon" | "ok" | null =
    milesLeft === null ? null :
    milesLeft <= 0 ? "overdue" :
    milesLeft <= 500 ? "due-soon" : "ok";

  const pct = milesDriven !== null ? Math.min(100, Math.round((milesDriven / interval) * 100)) : 0;

  const statusStyle = {
    overdue: { bg: "bg-red-50 border-red-200", bar: "bg-red-500", text: "text-red-700", badge: "bg-red-100 text-red-700" },
    "due-soon": { bg: "bg-orange-50 border-orange-200", bar: "bg-orange-500", text: "text-orange-700", badge: "bg-orange-100 text-orange-700" },
    ok: { bg: "bg-green-50 border-green-200", bar: "bg-green-500", text: "text-green-700", badge: "bg-green-100 text-green-700" },
  };

  const handleLogTrip = () => {
    const m = parseFloat(tripMiles);
    if (!m || m <= 0) return;
    logTrip(m, tripLabel || undefined);
    setTripMiles("");
    setTripLabel("");
    setSheet(null);
    reload();
    flash();
  };

  const handleSetBaseline = () => {
    const m = parseInt(baselineMiles);
    if (!m) return;
    setMileageBaseline(m);
    if (profile) {
      const updated = { ...profile, currentMileage: m, lastOilChangeMileage: profile.lastOilChangeMileage ?? m };
      saveProfile(updated);
    }
    setSheet(null);
    reload();
    flash();
  };

  const handleDeleteTrip = (id: string) => {
    deleteTrip(id);
    reload();
  };

  const recordOilChange = () => {
    if (!estimated || !profile) return;
    const updated = { ...profile, lastOilChangeMileage: Math.round(estimated), currentMileage: Math.round(estimated) };
    saveProfile(updated);
    setMileageBaseline(Math.round(estimated));
    setProfile(updated);
    reload();
    flash();
  };

  const flash = () => { setJustSaved(true); setTimeout(() => setJustSaved(false), 1800); };

  const locationStr = profile.city ? `${profile.city} ${profile.state ?? ""}`.trim() : profile.state ?? "near me";
  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent((profile.preferredOilShop || "oil change") + " " + locationStr)}`;

  return (
    <main className="max-w-2xl mx-auto px-4 pb-24">
      <div className="pt-8 pb-4">
        <Link href="/category/car" className="text-sm text-orange-600 font-medium">← Car Care</Link>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">🚗</span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {profile.carYear && profile.carMake ? `${profile.carYear} ${profile.carMake}` : "Your Car"}
          </h1>
          <p className="text-sm text-gray-400">Mileage tracker · Oil change monitor</p>
        </div>
      </div>

      {justSaved && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-2xl px-4 py-3 text-sm text-green-700 font-semibold">✓ Saved</div>
      )}

      {/* Estimated odometer */}
      <section className="mb-4 bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Estimated Odometer</span>
          <button onClick={() => setSheet("baseline")} className="text-xs text-orange-500 font-semibold border border-orange-200 rounded-lg px-2.5 py-1 hover:bg-orange-50">
            Set reading
          </button>
        </div>
        {estimated !== null ? (
          <div>
            <p className="text-3xl font-bold text-gray-900">{estimated.toLocaleString()} <span className="text-base font-normal text-gray-400">mi</span></p>
            {avgPerDay !== null && (
              <p className="text-xs text-gray-400 mt-0.5">~{Math.round(avgPerDay)} mi/day avg · based on {trips.length} logged trip{trips.length !== 1 ? "s" : ""}</p>
            )}
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-400 mb-2">No odometer reading yet.</p>
            <button onClick={() => setSheet("baseline")} className="text-sm text-orange-600 font-semibold">
              Enter current odometer →
            </button>
          </div>
        )}
      </section>

      {/* Log a trip */}
      <button
        onClick={() => setSheet("log")}
        className="w-full mb-4 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition-colors"
      >
        <span className="text-lg">➕</span> Log a Drive
      </button>

      {/* Oil Change Status */}
      {status && milesLeft !== null ? (
        <section className={`mb-4 rounded-2xl border p-5 ${statusStyle[status].bg}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛢️</span>
              <span className={`text-sm font-bold ${statusStyle[status].text}`}>Oil Change</span>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusStyle[status].badge}`}>
              {status === "overdue" ? "Overdue" : status === "due-soon" ? "Due Soon" : "Good"}
            </span>
          </div>

          <p className={`text-2xl font-bold mb-0.5 ${statusStyle[status].text}`}>
            {status === "overdue"
              ? `${Math.abs(milesLeft).toLocaleString()} mi past due`
              : `${milesLeft.toLocaleString()} mi remaining`}
          </p>
          <p className="text-xs text-gray-500 mb-3">
            {milesDriven?.toLocaleString()} of {interval.toLocaleString()} miles driven since last change
            {daysUntil !== null && daysUntil > 0 && ` · ~${daysUntil} days`}
          </p>

          {/* Progress bar */}
          <div className="w-full bg-white bg-opacity-60 rounded-full h-3 mb-4">
            <div className={`h-3 rounded-full transition-all ${statusStyle[status].bar}`} style={{ width: `${pct}%` }} />
          </div>

          <div className="flex gap-2">
            <a
              href={profile.preferredOilShopPhone ? `tel:${profile.preferredOilShopPhone}` : googleUrl}
              target={profile.preferredOilShopPhone ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="flex-1 bg-white border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-center text-gray-800 hover:bg-gray-50"
            >
              {profile.preferredOilShopPhone
                ? `📞 ${profile.preferredOilShop ?? "Call shop"}`
                : "🔍 Find a shop"}
            </a>
            <button
              onClick={recordOilChange}
              disabled={!estimated}
              className="flex-1 bg-gray-900 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-gray-700 disabled:opacity-40"
            >
              ✓ Just got it done
            </button>
          </div>
        </section>
      ) : (
        <section className="mb-4 bg-gray-50 border border-gray-200 rounded-2xl p-4">
          <p className="text-sm text-gray-500">
            Log some trips and set an odometer reading to see your oil change status here.
          </p>
        </section>
      )}

      {/* Recent trips */}
      {trips.length > 0 && (
        <section className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recent Trips</p>
            <p className="text-xs text-gray-300">{trips.length} logged</p>
          </div>
          <div className="space-y-2">
            {trips.slice(0, 8).map((trip) => (
              <div key={trip.id} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3">
                <span className="text-base">🛣️</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{trip.miles.toLocaleString()} miles</p>
                  <p className="text-xs text-gray-400">
                    {trip.label && <span className="mr-1">{trip.label} · </span>}
                    {new Date(trip.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
                <button onClick={() => handleDeleteTrip(trip.id)} className="text-gray-200 hover:text-red-400 text-sm px-1">✕</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Preferred shop */}
      <section className="mb-4 bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="text-sm font-bold text-gray-900 mb-3">🏪 Preferred Shop</h2>
        {profile.preferredOilShop ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">{profile.preferredOilShop}</p>
              {profile.preferredOilShopPhone && (
                <a href={`tel:${profile.preferredOilShopPhone}`} className="text-sm text-orange-500">{profile.preferredOilShopPhone}</a>
              )}
            </div>
            <div className="flex gap-2">
              {profile.preferredOilShopPhone && (
                <a href={`tel:${profile.preferredOilShopPhone}`} className="bg-orange-500 text-white text-xs font-bold px-3 py-2 rounded-xl">📞 Call</a>
              )}
              <Link href="/setup" className="text-xs text-gray-400 border border-gray-200 rounded-xl px-3 py-2">Edit</Link>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">No preferred shop saved</p>
            <Link href="/setup" className="text-sm text-orange-500 font-semibold border border-orange-200 rounded-xl px-3 py-1.5">Add shop</Link>
          </div>
        )}
      </section>

      {/* Car tasks quick links */}
      <section>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Car Tasks</p>
        <div className="space-y-2">
          {[
            { href: "/task/tire-pressure", icon: "🔵", label: "Check Tire Pressure", sub: "Every 30 days" },
            { href: "/task/oil-check", icon: "🛢️", label: "Check Oil Level", sub: "Every 30 days" },
            { href: "/task/jump-start", icon: "⚡", label: "Jump Start a Car", sub: "Know before you need it" },
            { href: "/task/change-flat", icon: "🔧", label: "Change a Flat Tire", sub: "Know before you need it" },
            { href: "/task/after-accident", icon: "🚨", label: "After an Accident", sub: "Read now, use later" },
            { href: "/tools/car-inspector", icon: "🔍", label: "Used Car Inspector", sub: "Before you buy" },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-sm transition-shadow">
              <span className="text-xl">{item.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-400">{item.sub}</p>
              </div>
              <span className="text-gray-300 text-lg">›</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Log a drive sheet ── */}
      {sheet === "log" && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: "rgba(0,0,0,0.4)" }} onClick={() => setSheet(null)}>
          <div className="w-full bg-white rounded-t-3xl p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Log a Drive</h2>
            <div className="mb-3">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Miles driven</label>
              <input
                type="number"
                inputMode="decimal"
                placeholder="e.g. 12.5"
                value={tripMiles}
                onChange={(e) => setTripMiles(e.target.value)}
                autoFocus
                className="w-full border-2 border-orange-400 rounded-xl px-4 py-3 text-lg font-bold focus:outline-none"
              />
            </div>
            <div className="mb-5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Label <span className="font-normal normal-case">(optional)</span></label>
              <input
                type="text"
                placeholder="e.g. Work commute, Road trip"
                value={tripLabel}
                onChange={(e) => setTripLabel(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400"
              />
            </div>
            {/* Quick presets */}
            <div className="flex gap-2 mb-5">
              {[5, 10, 20, 50].map((m) => (
                <button key={m} onClick={() => setTripMiles(String(m))} className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-colors ${tripMiles === String(m) ? "border-orange-400 bg-orange-50 text-orange-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>{m} mi</button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSheet(null)} className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm text-gray-600">Cancel</button>
              <button onClick={handleLogTrip} disabled={!tripMiles || parseFloat(tripMiles) <= 0} className="flex-1 py-3 rounded-2xl bg-orange-500 text-white text-sm font-bold disabled:opacity-40 hover:bg-orange-600">
                Log Drive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Set baseline sheet ── */}
      {sheet === "baseline" && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: "rgba(0,0,0,0.4)" }} onClick={() => setSheet(null)}>
          <div className="w-full bg-white rounded-t-3xl p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Set Odometer Reading</h2>
            <p className="text-sm text-gray-500 mb-4">Enter what your odometer shows right now. We&apos;ll add all logged trips on top of this.</p>
            <div className="mb-5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Current odometer (miles)</label>
              <input
                type="number"
                inputMode="numeric"
                placeholder="e.g. 47500"
                value={baselineMiles}
                onChange={(e) => setBaselineMiles(e.target.value)}
                autoFocus
                className="w-full border-2 border-orange-400 rounded-xl px-4 py-3 text-lg font-bold focus:outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">Check your dashboard or the sticker from your last oil change.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSheet(null)} className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm text-gray-600">Cancel</button>
              <button onClick={handleSetBaseline} disabled={!baselineMiles} className="flex-1 py-3 rounded-2xl bg-orange-500 text-white text-sm font-bold disabled:opacity-40 hover:bg-orange-600">
                Save Reading
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
