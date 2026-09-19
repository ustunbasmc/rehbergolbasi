"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import type { Business, Category } from "@/lib/types";
import { Star, ImageOff, Car, ShieldAlert, MessageCircle, Check } from "lucide-react";
import EditBusinessModal from "@/components/admin/EditBusinessModal";
import BusinessChannelShare from "@/components/admin/BusinessChannelShare";
import { TAXI_PHONE_STALE_DAYS } from "@/lib/taxi";

type BusinessWithCategory = Business & { category?: { name: string; slug: string } | null };

function isTaxiBusiness(b: BusinessWithCategory): boolean {
  return b.category?.slug === "taksi-duragi";
}

function isPhoneStale(b: Business): boolean {
  if (!b.taxi_phone_verified_at) return true;
  const days = Math.floor((Date.now() - new Date(b.taxi_phone_verified_at).getTime()) / (1000 * 60 * 60 * 24));
  return days > TAXI_PHONE_STALE_DAYS;
}

export default function ApprovedList({ categories }: { categories: Category[] }) {
  const [businesses, setBusinesses] = useState<BusinessWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [missingCoverOnly, setMissingCoverOnly] = useState(false);
  const [taxiIssuesOnly, setTaxiIssuesOnly] = useState(false);
  const [welcomePendingOnly, setWelcomePendingOnly] = useState(false);
  const [editing, setEditing] = useState<Business | null>(null);

  const loadApproved = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("businesses")
      .select("*, category:categories(name, slug)")
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

  function hasTaxiIssue(b: BusinessWithCategory): boolean {
    if (!isTaxiBusiness(b)) return false;
    return (
      !b.phone ||
      !b.address ||
      b.lat == null ||
      b.lng == null ||
      isPhoneStale(b) ||
      b.taxi_temporarily_unavailable
    );
  }

  const visibleBusinesses = useMemo(() => {
    let list = businesses;
    if (missingCoverOnly) list = list.filter((b) => !b.cover_image_url);
    if (taxiIssuesOnly) list = list.filter(hasTaxiIssue);
    if (welcomePendingOnly) list = list.filter((b) => !b.welcome_message_sent_at);
    return list;
  }, [businesses, missingCoverOnly, taxiIssuesOnly, welcomePendingOnly]);

  // Sütun henüz veritabanına eklenmediyse (SQL çalıştırılmadıysa) select("*")
  // sonucunda alan hiç gelmez — o durumda filtre/rozet gösterilmez.
  const hasWelcomeColumn = businesses.length > 0 && "welcome_message_sent_at" in businesses[0];
  const welcomePendingCount = useMemo(
    () => businesses.filter((b) => !b.welcome_message_sent_at).length,
    [businesses]
  );

  const missingCoverCount = useMemo(
    () => businesses.filter((b) => !b.cover_image_url).length,
    [businesses]
  );
  const taxiIssueCount = useMemo(
    () => businesses.filter(hasTaxiIssue).length,
    [businesses]
  );

  useEffect(() => {
    const timeout = setTimeout(loadApproved, 250);
    return () => clearTimeout(timeout);
  }, [loadApproved]);

  function handleClosed() {
    setEditing(null);
    loadApproved();
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
        <button
          type="button"
          onClick={() => setMissingCoverOnly((v) => !v)}
          className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
            missingCoverOnly
              ? "border-gold bg-gold/10 text-gold-dark"
              : "border-line text-ink/60 hover:border-gold/40"
          }`}
        >
          <ImageOff className="h-3.5 w-3.5" /> Kapak görseli eksik ({missingCoverCount})
        </button>
        {hasWelcomeColumn && (
          <button
            type="button"
            onClick={() => setWelcomePendingOnly((v) => !v)}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
              welcomePendingOnly
                ? "border-green-600 bg-green-500/10 text-green-700"
                : "border-line text-ink/60 hover:border-green-600/40"
            }`}
          >
            <MessageCircle className="h-3.5 w-3.5" /> Hoş geldin mesajı atılmayanlar ({welcomePendingCount})
          </button>
        )}
        {taxiIssueCount > 0 && (
          <button
            type="button"
            onClick={() => setTaxiIssuesOnly((v) => !v)}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
              taxiIssuesOnly
                ? "border-bordo bg-bordo/10 text-bordo"
                : "border-line text-ink/60 hover:border-bordo/40"
            }`}
          >
            <Car className="h-3.5 w-3.5" /> Taksi sorunları ({taxiIssueCount})
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-ink/50">Yükleniyor...</p>
      ) : visibleBusinesses.length === 0 ? (
        <div className="card-shadow rounded-2xl bg-offwhite p-10 text-center text-ink/60">
          Sonuç bulunamadı.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleBusinesses.map((b) => (
            <div
              key={b.id}
              className="card-shadow card-shadow-hover flex flex-col gap-2 rounded-xl bg-white px-4 py-3 transition sm:flex-row sm:items-center sm:justify-between sm:gap-3"
            >
              <button type="button" onClick={() => setEditing(b)} className="min-w-0 flex-1 text-left">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-base font-bold text-navy">{b.name}</h3>
                  {b.is_featured && (
                    <span className="flex items-center gap-1 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-gold-dark">
                      <Star className="h-2.5 w-2.5 fill-gold-dark" /> Öne Çıkan
                    </span>
                  )}
                  {hasWelcomeColumn &&
                    (b.welcome_message_sent_at ? (
                      <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-bold text-green-700">
                        <Check className="h-2.5 w-2.5" /> Mesaj atıldı
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-offwhite px-2 py-0.5 text-[10px] font-semibold text-ink/50">
                        <MessageCircle className="h-2.5 w-2.5" /> Mesaj atılmadı
                      </span>
                    ))}
                  {!b.cover_image_url && (
                    <span className="flex items-center gap-1 rounded-full bg-offwhite px-2 py-0.5 text-[10px] font-semibold text-ink/50">
                      <ImageOff className="h-2.5 w-2.5" /> Kapak yok
                    </span>
                  )}
                  {isTaxiBusiness(b) && hasTaxiIssue(b) && (
                    <span className="flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold-dark">
                      <ShieldAlert className="h-2.5 w-2.5" />
                      {!b.phone
                        ? "Telefon yok"
                        : !b.address
                        ? "Adres yok"
                        : b.lat == null || b.lng == null
                        ? "Koordinat yok"
                        : b.taxi_temporarily_unavailable
                        ? "Hizmet dışı"
                        : "Telefon güncellenmeli"}
                    </span>
                  )}
                </div>
                <p className="font-mono text-xs text-ink/50">
                  {b.category?.name ?? "Kategori yok"} · {b.neighborhood ?? "Mahalle yok"}
                </p>
              </div>
              </button>
              <div className="flex shrink-0 items-center justify-end gap-3">
                <BusinessChannelShare
                  name={b.name}
                  slug={b.slug}
                  neighborhood={b.neighborhood}
                  shortDescription={b.short_description}
                  description={b.description}
                  categoryName={b.category?.name ?? null}
                />
                <button
                  type="button"
                  onClick={() => setEditing(b)}
                  className="text-sm font-semibold text-bordo"
                >
                  Düzenle →
                </button>
              </div>
            </div>
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