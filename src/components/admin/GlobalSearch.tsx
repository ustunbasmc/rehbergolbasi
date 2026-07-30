"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Search, X, Building2 } from "lucide-react";

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  status: string;
}

export default function GlobalSearch({
  onSelect,
}: {
  onSelect: (businessId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("businesses")
      .select("id, name, slug, status")
      .ilike("name", `%${q.trim()}%`)
      .limit(8);
    setResults(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => search(query), 250);
    return () => clearTimeout(timeout);
  }, [query, search]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleSelect(id: string) {
    onSelect(id);
    setOpen(false);
    setQuery("");
    setResults([]);
  }

  const statusLabel: Record<string, { text: string; color: string }> = {
    approved: { text: "Onaylı", color: "bg-green-50 text-green-700" },
    pending: { text: "Bekliyor", color: "bg-gold/10 text-gold-dark" },
    rejected: { text: "Reddedildi", color: "bg-bordo/10 text-bordo" },
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <div className="flex items-center gap-2 rounded-lg border border-line bg-offwhite px-3 py-2">
        <Search className="h-4 w-4 shrink-0 text-ink/40" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="İşletme ara..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-ink/40"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); }}
            className="text-ink/30 hover:text-ink"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-xl border border-line bg-white shadow-lg">
          {loading ? (
            <p className="px-4 py-3 text-sm text-ink/40">Aranıyor...</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-ink/40">Sonuç bulunamadı.</p>
          ) : (
            results.map((r) => (
              <button
                key={r.id}
                onClick={() => handleSelect(r.id)}
                className="flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left last:border-0 hover:bg-offwhite"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bordo/10 text-bordo">
                  <Building2 className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-navy">
                  {r.name}
                </span>
                {statusLabel[r.status] && (
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${statusLabel[r.status].color}`}>
                    {statusLabel[r.status].text}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}