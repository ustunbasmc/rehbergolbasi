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
    <div className="relative aspect-[9/16] w-full overflow-hidden rounded-3xl bg-navy shadow-xl">
      {current.image_url ? (
        <Image
          src={current.image_url}
          alt={current.title}
          fill
          unoptimized
          sizes="(max-width: 640px) 70vw, 260px"
          className="object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-navy to-bordo-dark">
          <Megaphone className="h-8 w-8 text-white/20" />
        </div>
      )}
    </div>
  );

  return (
    <div className="relative mx-auto w-full max-w-[220px] sm:max-w-[260px]">
      {current.link_url ? <Link href={current.link_url}>{slide}</Link> : slide}

      {announcements.length > 1 && (
        <>
          <button
            onClick={() => setIndex((i) => (i - 1 + announcements.length) % announcements.length)}
            aria-label="Önceki duyuru"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-1.5 text-white backdrop-blur-sm hover:bg-white/25"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIndex((i) => (i + 1) % announcements.length)}
            aria-label="Sonraki duyuru"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-1.5 text-white backdrop-blur-sm hover:bg-white/25"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {announcements.map((a, i) => (
              <button
                key={a.id}
                onClick={() => setIndex(i)}
                aria-label={`${i + 1}. duyuruya git`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-5 bg-white" : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}