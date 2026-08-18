"use client";

import { useEffect, useState } from "react";
import { X, Download, Share, MapPin } from "lucide-react";

const DISMISS_KEY = "a2hs-dismissed-at";
const DISMISS_DAYS = 14;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface NavigatorStandalone extends Navigator {
  standalone?: boolean;
}

export default function AddToHomeScreenBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [visible, setVisible] = useState(false);
  const [iconBroken, setIconBroken] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as NavigatorStandalone).standalone === true;
    if (isStandalone) return;

    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const daysSince = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSince < DISMISS_DAYS) return;
    }

    const ua = window.navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(ua) && !("MSStream" in window);
    setIsIOS(iOS);

    if (iOS) {
      setVisible(true);
      return;
    }

    function handler(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    }
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") setVisible(false);
    setDeferredPrompt(null);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-line bg-white shadow-[0_-4px_20px_rgba(20,33,61,0.15)] sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center gap-3 p-3">
        {!iconBroken ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/icon-192.png"
            alt=""
            width={44}
            height={44}
            onError={() => setIconBroken(true)}
            className="h-11 w-11 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-bordo text-white">
            <MapPin className="h-5 w-5" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-navy">RehberGölbaşı&apos;nı ekle</p>
          {isIOS ? (
            <p className="flex items-center gap-1 text-xs text-ink/55">
              <Share className="h-3 w-3 shrink-0" /> Paylaş&apos;a dokun, sonra &quot;Ana Ekrana Ekle&quot;
            </p>
          ) : (
            <p className="text-xs text-ink/55">Ana ekranına ekle, tek dokunuşla aç</p>
          )}
        </div>
        {!isIOS && (
          <button
            onClick={handleInstall}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-bordo px-4 py-2 text-xs font-bold text-white"
          >
            <Download className="h-3.5 w-3.5" /> Ekle
          </button>
        )}
        <button
          onClick={dismiss}
          aria-label="Kapat"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink/50 hover:bg-offwhite active:bg-offwhite"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}