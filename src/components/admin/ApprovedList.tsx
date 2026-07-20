"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Business, Category } from "@/lib/types";
import { Star } from "lucide-react";
import EditBusinessModal from "@/components/admin/EditBusinessModal";

export default function ApprovedList({ categories }: { categories: Category[] }) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Business | null>(null);

  const loadApproved = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("businesses")
      .select("*, category:categories(name)")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (categoryFilter !== "all") {
      query = query.eq("category_id", categoryFilter);
    }
    if (search.trim()) {
      query = query.ilike("name", `%${search.trim()}%`);
    }

    const { data } = await query;
    setBusinesses(data ?? []);
    setLoading(false);
  }, [search, categoryFilter]);

  useEffect(() => {
    const timeout = setTimeout(loadApproved, 250);
    return () => clearTimeout(timeout);
  }, [loadApproved]);

  function handleClosed() {
    setEditing(null);
  }

  function handleSaved() {
    setEditing(null);
    loadApproved();
  }

  function handleDeleted() {
    setEditing(null);
    loadApproved();
  }

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="İşletme adına göre ara..."
          className="flex-1 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
        >
          <option value="all">Tüm kategoriler</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-ink/50">Yükleniyor...</p>
      ) : businesses.length === 0 ? (
        <div className="rounded-2xl border border-line bg-offwhite p-10 text-center text-ink/60">
          Sonuç bulunamadı.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {businesses.map((b) => (
            <button
              key={b.id}
              onClick={() => setEditing(b)}
              className="card-shadow flex items-center justify-between rounded-xl border border-line bg-white px-4 py-3 text-left transition hover:border-bordo/40"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-base font-bold text-navy">{b.name}</h3>
                  {b.tier === "premium" && (
                    <span className="flex items-center gap-1 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-gold-dark">
                      <Star className="h-2.5 w-2.5 fill-gold-dark" /> Öne Çıkan
                    </span>
                  )}
                </div>
                <p className="font-mono text-xs text-ink/50">
                  {b.category?.name ?? "Kategori yok"} · {b.neighborhood ?? "Mahalle yok"}
                </p>
              </div>
              <span className="text-sm font-semibold text-bordo">Düzenle →</span>
            </button>
          ))}
        </div>
      )}

      {editing && (
        <EditBusinessModal
          business={editing}
          categories={categories}
          onClose={handleClosed}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}