"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { buildBusinessChannelPost } from "@/lib/channelPosts";

const BASE_URL = "https://rehbergolbasi.com";

interface Props {
  name: string;
  slug: string;
  neighborhood: string | null;
  shortDescription: string | null;
  description: string | null;
  categoryName: string | null;
}

/** Yeni işletmeyi WhatsApp Kanalı'nda duyurmak için tek tıkla metin kopyalar (bkz. GundemList "Kanala paylaş"). */
export default function BusinessChannelShare({
  name,
  slug,
  neighborhood,
  shortDescription,
  description,
  categoryName,
}: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = buildBusinessChannelPost(
      { name, slug, neighborhood, short_description: shortDescription, description },
      categoryName,
      BASE_URL
    );
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Panoya erişim izni yoksa sessizce yut.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="WhatsApp Kanalı için paylaşım metnini kopyala"
      className="flex shrink-0 items-center gap-1 rounded-lg bg-green-50 px-2.5 py-1.5 text-xs font-bold text-green-700 hover:bg-green-100"
    >
      {copied ? (
        "✓ Kopyalandı"
      ) : (
        <>
          <MessageCircle className="h-3.5 w-3.5" /> Kanala paylaş
        </>
      )}
    </button>
  );
}
