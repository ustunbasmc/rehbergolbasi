"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Clock } from "lucide-react";

export type SortOption = "onerilen" | "az" | "yeni";

const SORT_LABELS: Record<SortOption, string> = {
  onerilen: "Önerilen",
  az: "A - Z",
  yeni: "Yeni eklenen",
};

/**
 * Aktif bir arama sorgusu varken kategori bloğu yerine gösterilen faydalı
 * filtreler: mahalle, şu an açık, sıralama. Hepsi URL query parametreleriyle
 * çalışır — sonuç paylaşılabilir ve geri tuşu doğal olarak çalışır.
 */
export default function SearchFilters({ neighborhoods }: { neighborhoods: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const mahalle = searchParams.get("mahalle") ?? "";
  const acikOnly = searchParams.get("acik") === "1";
  const sirala = (searchParams.get("sirala") as SortOption | null) ?? "onerilen";

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {neighborhoods.length > 0 && (
        <select
          value={mahalle}
          onChange={(e) => updateParam("mahalle", e.target.value || null)}
          aria-label="Mahalleye göre filtrele"
          className="rounded-full border border-line bg-white px-3.5 py-1.5 text-sm font-semibold text-navy outline-none focus:border-bordo"
        >
          <option value="">Tüm mahalleler</option>
          {neighborhoods.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      )}

      <button
        type="button"
        onClick={() => updateParam("acik", acikOnly ? null : "1")}
        aria-pressed={acikOnly}
        className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
          acikOnly
            ? "border-bordo bg-bordo/10 text-bordo"
            : "border-line text-ink/60 hover:border-bordo/40"
        }`}
      >
        <Clock className="h-3.5 w-3.5" /> Şu an açık
      </button>

      <select
        value={sirala}
        onChange={(e) => updateParam("sirala", e.target.value === "onerilen" ? null : e.target.value)}
        aria-label="Sonuçları sırala"
        className="ml-auto rounded-full border border-line bg-white px-3.5 py-1.5 text-sm font-semibold text-navy outline-none focus:border-bordo"
      >
        {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
          <option key={key} value={key}>
            {SORT_LABELS[key]}
          </option>
        ))}
      </select>
    </div>
  );
}
