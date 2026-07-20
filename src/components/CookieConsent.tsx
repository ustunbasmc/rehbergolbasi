"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { Cookie } from "lucide-react";

const GA_ID = "G-L482G7RJWM";
const STORAGE_KEY = "rehbergolbasi_cookie_consent";

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
        <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-line bg-white p-4 shadow-[0_-4px_20px_rgba(20,33,61,0.12)] sm:p-5">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bordo/10 text-bordo">
                <Cookie className="h-4 w-4" />
              </span>
              <p className="text-sm leading-relaxed text-ink/70">
                Sitemizi geliştirmek için anonim ziyaretçi istatistikleri (Google Analytics)
                topluyoruz. Detaylar için{" "}
                <Link href="/cerez-politikasi" className="font-semibold text-bordo hover:underline">
                  Çerez Politikamıza
                </Link>{" "}
                bakabilirsin.
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={reject}
                className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink/60 hover:bg-offwhite"
              >
                Reddet
              </button>
              <button
                onClick={accept}
                className="rounded-full bg-bordo px-5 py-2 text-sm font-bold text-white hover:bg-bordo-dark"
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