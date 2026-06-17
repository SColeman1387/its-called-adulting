"use client";
import { useState } from "react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/data";

type Stage = "form" | "submitted";

const EXAMPLE_PROMPTS = [
  "I didn't know you had to clean the lint trap on the dryer every single load…",
  "I didn't know your landlord's insurance doesn't cover any of your stuff…",
  "I didn't know tires need to be rotated, not just replaced when they go flat…",
  "I didn't know you have to tell your insurance when you move…",
  "I didn't know grocery stores mark up produce on the ends of aisles…",
  "I didn't know a security deposit has to be returned within 30 days in Ohio…",
];

const COST_OPTIONS = [
  { id: "nothing-yet", label: "Nothing yet — just want others to know" },
  { id: "under-100", label: "Under $100" },
  { id: "100-500", label: "$100 – $500" },
  { id: "500-2000", label: "$500 – $2,000" },
  { id: "over-2000", label: "Over $2,000" },
  { id: "stress", label: "No money — just stress / embarrassment" },
];

export default function SuggestPage() {
  const [stage, setStage] = useState<Stage>("form");
  const [didntKnow, setDidntKnow] = useState("");
  const [whyMatters, setWhyMatters] = useState("");
  const [category, setCategory] = useState("");
  const [cost, setCost] = useState("");
  const [exampleIndex, setExampleIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const MAX_CHARS = 280;

  const handleDidntKnow = (val: string) => {
    if (val.length <= MAX_CHARS) {
      setDidntKnow(val);
      setCharCount(val.length);
    }
  };

  const canSubmit = didntKnow.trim().length > 20;

  const handleSubmit = () => {
    // In production: POST to API. For now, save to localStorage as a queue.
    const submissions = JSON.parse(localStorage.getItem("ica_suggestions") || "[]");
    submissions.push({
      id: Date.now(),
      didntKnow: didntKnow.trim(),
      whyMatters: whyMatters.trim(),
      category,
      cost,
      submittedAt: new Date().toISOString(),
    });
    localStorage.setItem("ica_suggestions", JSON.stringify(submissions));
    setStage("submitted");
  };

  const nextPrompt = () => setExampleIndex((i) => (i + 1) % EXAMPLE_PROMPTS.length);
  const usePrompt = () => {
    const prompt = EXAMPLE_PROMPTS[exampleIndex];
    setDidntKnow(prompt);
    setCharCount(prompt.length);
  };

  if (stage === "submitted") {
    return (
      <main className="max-w-lg mx-auto px-4 pb-16">
        <div className="pt-8 pb-4">
          <Link href="/" className="text-sm text-orange-600 font-medium">← Home</Link>
        </div>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💡</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank you.</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-2">
            That&apos;s exactly the kind of thing this app exists for.
          </p>
          <p className="text-gray-400 text-sm mb-8">
            We review every submission. If yours becomes a guide, thousands of people will know what you didn&apos;t — and that&apos;s the whole point.
          </p>
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 mb-6 text-left">
            <div className="text-xs font-bold text-orange-600 uppercase tracking-wide mb-2">Your submission</div>
            <p className="text-sm text-gray-800 font-medium leading-relaxed">&ldquo;{didntKnow}&rdquo;</p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => {
                setStage("form");
                setDidntKnow("");
                setWhyMatters("");
                setCategory("");
                setCost("");
                setCharCount(0);
              }}
              className="w-full py-3 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-colors"
            >
              Submit another →
            </button>
            <Link
              href="/"
              className="block w-full py-3 border border-gray-200 rounded-2xl text-sm text-gray-600 text-center hover:bg-gray-50"
            >
              Back to tasks
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-lg mx-auto px-4 pb-16">
      <div className="pt-8 pb-2">
        <Link href="/" className="text-sm text-orange-600 font-medium">← Home</Link>
      </div>

      {/* Header */}
      <div className="pt-4 pb-6">
        <div className="text-4xl mb-3">💡</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          What else didn&apos;t you know?
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          Tell us something that blindsided you — a cost, a rule, a maintenance thing, a life skill nobody taught you.
          If enough people say the same thing, it becomes a guide in the app.
        </p>
      </div>

      {/* Example prompt helper */}
      <div className="mb-5 bg-gray-50 border border-gray-100 rounded-2xl p-4">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Need a spark? Here&apos;s an example:</div>
        <p className="text-sm text-gray-600 italic mb-3">&ldquo;{EXAMPLE_PROMPTS[exampleIndex]}&rdquo;</p>
        <div className="flex gap-2">
          <button onClick={usePrompt} className="text-xs text-orange-600 font-semibold border border-orange-200 rounded-lg px-3 py-1.5 hover:bg-orange-50">
            Use this as a starting point
          </button>
          <button onClick={nextPrompt} className="text-xs text-gray-400 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-100">
            Show another
          </button>
        </div>
      </div>

      {/* Main input */}
      <div className="mb-5">
        <label className="text-sm font-bold text-gray-900 mb-2 block">
          &ldquo;I didn&apos;t know that&hellip;&rdquo; <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <textarea
            value={didntKnow}
            onChange={(e) => handleDidntKnow(e.target.value)}
            placeholder="…you need to change your cabin air filter every year, and a clogged one makes your AC smell and work harder."
            rows={4}
            className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 resize-none leading-relaxed"
          />
          <div className={`absolute bottom-3 right-3 text-xs font-medium ${charCount > MAX_CHARS * 0.85 ? "text-orange-500" : "text-gray-300"}`}>
            {charCount}/{MAX_CHARS}
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-1">Be specific — the more concrete, the more useful it is to someone else.</p>
      </div>

      {/* Why it matters */}
      <div className="mb-5">
        <label className="text-sm font-bold text-gray-900 mb-2 block">
          Why does it matter if you don&apos;t know?
          <span className="text-gray-400 font-normal ml-1">(optional)</span>
        </label>
        <textarea
          value={whyMatters}
          onChange={(e) => setWhyMatters(e.target.value)}
          placeholder="What happens if you ignore it? What did it cost you — money, time, stress?"
          rows={3}
          className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 resize-none leading-relaxed"
        />
      </div>

      {/* Category */}
      <div className="mb-5">
        <label className="text-sm font-bold text-gray-900 mb-2 block">
          What area of life is this?
          <span className="text-gray-400 font-normal ml-1">(optional)</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.filter(c => c.id !== "guides").map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(category === cat.id ? "" : cat.id)}
              className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 text-sm transition-all ${
                category === cat.id
                  ? "border-orange-400 bg-orange-50"
                  : "border-gray-100 bg-white hover:border-gray-200"
              }`}
            >
              <span className="text-xl">{cat.icon}</span>
              <span className={`text-xs font-medium ${category === cat.id ? "text-orange-700" : "text-gray-600"}`}>
                {cat.label}
              </span>
            </button>
          ))}
          <button
            onClick={() => setCategory(category === "other" ? "" : "other")}
            className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 text-sm transition-all ${
              category === "other"
                ? "border-orange-400 bg-orange-50"
                : "border-gray-100 bg-white hover:border-gray-200"
            }`}
          >
            <span className="text-xl">🤷</span>
            <span className={`text-xs font-medium ${category === "other" ? "text-orange-700" : "text-gray-600"}`}>Other</span>
          </button>
        </div>
      </div>

      {/* Cost */}
      <div className="mb-7">
        <label className="text-sm font-bold text-gray-900 mb-2 block">
          Did not knowing this cost you anything?
          <span className="text-gray-400 font-normal ml-1">(optional)</span>
        </label>
        <div className="space-y-2">
          {COST_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setCost(cost === opt.id ? "" : opt.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                cost === opt.id
                  ? "border-orange-400 bg-orange-50"
                  : "border-gray-100 bg-white hover:border-gray-200"
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                cost === opt.id ? "border-orange-500 bg-orange-500" : "border-gray-300"
              }`}>
                {cost === opt.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </div>
              <span className={`text-sm ${cost === opt.id ? "text-orange-800 font-medium" : "text-gray-700"}`}>
                {opt.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${
          canSubmit
            ? "bg-orange-500 text-white hover:bg-orange-600"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
      >
        Submit →
      </button>
      {!canSubmit && (
        <p className="text-center text-xs text-gray-400 mt-2">
          Fill in the &ldquo;I didn&apos;t know that…&rdquo; field to submit
        </p>
      )}

      <p className="text-center text-xs text-gray-400 mt-4 leading-relaxed">
        Every submission is reviewed. Good ones become guides. Great ones get credited.
      </p>
    </main>
  );
}
