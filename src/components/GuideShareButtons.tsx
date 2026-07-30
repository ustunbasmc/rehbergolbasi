"use client";

import { useState } from "react";
import { Check, Link2, MessageCircle } from "lucide-react";

export default function GuideShareButtons({
  title,
  slug,
}: {
  title: string;
  slug: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `https://rehbergolbasi.com/rehberler/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleWhatsApp() {
    const url = `https://rehbergolbasi.com/rehberler/${slug}`;
    const text = encodeURIComponent(`${title} — RehberGölbaşı\n${url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleWhatsApp}
        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#25D366] py-2.5 text-xs font-bold text-white transition hover:opacity-90"
      >
        <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
      </button>
      <button
        onClick={handleCopy}
        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line py-2.5 text-xs font-bold text-navy transition hover:bg-offwhite"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5" /> Kopyalandı
          </>
        ) : (
          <>
            <Link2 className="h-3.5 w-3.5" /> Linki Kopyala
          </>
        )}
      </button>
    </div>
  );
}