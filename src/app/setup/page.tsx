"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserProfile, Vehicle, DEFAULT_PROFILE, saveProfile } from "@/lib/profile";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function detectLocation(): Promise<{ city?: string; state?: string }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve({}); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || "";
          const state = data.address?.state || "";
          resolve({ city, state });
        } catch { resolve({}); }
      },
      () => resolve({})
    );
  });
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type Step = "home" | "city" | "car" | "outdoor" | "indoor" | "trash" | "toys" | "done";

const STEPS: Step[] = ["home", "city", "car", "outdoor", "indoor", "trash", "toys", "done"];

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("home");
  const [profile, setProfile] = useState<UserProfile>({ ...DEFAULT_PROFILE });
  const [showUpsell, setShowUpsell] = useState(false);
  const [trashDay, setTrashDay] = useState<number | null>(null);
  const [recyclingDay, setRecyclingDay] = useState<number | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [editingVehicleIdx, setEditingVehicleIdx] = useState<number | null>(null);

  const newBlankVehicle = (): Vehicle => ({
    id: crypto.randomUUID(),
    nickname: "",
    mileageHistory: [],
    serviceHistory: [],
  });

  const updateVehicle = (idx: number, patch: Partial<Vehicle>) =>
    setVehicles((vs) => vs.map((v, i) => i === idx ? { ...v, ...patch } : v));

  const addVehicle = () => {
    setVehicles((vs) => [...vs, newBlankVehicle()]);
    setEditingVehicleIdx(vehicles.length);
  };

  const removeVehicle = (idx: number) =>
    setVehicles((vs) => vs.filter((_, i) => i !== idx));

  const stepIndex = STEPS.indexOf(step);
  const progress = Math.round((stepIndex / (STEPS.length - 1)) * 100);

  const update = (patch: Partial<UserProfile>) =>
    setProfile((p) => ({ ...p, ...patch }));

  const next = () => setStep(STEPS[stepIndex + 1]);
  const back = () => setStep(STEPS[stepIndex - 1]);

  const finish = async () => {
    saveProfile({ ...profile, vehicles, hasCar: vehicles.length > 0, setupComplete: true });
    // Save trash/recycling days to Supabase if user set them
    if (trashDay !== null || recyclingDay !== null) {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        await supabase.from("profiles").update({
          ...(trashDay !== null ? { trash_day: trashDay } : {}),
          ...(recyclingDay !== null ? { recycling_day: recyclingDay } : {}),
        }).eq("id", data.user.id);
      }
    }
    setShowUpsell(true);
  };

  const goHome = () => router.push("/home");

  return (
    <main className="max-w-lg mx-auto px-4 pb-16">

      {/* Subscription upsell modal shown after setup completes */}
      {showUpsell && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
            <div className="text-center mb-5">
              <div className="text-5xl mb-3">⭐</div>
              <h2 className="text-xl font-black text-gray-900 mb-1">You&apos;re all set up.</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Subscribe now and get <span className="font-bold text-orange-500">100 bonus Adulting Bucks</span> — that&apos;s a head start toward your first gift card.
              </p>
            </div>
            <div className="bg-orange-50 rounded-2xl p-4 mb-5 space-y-2">
              {[
                "Earn Adulting Bucks on every task you complete",
                "Redeem for real Amazon gift cards",
                "100 bonus points just for subscribing today",
                "Cancel anytime",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm text-orange-900">
                  <span className="text-orange-500 font-bold shrink-0">✓</span>
                  {item}
                </div>
              ))}
            </div>
            <div className="text-center mb-3">
              <span className="text-2xl font-black text-gray-900">$4.99</span>
              <span className="text-sm text-gray-400">/month</span>
            </div>
            <a
              href="/rewards"
              className="block w-full py-4 bg-orange-500 text-white font-bold rounded-2xl text-center hover:bg-orange-600 transition-colors mb-3"
            >
              Start earning → Get 100 bonus points
            </a>
            <button
              onClick={goHome}
              className="w-full text-sm text-gray-400 hover:text-gray-600 py-2"
            >
              Skip for now — take me to the app
            </button>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="pt-10 pb-6 text-center">
        <div className="text-4xl mb-2">🏠</div>
        <h1 className="text-2xl font-bold text-gray-900">Quick Setup</h1>
        <p className="text-gray-500 text-sm mt-1">
          Tell us what you own so we only show you what&apos;s relevant.
        </p>
        {/* Progress */}
        <div className="mt-5 flex items-center gap-2">
          <div className="flex-1 bg-gray-100 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 w-10 text-right">{Math.min(stepIndex + 1, STEPS.length - 1)}/{STEPS.length - 1}</span>
        </div>
      </div>

      {/* Step: Home */}
      {step === "home" && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Where do you live?</h2>
          <p className="text-sm text-gray-500 mb-5">This determines which home maintenance tasks apply to you.</p>
          <div className="space-y-3">
            {[
              { id: "apartment", label: "Apartment", sub: "Renting a unit — landlord handles most outside stuff", emoji: "🏢" },
              { id: "rent-house", label: "Renting a House", sub: "You're responsible for more than in an apartment", emoji: "🏡" },
              { id: "own-house", label: "I Own My Home", sub: "Full responsibility — gutters, roof, foundation and all", emoji: "🏠" },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  update({ homeType: opt.id as UserProfile["homeType"] });
                  next();
                }}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                  profile.homeType === opt.id
                    ? "border-orange-400 bg-orange-50"
                    : "border-gray-100 bg-white hover:border-orange-200"
                }`}
              >
                <span className="text-3xl">{opt.emoji}</span>
                <div>
                  <div className="font-semibold text-gray-900">{opt.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{opt.sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step: City */}
      {step === "city" && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Where are you located?</h2>
          <p className="text-sm text-gray-500 mb-4">We use this to show tasks and tips relevant to your state — like DMV rules, renter&apos;s rights, and local resources.</p>
          <button
            onClick={async () => {
              const loc = await detectLocation();
              if (loc.city || loc.state) update({ city: loc.city, state: loc.state });
            }}
            className="w-full py-3 mb-4 border-2 border-dashed border-orange-200 rounded-xl text-sm text-orange-600 font-semibold hover:bg-orange-50 transition-colors"
          >
            📍 Detect my location automatically
          </button>
          <div className="space-y-3 mb-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">City</label>
              <input
                type="text"
                value={profile.city ?? ""}
                onChange={(e) => update({ city: e.target.value })}
                placeholder="e.g. Chicago"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">State</label>
              <select
                value={profile.state ?? ""}
                onChange={(e) => update({ state: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-white"
              >
                <option value="">Select your state…</option>
                {["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={next}
            className="w-full py-3.5 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600"
          >
            {(profile.city?.trim() || profile.state) ? "Continue →" : "Skip for now →"}
          </button>
        </div>
      )}

      {/* Step: Car */}
      {step === "car" && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Your vehicles</h2>
          <p className="text-sm text-gray-500 mb-5">Add each vehicle — we&apos;ll track oil changes and remind you monthly to update your mileage.</p>

          {/* Vehicle list */}
          <div className="space-y-3 mb-4">
            {vehicles.map((v, idx) => (
              <div key={v.id} className="border-2 border-gray-100 rounded-2xl overflow-hidden">
                {/* Vehicle header */}
                <button
                  onClick={() => setEditingVehicleIdx(editingVehicleIdx === idx ? null : idx)}
                  className="w-full flex items-center gap-3 p-4 text-left bg-white"
                >
                  <span className="text-2xl">🚗</span>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{v.nickname || `Vehicle ${idx + 1}`}</div>
                    <div className="text-xs text-gray-400">{[v.year, v.make].filter(Boolean).join(" ") || "Tap to add details"}</div>
                  </div>
                  <span className="text-gray-400 text-sm">{editingVehicleIdx === idx ? "▲" : "▼"}</span>
                </button>

                {/* Expanded form */}
                {editingVehicleIdx === idx && (
                  <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Nickname</label>
                      <input
                        type="text"
                        placeholder='e.g. My Truck or Wifes SUV'
                        value={v.nickname}
                        onChange={(e) => updateVehicle(idx, { nickname: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Year</label>
                        <input
                          type="number"
                          placeholder="2019"
                          value={v.year || ""}
                          onChange={(e) => updateVehicle(idx, { year: e.target.value })}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Make & Model</label>
                        <input
                          type="text"
                          placeholder="Ford F-150"
                          value={v.make || ""}
                          onChange={(e) => updateVehicle(idx, { make: e.target.value })}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Current Mileage</label>
                      <input
                        type="number"
                        placeholder="47500"
                        value={v.mileageHistory[0]?.mileage || ""}
                        onChange={(e) => {
                          const m = parseInt(e.target.value);
                          updateVehicle(idx, {
                            mileageHistory: m ? [{ date: new Date().toISOString(), mileage: m }] : [],
                          });
                        }}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Last Oil Change Mileage</label>
                      <input
                        type="number"
                        placeholder="45000 (check windshield sticker)"
                        value={v.lastOilChangeMileage || ""}
                        onChange={(e) => updateVehicle(idx, { lastOilChangeMileage: parseInt(e.target.value) || undefined })}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Oil type</label>
                      <div className="grid grid-cols-2 gap-2">
                        {([
                          { val: 3000, label: "Conventional", sub: "3,000 mi" },
                          { val: 5000, label: "Synthetic Blend", sub: "5,000 mi" },
                          { val: 7500, label: "Full Synthetic", sub: "7,500 mi" },
                          { val: 10000, label: "Full Synthetic+", sub: "10,000 mi" },
                        ] as { val: 3000 | 5000 | 7500 | 10000; label: string; sub: string }[]).map((opt) => (
                          <button
                            key={opt.val}
                            onClick={() => updateVehicle(idx, { oilChangeInterval: opt.val })}
                            className={`flex flex-col p-2.5 rounded-xl border-2 text-left transition-all ${
                              v.oilChangeInterval === opt.val
                                ? "border-orange-400 bg-orange-50"
                                : "border-gray-100 bg-white"
                            }`}
                          >
                            <span className="text-xs font-bold text-gray-900">{opt.label}</span>
                            <span className="text-xs text-gray-400">{opt.sub}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => removeVehicle(idx)}
                      className="text-xs text-red-400 font-medium mt-1"
                    >
                      Remove this vehicle
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={addVehicle}
            className="w-full py-3 border-2 border-dashed border-orange-200 rounded-2xl text-sm font-semibold text-orange-500 hover:bg-orange-50 transition-colors mb-6"
          >
            + Add {vehicles.length === 0 ? "a vehicle" : "another vehicle"}
          </button>

          <div className="flex gap-3">
            <button onClick={back} className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm text-gray-600">← Back</button>
            <button onClick={next} className="flex-1 py-3 rounded-2xl bg-orange-500 text-white text-sm font-semibold">
              {vehicles.length === 0 ? "Skip →" : "Continue →"}
            </button>
          </div>
        </div>
      )}

      {/* Step: Outdoor */}
      {step === "outdoor" && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">What do you have outside?</h2>
          <p className="text-sm text-gray-500 mb-5">Select everything that applies.</p>
          <div className="space-y-3 mb-6">
            {[
              { key: "hasYard", label: "Yard / Lawn", sub: "Mowing, fertilizing, watering", emoji: "🌿" },
              { key: "hasPool", label: "Pool", sub: "We'll ask above or in-ground next", emoji: "🏊" },
            ].map((opt) => {
              const checked = profile[opt.key as keyof UserProfile] as boolean;
              return (
                <button
                  key={opt.key}
                  onClick={() => update({ [opt.key]: !checked } as Partial<UserProfile>)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                    checked ? "border-orange-400 bg-orange-50" : "border-gray-100 bg-white hover:border-orange-200"
                  }`}
                >
                  <span className="text-3xl">{opt.emoji}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{opt.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{opt.sub}</div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${checked ? "border-orange-500 bg-orange-500" : "border-gray-300"}`}>
                    {checked && <span className="text-white text-xs font-bold">✓</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {profile.hasPool && (
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">What type of pool?</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: "above-ground", label: "Above Ground", emoji: "🪣" },
                  { val: "in-ground", label: "In-Ground", emoji: "🏊" },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    onClick={() => update({ poolType: opt.val as UserProfile["poolType"] })}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                      profile.poolType === opt.val
                        ? "border-blue-400 bg-blue-50"
                        : "border-gray-100 bg-white hover:border-blue-200"
                    }`}
                  >
                    <span className="text-3xl">{opt.emoji}</span>
                    <span className="text-sm font-semibold text-gray-900">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={back} className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
              ← Back
            </button>
            <button onClick={next} className="flex-1 py-3 rounded-2xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600">
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step: Indoor */}
      {step === "indoor" && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">What do you have inside?</h2>
          <p className="text-sm text-gray-500 mb-5">Select everything that applies.</p>
          <div className="space-y-3 mb-6">
            {[
              { key: "hasPets", label: "Pets", sub: "More frequent filter & vent cleaning needed", emoji: "🐾" },
              { key: "hasWaterSoftener", label: "Water Softener", sub: "Needs salt added regularly", emoji: "💧" },
              { key: "hasDryer", label: "Washer & Dryer", sub: "Vent cleaning prevents house fires", emoji: "👕" },
              { key: "hasFireplace", label: "Fireplace", sub: "Chimney cleaning and inspection", emoji: "🔥" },
            ].map((opt) => {
              const checked = profile[opt.key as keyof UserProfile] as boolean;
              return (
                <button
                  key={opt.key}
                  onClick={() => update({ [opt.key]: !checked } as Partial<UserProfile>)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                    checked ? "border-orange-400 bg-orange-50" : "border-gray-100 bg-white hover:border-orange-200"
                  }`}
                >
                  <span className="text-3xl">{opt.emoji}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{opt.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{opt.sub}</div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${checked ? "border-orange-500 bg-orange-500" : "border-gray-300"}`}>
                    {checked && <span className="text-white text-xs font-bold">✓</span>}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button onClick={back} className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
              ← Back
            </button>
            <button onClick={next} className="flex-1 py-3 rounded-2xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600">
              See My Tasks →
            </button>
          </div>
        </div>
      )}

      {/* Step: Trash & Recycling */}
      {step === "trash" && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">🗑️ Trash & Recycling</h2>
          <p className="text-sm text-gray-500 mb-5">We'll remind you the night before so you never miss pickup day.</p>

          <div className="space-y-5 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-3">What day is trash picked up?</label>
              <div className="grid grid-cols-4 gap-2">
                {DAYS.map((day, i) => (
                  <button
                    key={day}
                    onClick={() => setTrashDay(trashDay === i ? null : i)}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                      trashDay === i ? "bg-orange-500 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-3">What day is recycling picked up?</label>
              <div className="grid grid-cols-4 gap-2">
                {DAYS.map((day, i) => (
                  <button
                    key={day}
                    onClick={() => setRecyclingDay(recyclingDay === i ? null : i)}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                      recyclingDay === i ? "bg-blue-500 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">Skip if same day as trash or no recycling service</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={back} className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
              ← Back
            </button>
            <button onClick={next} className="flex-1 py-3 rounded-2xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600">
              {trashDay !== null || recyclingDay !== null ? "Save & Continue →" : "Skip →"}
            </button>
          </div>
        </div>
      )}

      {/* Toys */}
      {step === "toys" && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Any toys or extras?</h2>
          <p className="text-gray-500 text-sm mb-6">We&apos;ll add seasonal maintenance reminders for whatever you own.</p>
          <div className="space-y-3">
            {[
              { key: "hasBoat", emoji: "⛵", label: "Boat", sub: "Winterizing, engine flush, battery, bilge" },
              { key: "hasGolfCart", emoji: "🏌️", label: "Golf Cart", sub: "Battery maintenance, tire pressure, charging" },
              { key: "hasUTV", emoji: "🏕️", label: "UTV / ATV", sub: "Oil changes, air filter, belt inspection" },
              { key: "hasRV", emoji: "🚌", label: "RV / Camper", sub: "Winterizing, roof seals, generator, tanks" },
            ].map(({ key, emoji, label, sub }) => {
              const checked = profile[key as keyof UserProfile] as boolean;
              return (
                <button
                  key={key}
                  onClick={() => update({ [key]: !checked })}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                    checked ? "border-orange-500 bg-orange-50" : "border-gray-100 bg-white"
                  }`}
                >
                  <span className="text-3xl">{emoji}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    checked ? "border-orange-500 bg-orange-500" : "border-gray-300"
                  }`}>
                    {checked && <span className="text-white text-xs font-bold">✓</span>}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex gap-3 mt-8">
            <button onClick={back} className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-500">← Back</button>
            <button onClick={next} className="flex-1 py-3 rounded-2xl bg-orange-500 text-white font-bold text-sm">
              {[profile.hasBoat, profile.hasGolfCart, profile.hasUTV, profile.hasRV].some(Boolean) ? "Add my toys →" : "Skip →"}
            </button>
          </div>
        </div>
      )}

      {/* Done */}
      {step === "done" && (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re all set!</h2>
          <p className="text-gray-500 text-sm mb-2">
            We&apos;ve personalized your task list based on what you own.
          </p>
          {profile.hasCar && (
            <p className="text-gray-500 text-sm mb-6">
              Check the <strong>Guides</strong> section for the used car buying checklist — great for when you&apos;re shopping.
            </p>
          )}
          <div className="bg-orange-50 rounded-2xl p-4 text-left mb-6 space-y-2">
            <div className="text-sm font-semibold text-orange-800 mb-2">Your setup:</div>
            <div className="text-sm text-orange-700">🏠 {profile.homeType === "apartment" ? "Apartment" : profile.homeType === "rent-house" ? "Renting a house" : "Own your home"}</div>
            {vehicles.length > 0 && <div className="text-sm text-orange-700">🚗 {vehicles.length} vehicle{vehicles.length > 1 ? "s" : ""} ({vehicles.map(v => v.nickname || v.make || "Vehicle").join(", ")})</div>}
            {profile.hasPool && <div className="text-sm text-orange-700">🏊 {profile.poolType === "above-ground" ? "Above-ground pool" : "In-ground pool"}</div>}
            {profile.hasYard && <div className="text-sm text-orange-700">🌿 Yard / lawn</div>}
            {profile.hasPets && <div className="text-sm text-orange-700">🐾 Pets</div>}
            {profile.hasWaterSoftener && <div className="text-sm text-orange-700">💧 Water softener</div>}
            {profile.hasDryer && <div className="text-sm text-orange-700">👕 Washer & dryer</div>}
            {profile.hasFireplace && <div className="text-sm text-orange-700">🔥 Fireplace</div>}
            {trashDay !== null && <div className="text-sm text-orange-700">🗑️ Trash pickup: {DAYS[trashDay]}s</div>}
            {recyclingDay !== null && <div className="text-sm text-orange-700">♻️ Recycling pickup: {DAYS[recyclingDay]}s</div>}
          </div>
          <button
            onClick={finish}
            className="w-full py-4 rounded-2xl bg-orange-500 text-white font-bold text-base hover:bg-orange-600 transition-colors"
          >
            Let&apos;s Go →
          </button>
          <button onClick={back} className="mt-3 text-sm text-gray-400 hover:text-gray-600">
            ← Go back and change something
          </button>
        </div>
      )}
    </main>
  );
}
