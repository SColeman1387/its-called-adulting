"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

type Platform = "ios" | "android" | "desktop" | "unknown";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

const steps: Record<Platform, { title: string; steps: { icon: string; text: string }[] }> = {
  ios: {
    title: "Add to your iPhone Home Screen",
    steps: [
      { icon: "🌐", text: 'Open itscalledadulting.com in Safari (must be Safari, not Chrome)' },
      { icon: "⬆️", text: 'Tap the Share button at the bottom of the screen (the box with an arrow pointing up)' },
      { icon: "📲", text: 'Scroll down and tap "Add to Home Screen"' },
      { icon: "✏️", text: 'Name it "Adulting" and tap Add in the top right' },
      { icon: "✅", text: "Done! Find it on your home screen and open it like any other app" },
    ],
  },
  android: {
    title: "Add to your Android Home Screen",
    steps: [
      { icon: "🌐", text: "Open itscalledadulting.com in Chrome" },
      { icon: "⋮", text: 'Tap the three-dot menu in the top right corner' },
      { icon: "📲", text: 'Tap "Add to Home screen" or "Install app"' },
      { icon: "✏️", text: 'Tap "Add" to confirm' },
      { icon: "✅", text: "Done! It'll appear on your home screen just like a regular app" },
    ],
  },
  desktop: {
    title: "Install on your computer",
    steps: [
      { icon: "🌐", text: "Open itscalledadulting.com in Chrome or Edge" },
      { icon: "📥", text: "Look for the install icon (⊕) in the address bar on the right side" },
      { icon: "📲", text: 'Click it and select "Install"' },
      { icon: "✅", text: "It'll open as a standalone app window — no browser needed" },
    ],
  },
  unknown: {
    title: "Add to your Home Screen",
    steps: [
      { icon: "📱", text: "On iPhone: open in Safari → Share button → Add to Home Screen" },
      { icon: "🤖", text: "On Android: open in Chrome → three-dot menu → Add to Home Screen" },
      { icon: "💻", text: "On computer: open in Chrome → install icon in address bar" },
    ],
  },
};

export default function InstallPage() {
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
    }
  }, []);

  const content = steps[platform];

  if (installed) {
    return (
      <div className="min-h-screen bg-[#f9f9f7] flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">You're already using the app!</h1>
        <p className="text-gray-500 mb-8">It's Called Adulting is installed and running on your device.</p>
        <Link href="/home" className="bg-orange-500 text-white font-semibold px-6 py-3 rounded-xl">
          Go to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f7] flex flex-col px-6 py-10 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden shadow-lg">
          <img src="/icon-512.png" alt="It's Called Adulting" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">It's Called Adulting</h1>
        <p className="text-gray-500 mt-1 text-sm">Add it to your home screen for the full app experience</p>
      </div>

      {/* Platform tabs */}
      <div className="flex gap-2 mb-8 bg-gray-200 rounded-xl p-1">
        {(["ios", "android", "desktop"] as Platform[]).map((p) => (
          <button
            key={p}
            onClick={() => setPlatform(p)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              platform === p ? "bg-white shadow text-gray-900" : "text-gray-500"
            }`}
          >
            {p === "ios" ? "iPhone" : p === "android" ? "Android" : "Computer"}
          </button>
        ))}
      </div>

      {/* Steps */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">{content.title}</h2>
        </div>
        <ul className="divide-y divide-gray-100">
          {content.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-4 px-5 py-4">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center text-lg">
                {step.icon}
              </div>
              <div className="flex-1 pt-1">
                <span className="text-xs font-bold text-orange-500 uppercase tracking-wide mr-2">Step {i + 1}</span>
                <p className="text-gray-700 text-sm mt-0.5">{step.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Why install */}
      <div className="bg-orange-50 border border-orange-100 rounded-2xl px-5 py-4 mb-8">
        <h3 className="font-bold text-gray-900 mb-3">Why install it?</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-center gap-2"><span>⚡</span> Opens instantly — no browser needed</li>
          <li className="flex items-center gap-2"><span>🔔</span> Get reminders for trash day, oil changes & more</li>
          <li className="flex items-center gap-2"><span>📴</span> Works offline for saved tasks</li>
          <li className="flex items-center gap-2"><span>🎁</span> Earn Adulting Bucks & redeem gift cards</li>
        </ul>
      </div>

      <Link href="/home" className="text-center text-sm text-gray-400 underline">
        Skip — take me to the app
      </Link>
    </div>
  );
}
