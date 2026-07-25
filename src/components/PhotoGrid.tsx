"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface Photo {
  id: string;
  url: string;
}

export default function PhotoGrid({
  photos,
  businessName,
}: {
  photos: Photo[];
  businessName: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (photos.length === 0) return null;

  function showPrev() {
    setOpenIndex((i) => (i === null ? null : (i - 1 + photos.length) % photos.length));
  }

  function showNext() {
    setOpenIndex((i) => (i === null ? null : (i + 1) % photos.length));
  }

  return (
    <>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            onClick={() => setOpenIndex(i)}
            className="relative aspect-square overflow-hidden rounded-xl bg-offwhite"
          >
            <Image
              src={photo.url}
              alt={`${businessName} fotoğraf ${i + 1}`}
              fill
              sizes="(max-width: 640px) 33vw, 25vw"
              className="object-cover transition duration-300 hover:scale-105"
            />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-dark/80 px-4"
          onClick={() => setOpenIndex(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={() => setOpenIndex(null)}
            className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          {photos.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); showPrev(); }}
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
              src={photos[openIndex].url}
              alt={`${businessName} fotoğraf ${openIndex + 1}`}
              fill
              sizes="(max-width: 640px) 100vw, 768px"
              className="object-contain"
            />
          </div>

          {photos.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); showNext(); }}
              className="absolute right-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:right-6"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          <div className="absolute bottom-5 text-xs font-semibold text-white/60">
            {openIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  );
}