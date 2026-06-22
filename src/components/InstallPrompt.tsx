"use client";
import { useEffect, useState } from "react";

type Platform = "ios" | "android" | "other";

function getPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "other";
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches
    || ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true);
}

const DISMISSED_KEY = "ica_install_dismissed";

export default function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<Platform>("other");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISSED_KEY)) return;

    setPlatform(getPlatform());

    // Android: capture the browser's native install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS / desktop: show our custom banner after a short delay
    const timer = setTimeout(() => setShow(true), 2000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(timer);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setShow(false);
  };

  const install = async () => {
    if (deferredPrompt) {
      setInstalling(true);
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setShow(false);
      setInstalling(false);
      setDeferredPrompt(null);
    }
  };

  if (!show) return null;

  // Android with native prompt available
  if (platform === "android" && deferredPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 flex items-center gap-3">
        <img src="/icon-192.png" alt="" className="w-12 h-12 rounded-xl shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm">Add to Home Screen</p>
          <p className="text-xs text-gray-500 mt-0.5">Opens like an app — no browser needed</p>
        </div>
        <button
          onClick={install}
          disabled={installing}
          className="shrink-0 bg-orange-500 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-orange-600 disabled:opacity-60"
        >
          {installing ? "…" : "Install"}
        </button>
        <button onClick={dismiss} className="shrink-0 text-gray-300 hover:text-gray-500 text-xl leading-none">×</button>
      </div>
    );
  }

  // iOS: show step-by-step instructions
  if (platform === "ios") {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl rounded-t-3xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <img src="/icon-192.png" alt="" className="w-10 h-10 rounded-xl" />
            <div>
              <p className="font-bold text-gray-900 text-sm">Add to Home Screen</p>
              <p className="text-xs text-gray-500">Use it like a real app</p>
            </div>
          </div>
          <button onClick={dismiss} className="text-gray-300 hover:text-gray-500 text-2xl leading-none">×</button>
        </div>
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <span className="text-lg">⬆️</span> Tap the <strong>Share button</strong> at the bottom of Safari
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <span className="text-lg">📲</span> Scroll down and tap <strong>"Add to Home Screen"</strong>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <span className="text-lg">✅</span> Tap <strong>Add</strong> — done
          </div>
        </div>
        <button onClick={dismiss} className="w-full text-sm text-gray-400 py-2 hover:text-gray-600">
          Maybe later
        </button>
      </div>
    );
  }

  // Desktop / other: minimal banner
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 flex items-center gap-3">
      <img src="/icon-192.png" alt="" className="w-10 h-10 rounded-xl shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-sm">Install as an app</p>
        <p className="text-xs text-gray-500 mt-0.5">Click the ⊕ in your address bar</p>
      </div>
      <button onClick={dismiss} className="shrink-0 text-gray-300 hover:text-gray-500 text-xl leading-none">×</button>
    </div>
  );
}
