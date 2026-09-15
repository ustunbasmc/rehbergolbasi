"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import GundemCard, { type GundemCardData } from "@/components/GundemCard";

const AUTOPLAY_MS = 7000;

/**
 * Manşet slider'ı — yalnızca yeterli (2+) öne çıkan/güncel haber varken
 * devreye girer; tek haber varken sayfa bunun yerine düz `GundemCard
 * variant="hero"` render eder (bkz. /gundem/page.tsx), yani içerik azken
 * hiçbir zaman boş/garip bir slider görünmez.
 *
 * Kontroller kartın ALTINDA ayrı bir satırda — görsel üzerine bindirilmiş
 * yarı saydam oklar yerine — çünkü manşet kartının altında (fotoğrafın
 * aksine) değişken yükseklikte bir metin bloğu var; kartın tam ortasına
 * bindirilen oklar görsel-metin sınırına rastgele denk gelirdi.
 *
 * Otomatik geçiş `prefers-reduced-motion` tercih edildiğinde tamamen
 * kapanır; fare/klavye odağı slider üzerindeyken duraklar; ok tuşlarıyla
 * ve nokta göstergeleriyle tam klavye erişimi sağlar.
 */
export default function GundemHeroSlider({ slides }: { slides: GundemCardData[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (slides.length <= 1 || paused || reducedMotion) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [slides.length, paused, reducedMotion]);

  if (slides.length === 0) return null;

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <GundemCard post={slides[index]} variant="hero" />

      {slides.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
            aria-label="Önceki manşet"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-navy transition hover:border-bordo/40 hover:text-bordo"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1.5">
            {slides.map((s, i) => (
              <button
                key={s.slug}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`${i + 1}. manşete git`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-5 bg-bordo" : "w-1.5 bg-line hover:bg-bordo/40"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % slides.length)}
            aria-label="Sonraki manşet"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-navy transition hover:border-bordo/40 hover:text-bordo"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
