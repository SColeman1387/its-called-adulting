"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserProfile, DEFAULT_PROFILE, saveProfile } from "@/lib/profile";

type Step = "home" | "city" | "car" | "outdoor" | "indoor" | "done";

const STEPS: Step[] = ["home", "city", "car", "outdoor", "indoor", "done"];

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("home");
  const [profile, setProfile] = useState<UserProfile>({ ...DEFAULT_PROFILE });

  const stepIndex = STEPS.indexOf(step);
  const progress = Math.round((stepIndex / (STEPS.length - 1)) * 100);

  const update = (patch: Partial<UserProfile>) =>
    setProfile((p) => ({ ...p, ...patch }));

  const next = () => setStep(STEPS[stepIndex + 1]);
  const back = () => setStep(STEPS[stepIndex - 1]);

  const finish = () => {
    saveProfile({ ...profile, setupComplete: true });
    router.push("/home");
  };

  return (
    <main className="max-w-lg mx-auto px-4 pb-16">
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
          <span className="text-xs text-gray-400 w-10 text-right">{stepIndex + 1}/{STEPS.length - 1}</span>
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
          <p className="text-sm text-gray-500 mb-5">We use this to show tasks and tips relevant to your state — like DMV rules, renter&apos;s rights, and local resources.</p>
          <div className="space-y-3 mb-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">City</label>
              <input
                type="text"
                value={profile.city ?? ""}
                onChange={(e) => update({ city: e.target.value })}
                placeholder="e.g. Columbus"
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
          <h2 className="text-lg font-bold text-gray-900 mb-1">Do you have a car?</h2>
          <p className="text-sm text-gray-500 mb-5">We&apos;ll track your oil change schedule and remind you when it&apos;s due.</p>
          <div className="space-y-3 mb-6">
            {[
              { val: true, label: "Yes, I have a car", emoji: "🚗" },
              { val: false, label: "No car right now", emoji: "🚶" },
            ].map((opt) => (
              <button
                key={String(opt.val)}
                onClick={() => update({ hasCar: opt.val })}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                  profile.hasCar === opt.val
                    ? "border-orange-400 bg-orange-50"
                    : "border-gray-100 bg-white hover:border-orange-200"
                }`}
              >
                <span className="text-3xl">{opt.emoji}</span>
                <span className="font-semibold text-gray-900">{opt.label}</span>
              </button>
            ))}
          </div>

          {profile.hasCar && (
            <div className="space-y-4 mb-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Year</label>
                  <input
                    type="number"
                    placeholder="e.g. 2019"
                    value={profile.carYear || ""}
                    onChange={(e) => update({ carYear: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Make & Model</label>
                  <input
                    type="text"
                    placeholder="e.g. Honda Civic"
                    value={profile.carMake || ""}
                    onChange={(e) => update({ carMake: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Current Mileage</label>
                <input
                  type="number"
                  placeholder="e.g. 47500"
                  value={profile.currentMileage || ""}
                  onChange={(e) => update({ currentMileage: parseInt(e.target.value) || undefined })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Last Oil Change Mileage</label>
                <input
                  type="number"
                  placeholder="e.g. 45000 (check sticker in windshield)"
                  value={profile.lastOilChangeMileage || ""}
                  onChange={(e) => update({ lastOilChangeMileage: parseInt(e.target.value) || undefined })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Oil Type (sets your interval)</label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { val: 3000, label: "Conventional", sub: "Every 3,000 mi" },
                    { val: 5000, label: "Synthetic Blend", sub: "Every 5,000 mi" },
                    { val: 7500, label: "Full Synthetic", sub: "Every 7,500 mi" },
                    { val: 10000, label: "Full Synthetic+", sub: "Every 10,000 mi" },
                  ] as { val: 3000 | 5000 | 7500 | 10000; label: string; sub: string }[]).map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => update({ oilChangeInterval: opt.val })}
                      className={`flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all ${
                        profile.oilChangeInterval === opt.val
                          ? "border-orange-400 bg-orange-50"
                          : "border-gray-100 bg-white hover:border-orange-200"
                      }`}
                    >
                      <span className="text-xs font-bold text-gray-900">{opt.label}</span>
                      <span className="text-xs text-gray-400 mt-0.5">{opt.sub}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1.5">Not sure? Check your owner&apos;s manual or the oil cap under the hood.</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Preferred Oil Change Shop <span className="font-normal normal-case">(optional)</span></label>
                <input
                  type="text"
                  placeholder="e.g. Valvoline on High St"
                  value={profile.preferredOilShop || ""}
                  onChange={(e) => update({ preferredOilShop: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 mb-2"
                />
                <input
                  type="tel"
                  placeholder="Phone number (optional)"
                  value={profile.preferredOilShopPhone || ""}
                  onChange={(e) => update({ preferredOilShopPhone: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button onClick={back} className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
              ← Back
            </button>
            <button onClick={next} className="flex-1 py-3 rounded-2xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600">
              Continue →
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
            {profile.hasCar && <div className="text-sm text-orange-700">🚗 {profile.carYear && profile.carMake ? `${profile.carYear} ${profile.carMake}` : "Car owner"}</div>}
            {profile.hasPool && <div className="text-sm text-orange-700">🏊 {profile.poolType === "above-ground" ? "Above-ground pool" : "In-ground pool"}</div>}
            {profile.hasYard && <div className="text-sm text-orange-700">🌿 Yard / lawn</div>}
            {profile.hasPets && <div className="text-sm text-orange-700">🐾 Pets</div>}
            {profile.hasWaterSoftener && <div className="text-sm text-orange-700">💧 Water softener</div>}
            {profile.hasDryer && <div className="text-sm text-orange-700">👕 Washer & dryer</div>}
            {profile.hasFireplace && <div className="text-sm text-orange-700">🔥 Fireplace</div>}
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
