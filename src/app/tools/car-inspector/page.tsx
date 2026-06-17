"use client";
import { useState } from "react";
import Link from "next/link";
import {
  INSPECTION_GROUPS,
  INSPECTION_QUESTIONS,
  calculateResult,
  AnswerMap,
  InspectionQuestion,
} from "@/lib/car-inspector";

type Screen = "intro" | "questions" | "results";

const riskColors = {
  critical: "border-red-400 bg-red-50",
  major: "border-orange-400 bg-orange-50",
  minor: "border-yellow-400 bg-yellow-50",
  info: "border-blue-400 bg-blue-50",
};

const riskBadge = {
  critical: "bg-red-100 text-red-700",
  major: "bg-orange-100 text-orange-700",
  minor: "bg-yellow-100 text-yellow-700",
  info: "bg-blue-100 text-blue-700",
};

const verdictConfig = {
  "walk-away": {
    emoji: "🚨",
    label: "Walk Away",
    color: "bg-red-500",
    textColor: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  "negotiate-hard": {
    emoji: "⚠️",
    label: "Negotiate Hard",
    color: "bg-orange-500",
    textColor: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  "inspect-first": {
    emoji: "🔍",
    label: "Get It Inspected First",
    color: "bg-yellow-500",
    textColor: "text-yellow-700",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  "looks-good": {
    emoji: "✅",
    label: "Looks Promising",
    color: "bg-green-500",
    textColor: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
};

function FlagCard({ q }: { q: InspectionQuestion }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className={`w-full text-left p-4 rounded-2xl border-2 ${riskColors[q.risk]} transition-all`}
    >
      <div className="flex items-start gap-3">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${riskBadge[q.risk]}`}>
          {q.dealBreaker ? "DEAL BREAKER" : q.risk.toUpperCase()}
        </span>
        <div className="flex-1">
          <div className="text-sm font-semibold text-gray-900">{q.question}</div>
          {q.estimatedCost && (
            <div className="text-xs text-gray-600 mt-0.5">💸 {q.estimatedCost}</div>
          )}
          {expanded && (
            <div className="mt-2 text-xs text-gray-700 leading-relaxed border-t border-gray-200 pt-2">
              <span className="font-semibold text-gray-500 block mb-1">How was I supposed to know that?</span>
              {q.why}
            </div>
          )}
        </div>
        <span className="text-gray-400 shrink-0">{expanded ? "▲" : "▼"}</span>
      </div>
    </button>
  );
}

export default function CarInspectorPage() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [carName, setCarName] = useState("");

  const currentGroup = INSPECTION_GROUPS[currentGroupIndex];
  const groupQuestions = INSPECTION_QUESTIONS.filter(
    (q) => q.group === currentGroup?.id
  );
  const currentQuestion = groupQuestions[currentQuestionIndex];
  const totalAnswered = Object.keys(answers).length;
  const totalQuestions = INSPECTION_QUESTIONS.length;
  const progress = Math.round((totalAnswered / totalQuestions) * 100);

  function answer(val: "yes" | "no") {
    const newAnswers = { ...answers, [currentQuestion.id]: val };
    setAnswers(newAnswers);
    advance(newAnswers);
  }

  function skip() {
    const newAnswers: AnswerMap = { ...answers, [currentQuestion.id]: "skip" };
    setAnswers(newAnswers);
    advance(newAnswers);
  }

  function advance(newAnswers: AnswerMap) {
    const isBad = newAnswers[currentQuestion.id] === currentQuestion.badAnswer;
    const isDealBreaker = currentQuestion.dealBreaker && isBad;

    // If deal breaker answered badly, jump straight to results
    if (isDealBreaker) {
      setScreen("results");
      return;
    }

    const nextQ = currentQuestionIndex + 1;
    if (nextQ < groupQuestions.length) {
      setCurrentQuestionIndex(nextQ);
    } else {
      const nextGroup = currentGroupIndex + 1;
      if (nextGroup < INSPECTION_GROUPS.length) {
        setCurrentGroupIndex(nextGroup);
        setCurrentQuestionIndex(0);
      } else {
        setScreen("results");
      }
    }
  }

  function goBack() {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentGroupIndex > 0) {
      const prevGroup = INSPECTION_GROUPS[currentGroupIndex - 1];
      const prevGroupQs = INSPECTION_QUESTIONS.filter(
        (q) => q.group === prevGroup.id
      );
      setCurrentGroupIndex(currentGroupIndex - 1);
      setCurrentQuestionIndex(prevGroupQs.length - 1);
    }
  }

  function restart() {
    setAnswers({});
    setCurrentGroupIndex(0);
    setCurrentQuestionIndex(0);
    setCarName("");
    setScreen("intro");
  }

  const result = screen === "results" ? calculateResult(answers) : null;
  const verdict = result ? verdictConfig[result.verdict] : null;

  // --- INTRO ---
  if (screen === "intro") {
    return (
      <main className="max-w-lg mx-auto px-4 pb-16">
        <div className="pt-8 pb-4">
          <Link href="/" className="text-sm text-orange-600 font-medium mb-4 inline-block">
            ← Home
          </Link>
        </div>
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🚗</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Used Car Inspector
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Answer yes/no questions as you walk around the car.
            We&apos;ll tell you exactly what each issue means, what it costs to fix,
            and whether to buy, negotiate, or run.
          </p>
        </div>

        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-6">
          <div className="text-sm font-semibold text-orange-800 mb-2">
            📋 What this covers ({INSPECTION_QUESTIONS.length} checks across {INSPECTION_GROUPS.length} areas)
          </div>
          <div className="space-y-1">
            {INSPECTION_GROUPS.map((g) => (
              <div key={g.id} className="flex items-center gap-2 text-sm text-orange-700">
                <span>{g.icon}</span>
                <span className="font-medium">{g.label}</span>
                <span className="text-orange-400 text-xs">— {g.description}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
            What car are you looking at? (optional)
          </label>
          <input
            type="text"
            placeholder="e.g. 2018 Honda Accord"
            value={carName}
            onChange={(e) => setCarName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400"
          />
        </div>

        <button
          onClick={() => setScreen("questions")}
          className="w-full py-4 bg-orange-500 text-white font-bold text-base rounded-2xl hover:bg-orange-600 transition-colors"
        >
          Start Inspection →
        </button>
        <p className="text-center text-xs text-gray-400 mt-3">
          Takes about 5 minutes · Answer only what you can check
        </p>
      </main>
    );
  }

  // --- QUESTIONS ---
  if (screen === "questions" && currentQuestion) {
    const isBad = answers[currentQuestion.id] === currentQuestion.badAnswer;

    return (
      <main className="max-w-lg mx-auto px-4 pb-16">
        {/* Top bar */}
        <div className="pt-8 pb-4 flex items-center justify-between">
          <button onClick={goBack} className="text-sm text-gray-400 hover:text-gray-600">
            ← Back
          </button>
          <span className="text-xs text-gray-400">
            {totalAnswered} / {totalQuestions} answered
          </span>
          <button
            onClick={() => setScreen("results")}
            className="text-xs text-orange-500 font-medium"
          >
            See results →
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6">
          <div
            className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Group header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{currentGroup.icon}</span>
          <div>
            <div className="font-bold text-gray-900">{currentGroup.label}</div>
            <div className="text-xs text-gray-500">{currentGroup.description}</div>
          </div>
        </div>

        {/* Sub-progress dots */}
        <div className="flex gap-1.5 mb-6">
          {groupQuestions.map((q, i) => (
            <div
              key={q.id}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < currentQuestionIndex
                  ? answers[q.id] === q.badAnswer
                    ? "bg-red-400"
                    : "bg-green-400"
                  : i === currentQuestionIndex
                  ? "bg-orange-400"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Car name badge */}
        {carName && (
          <div className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full mb-4">
            🚗 {carName}
          </div>
        )}

        {/* Question card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
          {currentQuestion.dealBreaker && (
            <div className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full mb-3">
              🚨 Deal breaker if yes
            </div>
          )}
          <h2 className="text-lg font-bold text-gray-900 leading-snug mb-4">
            {currentQuestion.question}
          </h2>

          {/* Why box */}
          <div className="bg-gray-50 rounded-xl p-4 mb-5">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
              How was I supposed to know that?
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {currentQuestion.why}
            </p>
            {currentQuestion.estimatedCost && (
              <div className="mt-2 text-xs font-medium text-gray-500">
                💸 If it&apos;s a problem: {currentQuestion.estimatedCost}
              </div>
            )}
          </div>

          {/* Answer buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => answer("yes")}
              className={`py-4 rounded-2xl font-bold text-base transition-all border-2 ${
                answers[currentQuestion.id] === "yes"
                  ? isBad && currentQuestion.badAnswer === "yes"
                    ? "bg-red-500 text-white border-red-500"
                    : "bg-green-500 text-white border-green-500"
                  : "bg-white text-gray-900 border-gray-200 hover:border-gray-400"
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => answer("no")}
              className={`py-4 rounded-2xl font-bold text-base transition-all border-2 ${
                answers[currentQuestion.id] === "no"
                  ? isBad && currentQuestion.badAnswer === "no"
                    ? "bg-red-500 text-white border-red-500"
                    : "bg-green-500 text-white border-green-500"
                  : "bg-white text-gray-900 border-gray-200 hover:border-gray-400"
              }`}
            >
              No
            </button>
          </div>

          <button
            onClick={skip}
            className="w-full mt-3 text-xs text-gray-400 hover:text-gray-600 py-2"
          >
            Can&apos;t check this one → skip
          </button>
        </div>

        {/* Question position */}
        <div className="text-center text-xs text-gray-400">
          Question {currentQuestionIndex + 1} of {groupQuestions.length} in this section
        </div>
      </main>
    );
  }

  // --- RESULTS ---
  if (screen === "results" && result && verdict) {
    return (
      <main className="max-w-lg mx-auto px-4 pb-16">
        <div className="pt-8 pb-4">
          <button onClick={restart} className="text-sm text-orange-600 font-medium">
            ← Start over
          </button>
        </div>

        {/* Verdict header */}
        <div className={`rounded-2xl border-2 ${verdict.borderColor} ${verdict.bgColor} p-6 mb-6 text-center`}>
          {carName && (
            <div className="text-xs text-gray-500 font-medium mb-1">{carName}</div>
          )}
          <div className="text-5xl mb-2">{verdict.emoji}</div>
          <div className={`text-2xl font-black ${verdict.textColor} mb-2`}>
            {verdict.label}
          </div>
          <p className={`text-sm ${verdict.textColor} leading-relaxed`}>
            {result.summary}
          </p>

          {/* Score bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Risk Score</span>
              <span>{result.score}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  result.score >= 75 ? "bg-green-500" :
                  result.score >= 55 ? "bg-yellow-500" :
                  result.score >= 30 ? "bg-orange-500" : "bg-red-500"
                }`}
                style={{ width: `${result.score}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Walk Away</span>
              <span>Looks Good</span>
            </div>
          </div>

          <div className={`mt-3 text-sm font-semibold ${verdict.textColor}`}>
            {result.estimatedRepairCost}
          </div>
        </div>

        {/* Deal breakers */}
        {result.dealBreakers.length > 0 && (
          <section className="mb-5">
            <h3 className="text-xs font-bold text-red-600 uppercase tracking-widest mb-3">
              🚨 Deal Breakers ({result.dealBreakers.length})
            </h3>
            <div className="space-y-2">
              {result.dealBreakers.map((q) => <FlagCard key={q.id} q={q} />)}
            </div>
          </section>
        )}

        {/* Critical flags */}
        {result.criticalFlags.length > 0 && (
          <section className="mb-5">
            <h3 className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-3">
              ⚠️ Critical Issues ({result.criticalFlags.length})
            </h3>
            <div className="space-y-2">
              {result.criticalFlags.map((q) => <FlagCard key={q.id} q={q} />)}
            </div>
          </section>
        )}

        {/* Major flags */}
        {result.majorFlags.length > 0 && (
          <section className="mb-5">
            <h3 className="text-xs font-bold text-yellow-700 uppercase tracking-widest mb-3">
              🔶 Major Concerns ({result.majorFlags.length})
            </h3>
            <div className="space-y-2">
              {result.majorFlags.map((q) => <FlagCard key={q.id} q={q} />)}
            </div>
          </section>
        )}

        {/* Minor flags */}
        {result.minorFlags.length > 0 && (
          <section className="mb-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
              🔹 Minor Items ({result.minorFlags.length})
            </h3>
            <div className="space-y-2">
              {result.minorFlags.map((q) => <FlagCard key={q.id} q={q} />)}
            </div>
          </section>
        )}

        {/* Clean */}
        {result.dealBreakers.length === 0 &&
          result.criticalFlags.length === 0 &&
          result.majorFlags.length === 0 &&
          result.minorFlags.length === 0 && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-5 text-center">
            <div className="text-3xl mb-2">🎉</div>
            <div className="font-bold text-green-800">No red flags found!</div>
            <p className="text-sm text-green-700 mt-1">
              Still get a mechanic to inspect it before you hand over money — it&apos;s always worth the $150.
            </p>
          </div>
        )}

        {/* Negotiation ammo */}
        {result.negotiationAmmo.length > 0 && result.verdict !== "walk-away" && (
          <section className="mb-5">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-blue-800 mb-3">
                💬 What to say when negotiating
              </h3>
              <p className="text-xs text-blue-700 mb-3">
                Use these specific issues to justify a lower price. Be direct — sellers expect it.
              </p>
              <div className="space-y-2">
                {result.negotiationAmmo.slice(0, 5).map((item, i) => (
                  <div key={i} className="text-xs text-blue-900 bg-white rounded-xl p-3 border border-blue-100">
                    &ldquo;I noticed {item.toLowerCase()}&rdquo;
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Next steps */}
        <section className="mb-6">
          <div className="bg-gray-50 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">📋 Your next steps</h3>
            <div className="space-y-2">
              {result.verdict === "walk-away" && (
                <>
                  <div className="text-sm text-gray-700">1. Don&apos;t buy this car.</div>
                  <div className="text-sm text-gray-700">2. Search for a similar vehicle with a cleaner history.</div>
                  <div className="text-sm text-gray-700">3. Run this inspection on the next one before getting attached.</div>
                </>
              )}
              {result.verdict === "negotiate-hard" && (
                <>
                  <div className="text-sm text-gray-700">1. Get the repair estimates above in writing from a mechanic.</div>
                  <div className="text-sm text-gray-700">2. Subtract that total from the asking price and make that offer.</div>
                  <div className="text-sm text-gray-700">3. If they won&apos;t move at least 80% of the way, walk away.</div>
                </>
              )}
              {(result.verdict === "inspect-first" || result.verdict === "looks-good") && (
                <>
                  <div className="text-sm text-gray-700">1. Schedule a pre-purchase inspection with an independent mechanic ($100–$150).</div>
                  <div className="text-sm text-gray-700">2. Use any mechanic findings to negotiate the price.</div>
                  <div className="text-sm text-gray-700">3. Verify the title is clean and transfer it at the Ohio BMV within 30 days of purchase.</div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Find a mechanic CTA */}
        <a
          href="https://www.google.com/search?q=pre+purchase+car+inspection+Columbus+Ohio&tbm=lcl"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-4 bg-blue-600 text-white font-bold text-sm rounded-2xl text-center hover:bg-blue-700 transition-colors mb-3"
        >
          🔍 Find a mechanic for pre-purchase inspection
        </a>
        <button
          onClick={restart}
          className="w-full py-3 border border-gray-200 rounded-2xl text-sm text-gray-600 hover:bg-gray-50"
        >
          Inspect a different car →
        </button>
      </main>
    );
  }

  return null;
}
