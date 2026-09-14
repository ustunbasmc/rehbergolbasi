"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Link2, Share2, Check } from "lucide-react";
import { trackGundemEvent } from "@/lib/analytics";

// "X" ve Facebook logoları lucide-react'in bu sürümünde yok (marka ikonları
// kaldırılmış); küçük, bağımsız SVG'ler kullanılır — mevcut işletme detay
// sayfasındaki sosyal bağlantılarla aynı yaklaşım (bkz. isletme/[slug]).
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.9h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94z" />
    </svg>
  );
}

export default function GundemShareButtons({ url, title, postSlug }: { url: string; title: string; postSlug: string }) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && "share" in navigator) setCanNativeShare(true);
  }, []);

  function track(channel: string) {
    trackGundemEvent("news_share_click", { shareChannel: channel, postSlug });
  }

  async function handleCopy() {
    track("copy_link");
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Panoya erişim izni yoksa sessizce yut.
    }
  }

  async function handleNativeShare() {
    track("native_share");
    try {
      await navigator.share({ title, url });
    } catch {
      // Kullanıcı iptal etti veya desteklenmiyor — sessizce yut.
    }
  }

  const btnBase = "flex h-10 w-10 items-center justify-center rounded-full border border-line text-navy transition hover:border-bordo/40 hover:text-bordo";

  return (
    <div className="flex items-center gap-2">
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("whatsapp")}
        aria-label="WhatsApp'ta paylaş"
        className={btnBase}
      >
        <MessageCircle className="h-4 w-4" />
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("facebook")}
        aria-label="Facebook'ta paylaş"
        className={btnBase}
      >
        <FacebookIcon className="h-4 w-4" />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("x")}
        aria-label="X'te paylaş"
        className={btnBase}
      >
        <XIcon className="h-3.5 w-3.5" />
      </a>
      <button onClick={handleCopy} aria-label="Bağlantıyı kopyala" className={btnBase}>
        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Link2 className="h-4 w-4" />}
      </button>
      {canNativeShare && (
        <button onClick={handleNativeShare} aria-label="Paylaş" className={btnBase}>
          <Share2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
