"use client";

import { useState } from "react";
import Image from "next/image";
import { FileText, ExternalLink, X, ChevronLeft, ChevronRight } from "lucide-react";
import type { MenuItem } from "@/lib/types";

export default function MenuSection({ items }: { items: MenuItem[] }) {
  const images = items.filter((i) => i.file_type === "image");
  const pdfs = items.filter((i) => i.file_type === "pdf");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (items.length === 0) return null;

  function showPrev() {
    setOpenIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  }

  function showNext() {
    setOpenIndex((i) => (i === null ? null : (i + 1) % images.length));
  }

  return (
    <div className="card-shadow rounded-2xl border border-line bg-white p-6">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-ink/40">
        Menü / Fiyat Listesi
      </h2>

      {images.length > 0 && (
        <div className="mb-3 flex gap-3 overflow-x-auto pb-1">
          {images.map((item, i) => (
            <button
              key={item.id}
              onClick={() => setOpenIndex(i)}
              aria-label={`Menü fotoğrafı ${i + 1}, büyük gör`}
              className="relative h-32 w-24 shrink-0 overflow-hidden rounded-lg border border-line bg-offwhite"
            >
              <Image src={item.url} alt={`Menü fotoğrafı ${i + 1}`} fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {pdfs.length > 0 && (
        <div className="flex flex-col gap-2">
          {pdfs.map((item, i) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-lg border border-line px-3 py-2.5 text-sm font-semibold text-navy transition-colors hover:border-navy"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy/5">
                <FileText className="h-3.5 w-3.5" />
              </span>
              {item.title || `Fiyat listesi ${i + 1} (PDF)`}
              <ExternalLink className="ml-auto h-3.5 w-3.5 text-ink/40" />
            </a>
          ))}
        </div>
      )}

      {openIndex !== null && images[openIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-dark/80 px-4"
          onClick={() => setOpenIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Menü fotoğrafı galerisi"
        >
          <button
            onClick={() => setOpenIndex(null)}
            aria-label="Kapat"
            className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                showPrev();
              }}
              aria-label="Önceki"
              className="absolute left-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:left-6"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          <div
            className="relative h-[80vh] w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[openIndex].url}
              alt={`Menü fotoğrafı ${openIndex + 1}`}
              fill
              sizes="(max-width: 640px) 100vw, 640px"
              className="object-contain"
            />
          </div>

          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                showNext();
              }}
              aria-label="Sonraki"
              className="absolute right-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:right-6"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}