"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export default function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled — no-op
      }
      return;
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleShare}
      aria-label="Bu işletmeyi paylaş"
      className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-navy hover:border-bordo hover:text-bordo"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" /> Kopyalandı
        </>
      ) : (
        <>
          <Share2 className="h-3.5 w-3.5" /> Paylaş
        </>
      )}
    </button>
  );
}