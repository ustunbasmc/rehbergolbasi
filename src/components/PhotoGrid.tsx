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
      <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            onClick={() => setOpenIndex(i)}
            className="shrink-0 p-[2px] rounded-full"
            style={{
              background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
            }}
          >
            <div className="relative h-20 w-20 overflow-hidden rounded-full ring-2 ring-white bg-white">
              <Image
                src={photo.url}
                alt={`${businessName} fotoğraf ${i + 1}`}
                fill
                sizes="80px"
                className="object-cover"
                quality={90}
              />
            </div>
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4"
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
            className="relative h-[80vh] w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[openIndex].url}
              alt={`${businessName} fotoğraf ${openIndex + 1}`}
              fill
              sizes="(max-width: 640px) 100vw, 672px"
              className="object-contain"
              quality={95}
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

          <div className="absolute bottom-5 flex gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setOpenIndex(i); }}
                className={`h-1.5 rounded-full transition-all ${
                  i === openIndex ? "w-6 bg-white" : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}