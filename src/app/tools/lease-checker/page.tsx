"use client";
import { useState } from "react";
import Link from "next/link";

interface Flag {
  id: string;
  question: string;
  redFlagIfYes: boolean;
  explanation: string;
  severity: "dealbreaker" | "warning" | "note";
  tip: string;
}

const FLAGS: Flag[] = [
  {
    id: "no-move-in-inspection",
    question: "Does the lease say you waive the right to a move-in inspection?",
    redFlagIfYes: true,
    explanation: "Without a move-in inspection, you have no proof of pre-existing damage. You'll lose your deposit for damage you didn't cause.",
    severity: "dealbreaker",
    tip: "Ask to add a move-in inspection clause. If they refuse, document everything yourself and email photos before signing.",
  },
  {
    id: "auto-renew",
    question: "Does the lease auto-renew to a new 12-month term without notice?",
    redFlagIfYes: true,
    explanation: "Some leases lock you into another year if you don't give 60–90 days notice. Missing this can trap you in a lease you wanted to leave.",
    severity: "warning",
    tip: "Ask for auto-renewal to convert to month-to-month instead of a new 12-month term.",
  },
  {
    id: "early-termination",
    question: "Is the early termination fee more than 2 months' rent?",
    redFlagIfYes: true,
    explanation: "Life changes. Jobs move. Early termination fees over 2 months are punitive and sometimes illegal to enforce.",
    severity: "warning",
    tip: "Negotiate to cap it at 1–2 months. Also ask about subletting as an exit option.",
  },
  {
    id: "rent-increase-clause",
    question: "Does the lease allow rent increases during the lease term?",
    redFlagIfYes: true,
    explanation: "A lease should lock in your rent for the term. Mid-lease increases are unusual and a red flag.",
    severity: "dealbreaker",
    tip: "Insist on a fixed-rent clause for the full lease term.",
  },
  {
    id: "no-repair-timeline",
    question: "Is there no mention of how quickly the landlord must make repairs?",
    redFlagIfYes: true,
    explanation: "Ohio law requires repairs within a 'reasonable time.' Leases should be more specific. Vagueness protects landlords.",
    severity: "warning",
    tip: "Ask to add: 'Landlord will respond to repair requests within 48 hours and complete repairs within 14 days.'",
  },
  {
    id: "no-deposit-return-timeline",
    question: "Does the lease fail to mention when your deposit will be returned?",
    redFlagIfYes: true,
    explanation: "Ohio law requires return within 30 days — but a lease that ignores this may indicate a landlord unfamiliar with (or deliberately avoiding) their legal obligations.",
    severity: "note",
    tip: "Ohio law already protects you here — 30 days required. But note it as a sign of how professional this landlord is.",
  },
  {
    id: "no-entry-notice",
    question: "Does the lease give the landlord the right to enter without notice?",
    redFlagIfYes: true,
    explanation: "Ohio law requires 24 hours notice before landlord entry (except emergencies). A lease that contradicts this is legally unenforceable — but it's a sign.",
    severity: "dealbreaker",
    tip: "Know that Ohio law overrides this clause. But a landlord who writes this into a lease may not respect your privacy.",
  },
  {
    id: "no-utilities-clarity",
    question: "Are you unclear which utilities you're responsible for after reading the lease?",
    redFlagIfYes: true,
    explanation: "Water, gas, electric, trash, internet — who pays what should be explicit. Ambiguity leads to disputes.",
    severity: "warning",
    tip: "Before signing, get a written list of every utility and who pays it.",
  },
  {
    id: "liability-for-common-areas",
    question: "Does the lease hold you liable for damage in common areas?",
    redFlagIfYes: true,
    explanation: "You should not be responsible for hallways, lobbies, or spaces shared by all tenants.",
    severity: "dealbreaker",
    tip: "Cross out and initial any clause holding you responsible for shared spaces.",
  },
  {
    id: "deposit-non-refundable",
    question: "Does the lease call any part of the security deposit 'non-refundable'?",
    redFlagIfYes: true,
    explanation: "In Ohio, security deposits must be returned minus legitimate deductions. 'Non-refundable deposits' are generally unenforceable.",
    severity: "dealbreaker",
    tip: "Know this is likely unenforceable, but it signals a landlord who may try to keep your deposit regardless.",
  },
  {
    id: "landlord-contact",
    question: "Does the lease lack a specific person and phone number to contact for repairs?",
    redFlagIfYes: true,
    explanation: "You need to know exactly who to call and how to reach them before signing.",
    severity: "note",
    tip: "Ask for a specific name, phone, and email before signing. Get it in writing.",
  },
  {
    id: "long-notice-required",
    question: "Does the lease require more than 60 days notice to vacate?",
    redFlagIfYes: true,
    explanation: "Standard is 30–60 days. Requiring 90+ days notice before move-out gives you very little flexibility.",
    severity: "warning",
    tip: "Try to negotiate this down to 30 days, or at most 60.",
  },
];

type AnswerMap = Record<string, "yes" | "no" | null>;

