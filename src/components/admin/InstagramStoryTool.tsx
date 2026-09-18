"use client";

import { Camera, Download } from "lucide-react";

interface Props {
  slug: string;
  businessName: string;
}

/**
 * Otomatik Instagram paylaşımı Meta'nın DM/mesajlaşma API'sinde mümkün değil
 * (ve hikaye yayınlama için de uygulama incelemesi/kurulum gerektiriyor) —
 * bunun yerine hazır bir hikaye görseli üretip admin'in indirip Instagram
 * hikayesine ELLE yüklemesini sağlıyoruz (bkz. WhatsAppNotifier'daki
 * "kopyala-yapıştır, gönder butonuna sen bas" mantığının görsel karşılığı).
 */
export default function InstagramStoryTool({ slug, businessName }: Props) {
  const imgUrl = `/api/admin/instagram-story/${slug}`;

  return (
    <div className="card-shadow rounded-lg bg-offwhite p-3">
      <div className="mb-2 flex items-center gap-1.5">
        <Camera className="h-3.5 w-3.5 text-navy" />
        <p className="text-xs font-bold uppercase tracking-wide text-navy">Instagram Hikayesi</p>
      </div>
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgUrl}
          alt={`${businessName} hikaye görseli`}
          className="h-40 w-auto shrink-0 rounded-lg border border-line object-cover"
        />
        <div className="flex flex-col gap-2">
          <a
            href={imgUrl}
            download={`${slug}-hikaye.png`}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-navy px-3 py-2 text-xs font-bold text-white hover:bg-navy-dark"
          >
            <Download className="h-3.5 w-3.5" /> İndir
          </a>
          <p className="max-w-[160px] text-[11px] text-ink/40">
            İndirip Instagram hikayenize elle yükleyebilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}
