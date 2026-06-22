"use client";
import { useState } from "react";
import Link from "next/link";

interface CheckItem {
  id: string;
  label: string;
  note?: string;
}

interface Section {
  title: string;
  icon: string;
  items: CheckItem[];
}

const SECTIONS: Section[] = [
  {
    title: "Before You Accept the Keys",
    icon: "🔑",
    items: [
      { id: "walkthrough", label: "Do a walkthrough before signing anything", note: "Don't sign the lease until you've seen the actual unit." },
      { id: "lease-read", label: "Read the full lease — every page", note: "Look for: early termination fees, pet policies, guest policies, rent increase clauses." },
      { id: "deposit-amount", label: "Confirm the deposit amount in writing" },
      { id: "move-in-date", label: "Confirm your move-in date and key pickup time" },
      { id: "utilities", label: "Know which utilities are your responsibility vs. landlord's" },
    ],
  },
  {
    title: "Day One: Document Everything",
    icon: "📸",
    items: [
      { id: "photo-walls", label: "Photograph every wall — all 4 sides of each room", note: "Marks, scuffs, holes, stains. All of it." },
      { id: "photo-floors", label: "Photograph all floors and carpet", note: "Any stains, scratches, or worn areas." },
      { id: "photo-ceilings", label: "Photograph ceilings (water stains, cracks)" },
      { id: "photo-windows", label: "Photograph every window — cracks, broken locks, broken blinds" },
      { id: "photo-appliances", label: "Photograph all appliances (inside and out)" },
      { id: "photo-bathroom", label: "Photograph bathroom — tub, toilet, sink, tiles, grout" },
      { id: "photo-kitchen", label: "Photograph kitchen — counters, cabinets inside and out, sink" },
      { id: "photo-closets", label: "Photograph all closets and storage areas" },
      { id: "email-photos", label: "Email photos to yourself AND your landlord same day", note: "Creates a date-stamped record. Keep the sent email forever." },
    ],
  },
  {
    title: "Test Everything",
    icon: "🔧",
    items: [
      { id: "test-outlets", label: "Test every electrical outlet (use a phone charger)" },
      { id: "test-switches", label: "Test every light switch" },
      { id: "test-faucets", label: "Run every faucet — hot and cold", note: "Check under sinks for leaks while water runs." },
      { id: "test-shower", label: "Run the shower — check water pressure and hot water" },
      { id: "test-toilet", label: "Flush every toilet" },
      { id: "test-appliances", label: "Test all appliances — stove, oven, fridge, dishwasher, microwave" },
      { id: "test-hvac", label: "Test heat and AC" },
      { id: "test-doors", label: "Open and close every door — they should latch and lock properly" },
      { id: "test-windows", label: "Open and close every window — they should lock" },
      { id: "test-garage", label: "Test garage door / parking if applicable" },
    ],
  },
  {
    title: "Safety Check",
    icon: "🔒",
    items: [
      { id: "smoke-detector", label: "Locate and test smoke detectors", note: "Every bedroom and hallway. Press the test button." },
      { id: "co-detector", label: "Locate and test carbon monoxide detectors" },
      { id: "fire-extinguisher", label: "Locate fire extinguisher if one is provided" },
      { id: "deadbolt", label: "Confirm deadbolt works on front door" },
      { id: "lock-request", label: "Ask about re-keying — you don't know who had keys before you", note: "Most landlords aren't required to re-key, but it's always worth asking." },
      { id: "emergency-exits", label: "Identify your emergency exits" },
      { id: "water-shutoff", label: "Find the main water shutoff valve (usually under sink or in utility closet)" },
      { id: "breaker-box", label: "Locate the breaker box and take a photo of it" },
    ],
  },
  {
    title: "Document Issues in Writing",
    icon: "📝",
    items: [
      { id: "move-in-form", label: "Fill out the move-in inspection form if provided", note: "Be thorough. Every scratch. Vague forms protect landlords, not you." },
      { id: "note-issues", label: "Write down every issue you found and send to landlord via email" },
      { id: "get-confirmation", label: "Get written confirmation your landlord received your move-in documentation" },
      { id: "keep-copy", label: "Keep a copy of the signed lease in a safe place (digital is fine)" },
    ],
  },
  {
    title: "Renter Basics (Every State)",
    icon: "⚖️",
    items: [
      { id: "deposit-law", label: "Know the deposit deadline: most states require return within 14–45 days of move-out" },
      { id: "notice-to-enter", label: "Landlord must give advance notice before entering — usually 24–48 hours" },
      { id: "habitability", label: "Landlord must provide working heat, plumbing, and a secure unit in every state" },
      { id: "save-rent-receipts", label: "Save proof of every rent payment (bank records, receipts, email confirmations)" },
    ],
  },
];