export default function LeaseCheckerPage() {
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [showResults, setShowResults] = useState(false);

  const answer = (id: string, val: "yes" | "no") => {
    setAnswers((prev) => ({ ...prev, [id]: val }));
  };

  const answered = Object.keys(answers).length;
  const totalQ = FLAGS.length;

  const redFlags = FLAGS.filter(
    (f) => answers[f.id] === "yes" && f.redFlagIfYes
  );
  const dealbreakers = redFlags.filter((f) => f.severity === "dealbreaker");
  const warnings = redFlags.filter((f) => f.severity === "warning");
  const notes = redFlags.filter((f) => f.severity === "note");

  const getVerdict = () => {
    if (dealbreakers.length >= 2) return { text: "Do not sign as-is", color: "text-red-600", bg: "bg-red-50 border-red-200", icon: "🚨" };
    if (dealbreakers.length === 1) return { text: "Negotiate before signing", color: "text-orange-600", bg: "bg-orange-50 border-orange-200", icon: "⚠️" };
    if (warnings.length >= 3) return { text: "Several concerns — review carefully", color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200", icon: "⚠️" };
    if (warnings.length >= 1) return { text: "A few things to address", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: "📋" };
    return { text: "Looks solid", color: "text-green-700", bg: "bg-green-50 border-green-200", icon: "✅" };
  };

  const severityColor = {
    dealbreaker: "border-l-red-500 bg-red-50",
    warning: "border-l-orange-400 bg-orange-50",
    note: "border-l-blue-400 bg-blue-50",
  };

  const severityLabel = {
    dealbreaker: { text: "Deal-breaker", color: "bg-red-100 text-red-700" },
    warning: { text: "Warning", color: "bg-orange-100 text-orange-700" },
    note: { text: "Note", color: "bg-blue-100 text-blue-700" },
  };

  if (showResults) {
    const verdict = getVerdict();
    return (
      <main className="max-w-2xl mx-auto px-4 pb-16">
        <div className="pt-8 pb-2">
          <button onClick={() => setShowResults(false)} className="text-sm text-orange-600 font-medium">← Back to questions</button>
        </div>

        <div className="pt-4 pb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Lease Analysis</h1>

          <div className={`rounded-2xl border p-5 mb-6 ${verdict.bg}`}>
            <div className="text-3xl mb-2">{verdict.icon}</div>
            <div className={`text-xl font-bold mb-1 ${verdict.color}`}>{verdict.text}</div>
            <p className="text-sm text-gray-600">
              {dealbreakers.length} deal-breaker{dealbreakers.length !== 1 ? "s" : ""} · {warnings.length} warning{warnings.length !== 1 ? "s" : ""} · {notes.length} note{notes.length !== 1 ? "s" : ""}
            </p>
          </div>

          {redFlags.length === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6 text-center">
              <p className="text-green-700 font-semibold text-sm">No red flags found.</p>
              <p className="text-green-600 text-xs mt-1">This lease looks reasonable. Still read every page before signing.</p>
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              {redFlags.map((f) => (
                <div key={f.id} className={`border-l-4 rounded-r-2xl p-4 ${severityColor[f.severity]}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${severityLabel[f.severity].color}`}>
                      {severityLabel[f.severity].text}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">{f.question}</p>
                  <p className="text-xs text-gray-600 mb-2 leading-relaxed">{f.explanation}</p>
                  <p className="text-xs text-orange-700 font-medium leading-relaxed">💡 {f.tip}</p>
                </div>
              ))}
            </div>
          )}

          <div className="bg-gray-50 rounded-2xl p-4 mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Remember</h3>
            <ul className="space-y-1 text-xs text-gray-600">
              <li>• Everything is negotiable before you sign</li>
              <li>• Get all changes in writing as a lease addendum</li>
              <li>• Ohio law overrides unenforceable lease clauses — but know what&apos;s legal</li>
              <li>• When in doubt, contact Ohio Legal Help: ohiolegalhelp.org</li>
            </ul>
          </div>

          <Link
            href="/tools/move-in-checklist"
            className="block w-full text-center bg-orange-500 text-white font-bold py-4 rounded-2xl hover:bg-orange-600 transition-colors"
          >
            Ready to move in? Use the Move-In Checklist →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 pb-16">
      <div className="pt-8 pb-2">
        <Link href="/category/guides" className="text-sm text-orange-600 font-medium">← Guides</Link>
      </div>

      <div className="pt-4 pb-2">
        <div className="text-4xl mb-3">📄</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Lease Red-Flag Checker</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-4">
          Answer these questions about your lease. We&apos;ll flag anything suspicious and tell you what to do about it.
        </p>
      </div>

      <div className="mb-6 bg-orange-50 border border-orange-100 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">💡</span>
          <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">How was I supposed to know that?</span>
        </div>
        <p className="text-sm text-gray-800 font-medium leading-relaxed">
          Most first-time renters sign whatever is put in front of them. Leases are written by landlords, for landlords. Knowing what to look for — and what&apos;s negotiable — can save you thousands.
        </p>
      </div>

      {/* Progress */}
      <div className="mb-5 bg-white rounded-xl border border-gray-100 p-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{answered} of {totalQ} answered</span>
          <span>{Math.round((answered / totalQ) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div className="bg-orange-500 h-1.5 rounded-full transition-all" style={{ width: `${(answered / totalQ) * 100}%` }} />
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {FLAGS.map((flag, i) => (
          <div key={flag.id} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-start gap-2 mb-3">
              <span className="text-xs font-bold text-gray-300 mt-0.5 w-5 flex-shrink-0">{i + 1}.</span>
              <p className="text-sm font-semibold text-gray-900 leading-relaxed">{flag.question}</p>
            </div>
            <div className="flex gap-2 pl-6">
              <button
                onClick={() => answer(flag.id, "yes")}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                  answers[flag.id] === "yes"
                    ? "bg-red-100 text-red-700 border-2 border-red-300"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => answer(flag.id, "no")}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                  answers[flag.id] === "no"
                    ? "bg-green-100 text-green-700 border-2 border-green-300"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                No
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowResults(true)}
        disabled={answered < 3}
        className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${
          answered >= 3
            ? "bg-orange-500 text-white hover:bg-orange-600"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
      >
        See results {answered >= 3 ? `(${redFlags.length} flag${redFlags.length !== 1 ? "s" : ""} so far)` : `— answer ${3 - answered} more`}
      </button>
    </main>
  );
}
