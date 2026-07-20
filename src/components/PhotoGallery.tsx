"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Camera, Eye } from "lucide-react";

interface Photo {
  id: string;
  url: string;
}

export default function PhotoGallery({
  coverUrl,
  photos,
  businessName,
  titleSlot,
  viewCount,
}: {
  coverUrl: string | null;
  photos: Photo[];
  businessName: string;
  titleSlot?: ReactNode;
  viewCount?: number;
}) {
  const images = [
    ...(coverUrl ? [coverUrl] : []),
    ...photos.map((p) => p.url),
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [coverLoaded, setCoverLoaded] = useState(false);

  function showPrev() {
    setOpenIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  }

  function showNext() {
    setOpenIndex((i) => (i === null ? null : (i + 1) % images.length));
  }

  return (
    <div className="relative h-72 w-full overflow-hidden rounded-3xl bg-navy sm:h-96">
      <button
        onClick={() => images.length > 0 && setOpenIndex(0)}
        aria-label={`${businessName} kapak fotoğrafını büyük gör`}
        className="absolute inset-0"
      >
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={`${businessName} kapak fotoğrafı`}
            fill
            priority
            sizes="(max-width: 640px) 100vw, 896px"
            className={`object-cover transition-opacity duration-500 ${
              coverLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setCoverLoaded(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-5xl font-bold text-white/10">
            {businessName.charAt(0)}
          </div>
        )}
        {coverUrl && !coverLoaded && (
          <div className="absolute inset-0 animate-pulse bg-navy" />
        )}
      </button>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3"
        style={{
          background: "linear-gradient(to top, rgba(11,21,38,0.92), rgba(11,21,38,0.35) 55%, transparent)",
        }}
      />

      {typeof viewCount === "number" && (
        <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
          <Eye className="h-3.5 w-3.5" /> {viewCount}
        </div>
      )}

      {photos.length > 0 && (
        <button
          onClick={() => setOpenIndex(0)}
          className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm hover:bg-white/25"
        >
          <Camera className="h-3.5 w-3.5" /> {images.length} fotoğraf
        </button>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 px-5 pb-9 sm:px-7 sm:pb-11">
        {titleSlot}
      </div>

      {openIndex !== null && images[openIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-dark/80 px-4"
          onClick={() => setOpenIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${businessName} fotoğraf galerisi`}
        >
          <button
            onClick={() => setOpenIndex(null)}
            aria-label="Galeriyi kapat"
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
              aria-label="Önceki fotoğraf"
              className="absolute left-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:left-6"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          <div
            className="relative h-[70vh] w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[openIndex]}
              alt={`${businessName} fotoğraf ${openIndex + 1}`}
              fill
              sizes="(max-width: 640px) 100vw, 768px"
              className="object-contain"
            />
          </div>

          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                showNext();
              }}
              aria-label="Sonraki fotoğraf"
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