export default function MoveInChecklistPage() {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const totalItems = SECTIONS.reduce((sum, s) => sum + s.items.length, 0);
  const pct = Math.round((checked.size / totalItems) * 100);

  return (
    <main className="max-w-2xl mx-auto px-4 pb-16">
      <div className="pt-8 pb-2">
        <Link href="/category/guides" className="text-sm text-orange-600 font-medium">← Guides</Link>
      </div>

      <div className="pt-4 pb-2">
        <div className="text-4xl mb-3">🏠</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Apartment Move-In Checklist</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-4">
          Complete this before you unpack a single box. What you document on day one determines whether you get your deposit back when you leave.
        </p>
      </div>

      <div className="mb-6 bg-orange-50 border border-orange-100 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">💡</span>
          <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">How was I supposed to know that?</span>
        </div>
        <p className="text-sm text-gray-800 font-medium leading-relaxed">
          Landlords routinely charge move-out tenants for damage that existed before they moved in. A 30-minute photo session and this checklist creates the paper trail that gets your deposit back.
        </p>
      </div>

      {/* Progress */}
      <div className="mb-6 bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-semibold text-gray-900">{checked.size} of {totalItems} items checked</span>
          <span className="text-orange-500 font-bold">{pct}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        {pct === 100 && (
          <p className="text-green-600 text-xs font-semibold mt-2">✓ All done — you&apos;re protected!</p>
        )}
      </div>

      <div className="space-y-6">
        {SECTIONS.map((section) => {
          const sectionChecked = section.items.filter((i) => checked.has(i.id)).length;
          return (
            <div key={section.title}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{section.icon}</span>
                <h2 className="font-bold text-gray-900 text-sm">{section.title}</h2>
                <span className="text-xs text-gray-400 ml-auto">{sectionChecked}/{section.items.length}</span>
              </div>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggle(item.id)}
                    className={`w-full flex items-start gap-3 p-3.5 rounded-xl text-left transition-all border ${
                      checked.has(item.id)
                        ? "bg-green-50 border-green-200"
                        : "bg-white border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                      checked.has(item.id)
                        ? "border-green-500 bg-green-500"
                        : "border-gray-300"
                    }`}>
                      {checked.has(item.id) && <span className="text-white text-xs font-bold">✓</span>}
                    </div>
                    <div className="flex-1">
                      <span className={`text-sm ${checked.has(item.id) ? "text-gray-400 line-through" : "text-gray-700 font-medium"}`}>
                        {item.label}
                      </span>
                      {item.note && !checked.has(item.id) && (
                        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{item.note}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-gray-900 rounded-2xl p-5 text-center">
        <p className="text-white text-sm font-semibold mb-1">Need to know your renter rights?</p>
        <p className="text-gray-400 text-xs mb-3">State law protects you — but you have to know it to use it.</p>
        <Link
          href="/task/renter-rights"
          className="inline-block bg-white text-gray-900 text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors"
        >
          Renter Rights Guide →
        </Link>
      </div>
    </main>
  );
}
