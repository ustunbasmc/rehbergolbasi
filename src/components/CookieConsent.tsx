"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { Cookie } from "lucide-react";
import { COOKIE_CONSENT_STORAGE_KEY } from "@/lib/constants";

const GA_ID = "G-S9J3BYS755";
const STORAGE_KEY = COOKIE_CONSENT_STORAGE_KEY;

export default function CookieConsent() {
  const [consent, setConsent] = useState<"accepted" | "rejected" | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as "accepted" | "rejected" | null;
    setConsent(stored);
    if (!stored) setShowBanner(true);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setConsent("accepted");
    setShowBanner(false);
  }

  function reject() {
    localStorage.setItem(STORAGE_KEY, "rejected");
    setConsent("rejected");
    setShowBanner(false);
  }

  return (
    <>
      {consent === "accepted" && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}

      {showBanner && (
        <div
          className="fixed inset-x-0 bottom-0 z-[60] border-t border-line bg-white px-4 py-3 shadow-[0_-4px_20px_rgba(20,33,61,0.12)] sm:p-5"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex items-start gap-2.5 sm:gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bordo/10 text-bordo sm:h-8 sm:w-8">
                <Cookie className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </span>
              <p className="text-xs leading-snug text-ink/70 sm:text-sm sm:leading-relaxed">
                Anonim ziyaretçi istatistikleri (Google Analytics) topluyoruz.{" "}
                <Link href="/cerez-politikasi" className="font-semibold text-bordo hover:underline">
                  Çerez Politikası
                </Link>
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={reject}
                className="flex-1 rounded-full border border-line px-3.5 py-2 text-xs font-semibold text-ink/60 hover:bg-offwhite sm:flex-none sm:px-4 sm:text-sm"
              >
                Reddet
              </button>
              <button
                onClick={accept}
                className="flex-1 rounded-full bg-bordo px-4 py-2 text-xs font-bold text-white hover:bg-bordo-dark sm:flex-none sm:px-5 sm:text-sm"
              >
                Kabul Et
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}