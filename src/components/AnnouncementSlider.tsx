"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Megaphone } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
}

export default function AnnouncementSlider({ announcements }: { announcements: Announcement[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (announcements.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % announcements.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [announcements.length]);

  if (announcements.length === 0) return null;

  const current = announcements[index];

  const slide = (
    <div className="relative h-64 w-full overflow-hidden rounded-3xl bg-navy sm:h-80">
      {current.image_url ? (
        <Image
          src={current.image_url}
          alt={current.title}
          fill
          unoptimized
          sizes="(max-width: 1024px) 100vw, 760px"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-navy to-bordo-dark" />
      )}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(11,21,38,0.15) 0%, rgba(11,21,38,0.85) 100%)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
        <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-gold px-2.5 py-1 text-[11px] font-bold text-gold-dark">
          <Megaphone className="h-3 w-3" /> Duyuru
        </span>
        <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">{current.title}</h3>
        {current.description && (
          <p className="mt-2 max-w-lg text-sm text-white/75">{current.description}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative">
      {current.link_url ? <Link href={current.link_url}>{slide}</Link> : slide}

      {announcements.length > 1 && (
        <>
          <button
            onClick={() => setIndex((i) => (i - 1 + announcements.length) % announcements.length)}
            aria-label="Önceki duyuru"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white backdrop-blur-sm hover:bg-white/25"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setIndex((i) => (i + 1) % announcements.length)}
            aria-label="Sonraki duyuru"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white backdrop-blur-sm hover:bg-white/25"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {announcements.map((a, i) => (
              <button
                key={a.id}
                onClick={() => setIndex(i)}
                aria-label={`${i + 1}. duyuruya git`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-white" : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}