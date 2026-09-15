"use client";

import Link from "next/link";
import { Search, Pill, Bus, Car, Newspaper, type LucideIcon } from "lucide-react";
import { trackHomeEvent } from "@/lib/analytics";

const ARAMA_ORNEKLERI = ["taksi", "kuaför", "restoran", "oto kurtarma"];

const HIZLI_EYLEMLER: { href: string; label: string; icon: LucideIcon; bg: string }[] = [
  { href: "/taksi", label: "Taksi", icon: Car, bg: "from-gold to-gold-dark" },
  { href: "/nobetci-eczane", label: "Eczane", icon: Pill, bg: "from-green-500 to-green-600" },
  { href: "/otobus-saatleri", label: "Otobüs", icon: Bus, bg: "from-navy to-navy-dark" },
  { href: "/gundem", label: "Gündem", icon: Newspaper, bg: "from-bordo to-bordo-dark" },
];

/**
 * Hero'nun arama kutusu, örnek chip'ler ve 4 hızlı-eylem karosu — hepsi tek
 * client bileşende, çünkü üçü de tıklama/gönderim event'i (trackHomeEvent,
 * meta.source: "home") fırlatıyor. Hedef sayfaların (ör. /taksi) kendi
 * sayfa-görüntüleme event'leriyle çakışmaz — "ana sayfadan kaç tıklama"
 * sorusu ayrı, tekrarsız bir veridir (bkz. lib/analytics.ts).
 */
export default function HeroSearchArea() {
  return (
    <>
      <form
        action="/isletmeler"
        onSubmit={(e) => {
          const query = new FormData(e.currentTarget).get("q");
          if (typeof query === "string" && query.trim()) {
            trackHomeEvent("home_search_submit", { query: query.trim() });
          }
        }}
        className="mt-4 flex items-center gap-1.5 rounded-2xl bg-white p-1.5 shadow-2xl sm:mt-6 sm:max-w-lg sm:gap-2 sm:p-2"
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2 sm:px-3 sm:py-2.5">
          <Search className="h-4.5 w-4.5 shrink-0 text-ink/40 sm:h-5 sm:w-5" />
          <input
            type="text"
            name="q"
            placeholder="Restoran, kuaför, emlakçı ara..."
            className="w-full min-w-0 text-sm text-ink outline-none placeholder:text-ink/40"
          />
        </div>
        <button
          type="submit"
          aria-label="Ara"
          className="flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-bordo to-bordo-dark px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg hover:brightness-110 active:scale-[0.97] sm:px-6 sm:py-3"
        >
          Ara
        </button>
      </form>

      <div className="mt-2.5 flex gap-1.5 overflow-x-auto [scrollbar-width:none] sm:flex-wrap [&::-webkit-scrollbar]:hidden">
        {ARAMA_ORNEKLERI.map((ornek) => (
          <Link
            key={ornek}
            href={`/isletmeler?q=${encodeURIComponent(ornek)}`}
            onClick={() => trackHomeEvent("home_example_chip_click", { query: ornek })}
            className="shrink-0 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-sm transition hover:border-gold/40 hover:bg-white/15 hover:text-gold"
          >
            {ornek}
          </Link>
        ))}
      </div>

      {/* 4 hızlı eylem — mobilde arama ile birlikte ilk ekranda görünür */}
      <div className="mt-4 grid grid-cols-4 gap-2 sm:mt-6 sm:max-w-lg sm:gap-3">
        {HIZLI_EYLEMLER.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => trackHomeEvent("home_quick_action_click", { action: item.label })}
              className="card-shadow-hover flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-2xl bg-white px-1 py-2 text-center shadow-lg transition active:scale-[0.97] sm:min-h-[76px] sm:gap-1.5 sm:py-3"
            >
              <span className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br sm:h-10 sm:w-10 ${item.bg}`}>
                <Icon className="h-3.5 w-3.5 text-white sm:h-4.5 sm:w-4.5" />
              </span>
              <span className="whitespace-nowrap text-[11px] font-bold leading-tight text-navy sm:text-xs">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
