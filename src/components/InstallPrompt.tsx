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
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true)
  );
}

const DISMISSED_KEY = "ica_install_dismissed_until";

function isDismissed(): boolean {
  const until = localStorage.getItem(DISMISSED_KEY);
  if (!until) return false;
  return Date.now() < parseInt(until, 10);
}

function dismiss30Days() {
  // Remind again in 30 days
  localStorage.setItem(DISMISSED_KEY, String(Date.now() + 30 * 24 * 60 * 60 * 1000));
}

// Exported so the home screen can render a persistent "Add to Home Screen" button
export function useInstallState() {
  const [platform, setPlatform] = useState<Platform>("other");
  const [standalone, setStandalone] = useState(false);
  useEffect(() => {
    setPlatform(getPlatform());
    setStandalone(isStandalone());
  }, []);
  return { platform, standalone };
}

export function IOSInstructions({ onClose }: { onClose?: () => void }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl rounded-t-3xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img src="/icon-192.png" alt="" className="w-10 h-10 rounded-xl" />
          <div>
            <p className="font-bold text-gray-900 text-sm">Add to Home Screen</p>
            <p className="text-xs text-gray-500">Opens like a real app — no browser chrome</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500 text-2xl leading-none">×</button>
        )}
      </div>
      <ol className="space-y-3 mb-5">
        <li className="flex items-start gap-3">
          <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 font-bold rounded-full flex items-center justify-center text-xs">1</span>
          <span className="text-sm text-gray-700">
            Tap the <strong>Share button</strong> <span className="inline-block bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-mono text-xs">⬆</span> at the bottom of Safari
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 font-bold rounded-full flex items-center justify-center text-xs">2</span>
          <span className="text-sm text-gray-700">
            Scroll down and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong>
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 font-bold rounded-full flex items-center justify-center text-xs">3</span>
          <span className="text-sm text-gray-700">
            Tap <strong>Add</strong> in the top right — done!
          </span>
        </li>
      </ol>
      {onClose && (
        <button onClick={onClose} className="w-full text-sm text-gray-400 py-2 hover:text-gray-600">
          Got it
        </button>
      )}
    </div>
  );
}

export default function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<Platform>("other");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (isDismissed()) return;

    const p = getPlatform();
    setPlatform(p);

    // Android: capture the browser's native install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS / desktop: show our custom banner after a short delay
    const timer = setTimeout(() => {
      if (p === "ios" || p === "other") setShow(true);
    }, 2000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(timer);
    };
  }, []);

  const dismiss = () => {
    dismiss30Days();
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
    return <IOSInstructions onClose={dismiss} />;
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
