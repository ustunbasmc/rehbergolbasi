"use client";

import { useMemo, useState } from "react";
import { X, Smartphone, Monitor, Megaphone, MapPin } from "lucide-react";
import { estimateReadingTimeMinutes } from "@/lib/gundem";
import { renderGundemMarkdown } from "@/lib/gundem-content";

export interface GundemPreviewData {
  title: string;
  summary: string;
  contentMarkdown: string;
  coverUrl: string | null;
  coverAlt: string;
  categoryName: string | null;
  author: string;
  publishedAtLocal: string;
  neighborhoods: string[];
  isSponsored: boolean;
  sponsorName: string;
  isBreaking: boolean;
}

/**
 * Sunucuya kaydetmeden, editördeki mevcut (kaydedilmemiş dahil) form
 * durumunu doğrudan render eder — ayrı bir "preview URL" veya admin
 * yetkisi doğrulaması gerektirmez, çünkü hiçbir zaman ağa/DB'ye gitmez.
 * Taslak/zamanlanmış bir habere public bir önizleme linkiyle "tahmin
 * edilebilir" erişim riski oluşturmamak için bilinçli olarak bu yöntem
 * seçildi (bkz. teslim raporu, madde 9).
 */
export default function GundemPreviewModal({ data, onClose }: { data: GundemPreviewData; onClose: () => void }) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const html = useMemo(() => renderGundemMarkdown(data.contentMarkdown), [data.contentMarkdown]);
  const readingTime = useMemo(() => estimateReadingTimeMinutes(data.contentMarkdown), [data.contentMarkdown]);
  const dateLabel = data.publishedAtLocal
    ? new Date(data.publishedAtLocal).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })
    : "Yayın tarihi seçilmedi";

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-navy-dark/60 p-4">
      <div className="mb-3 flex items-center justify-between rounded-xl bg-white px-4 py-2.5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDevice("desktop")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ${device === "desktop" ? "bg-navy text-white" : "text-ink/50 hover:bg-offwhite"}`}
          >
            <Monitor className="h-3.5 w-3.5" /> Masaüstü
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ${device === "mobile" ? "bg-navy text-white" : "text-ink/50 hover:bg-offwhite"}`}
          >
            <Smartphone className="h-3.5 w-3.5" /> Mobil
          </button>
        </div>
        <button onClick={onClose} className="rounded-lg p-1.5 text-ink/40 hover:bg-offwhite hover:text-ink">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-1 justify-center overflow-y-auto rounded-xl bg-white">
        <article className={`w-full p-6 ${device === "mobile" ? "max-w-[390px]" : "max-w-3xl"}`}>
          <div className="mb-3 flex flex-wrap items-center gap-1.5 text-xs">
            {data.categoryName && (
              <span className="rounded-full bg-navy/10 px-2 py-0.5 font-bold uppercase tracking-wide text-navy">{data.categoryName}</span>
            )}
            {data.isSponsored && (
              <span className="flex items-center gap-1 rounded-full bg-ink/10 px-2 py-0.5 font-bold text-ink/60">
                <Megaphone className="h-3 w-3" /> Sponsorlu İçerik{data.sponsorName ? ` · ${data.sponsorName}` : ""}
              </span>
            )}
            {data.isBreaking && <span className="rounded-full bg-bordo px-2 py-0.5 font-bold text-white">SON DAKİKA</span>}
          </div>

          <h1 className="font-display text-2xl font-bold leading-tight text-navy sm:text-3xl">{data.title || "(Başlık girilmedi)"}</h1>
          <p className="mt-2 text-base leading-relaxed text-ink/60">{data.summary || "(Kısa özet girilmedi)"}</p>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-y border-line py-2.5 text-xs text-ink/50">
            <span>{data.author}</span>
            <span>·</span>
            <time>{dateLabel}</time>
            <span>·</span>
            <span>{readingTime} dk okuma</span>
            {data.neighborhoods.length > 0 && (
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {data.neighborhoods.join(", ")}</span>
            )}
          </div>

          {data.coverUrl && (
            <div className="mt-4 overflow-hidden rounded-xl bg-offwhite">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.coverUrl} alt={data.coverAlt} className="w-full object-cover" />
            </div>
          )}

          <div className="gundem-article mt-5" dangerouslySetInnerHTML={{ __html: html }} />
        </article>
      </div>
    </div>
  );
}
