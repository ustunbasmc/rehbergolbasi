"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { Business } from "@/lib/types";
import { pingIndexNow } from "@/lib/indexNow";
import WorkingHoursCard from "@/components/WorkingHoursCard";
import { formatTelHref, formatWhatsappUrl, buildDirectionsUrl } from "@/lib/analytics";
import {
  Phone, MessageCircle, MapPin, AtSign, Link2, Globe, Navigation,
  Star, User, ListChecks, Tag as TagIcon, HelpCircle, Car, Clock, Sparkles,
} from "lucide-react";

interface OwnerInfo {
  owner_name: string | null;
  owner_phone: string | null;
  owner_email: string | null;
}

interface Extras {
  photos: string[];
  features: string[];
  tags: string[];
  faqCount: number;
  owner: OwnerInfo | null;
  serviceAreas: string[];
}

const EMPTY_EXTRAS: Extras = { photos: [], features: [], tags: [], faqCount: 0, owner: null, serviceAreas: [] };

export default function PendingList() {
  const [pending, setPending] = useState<Business[]>([]);
  const [extras, setExtras] = useState<Record<string, Extras>>({});
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const loadPending = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("businesses")
      .select("*, category:categories(name)")
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    const list = data ?? [];
    setPending(list);

    const ids = list.map((b) => b.id);
    if (ids.length === 0) {
      setExtras({});
      setLoading(false);
      return;
    }

    const [{ data: photoRows }, { data: featureRows }, { data: tagRows }, { data: faqRows }, { data: ownerRows }, { data: areaRows }] =
      await Promise.all([
        supabase.from("business_photos").select("business_id, url").in("business_id", ids).order("display_order", { ascending: true }),
        supabase.from("business_features").select("business_id, feature:features(name)").in("business_id", ids),
        supabase.from("business_tags").select("business_id, tag:tags(name)").in("business_id", ids),
        supabase.from("business_faqs").select("business_id").in("business_id", ids),
        supabase.from("business_owner_info").select("business_id, owner_name, owner_phone, owner_email").in("business_id", ids),
        supabase.from("business_service_areas").select("business_id, neighborhood").in("business_id", ids),
      ]);

    const map: Record<string, Extras> = {};
    for (const id of ids) map[id] = { photos: [], features: [], tags: [], faqCount: 0, owner: null, serviceAreas: [] };
    (photoRows ?? []).forEach((p) => map[p.business_id]?.photos.push(p.url));
    (featureRows ?? []).forEach((r) => {
      const name = (r.feature as unknown as { name?: string } | null)?.name;
      if (name) map[r.business_id]?.features.push(name);
    });
    (tagRows ?? []).forEach((r) => {
      const name = (r.tag as unknown as { name?: string } | null)?.name;
      if (name) map[r.business_id]?.tags.push(name);
    });
    (faqRows ?? []).forEach((r) => {
      if (map[r.business_id]) map[r.business_id].faqCount++;
    });
    (ownerRows ?? []).forEach((r) => {
      if (map[r.business_id]) map[r.business_id].owner = r;
    });
    (areaRows ?? []).forEach((r) => {
      if (map[r.business_id]) map[r.business_id].serviceAreas.push(r.neighborhood);
    });
    setExtras(map);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  async function handleDecision(id: string, status: "approved" | "rejected", slug: string) {
    setActingId(id);

    if (status === "approved") {
      // Temel profil süresizdir — free_until yalnızca Plus (premium) denemesi
      // başlatıldığında set edilir (bkz. EditBusinessModal "Ödeme Alındı" akışı).
      await supabase
        .from("businesses")
        .update({ status, is_active: true })
        .eq("id", id);
      pingIndexNow(`https://rehbergolbasi.com/isletme/${slug}`);
    } else {
      await supabase.from("businesses").update({ status }).eq("id", id);
    }

    setActingId(null);
    loadPending();
  }

  if (loading) return <p className="text-ink/50">Yükleniyor...</p>;

  if (pending.length === 0) {
    return (
      <div className="card-shadow rounded-2xl bg-offwhite p-10 text-center text-ink/60">
        Bekleyen başvuru yok.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {pending.map((b) => {
        const ex = extras[b.id] ?? EMPTY_EXTRAS;
        const directionsUrl = buildDirectionsUrl(b.lat, b.lng) ??
          (b.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.address)}` : null);

        return (
          <div key={b.id} className="card-shadow overflow-hidden rounded-2xl bg-white">
            <div className="flex flex-col gap-4 p-5 sm:flex-row">
              <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl bg-offwhite sm:h-auto sm:w-48">
                {b.cover_image_url ? (
                  <Image src={b.cover_image_url} alt={b.name} fill unoptimized sizes="192px" className="object-cover" />
                ) : (
                  <div className="flex h-full min-h-32 items-center justify-center text-ink/20">
                    Görsel yok
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg font-bold text-navy">{b.name}</h3>
                  {b.tier === "premium" && (
                    <span className="flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold-dark">
                      <Star className="h-3 w-3" /> Plus
                    </span>
                  )}
                  {b.taxi_page_visible && (
                    <span className="flex items-center gap-1 rounded-full bg-navy/5 px-2 py-0.5 text-[10px] font-bold text-navy">
                      <Car className="h-3 w-3" /> Taksi sayfasında görünür
                    </span>
                  )}
                </div>
                <p className="mb-3 font-mono text-xs text-ink/50">
                  {b.category?.name ?? "Kategori yok"} · {b.neighborhood ?? "Mahalle belirtilmemiş"} ·{" "}
                  {new Date(b.created_at).toLocaleDateString("tr-TR")}
                </p>

                {b.description && <p className="mb-3 text-sm text-ink/70">{b.description}</p>}

                <div className="mb-3 flex flex-wrap gap-2 text-xs">
                  {b.phone && (
                    <a href={formatTelHref(b.phone)} className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 font-semibold text-navy hover:border-bordo">
                      <Phone className="h-3.5 w-3.5" /> {b.phone}
                    </a>
                  )}
                  {b.whatsapp && (
                    <a href={formatWhatsappUrl(b.whatsapp)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 font-semibold text-navy hover:border-bordo">
                      <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                    </a>
                  )}
                  {b.instagram_url && (
                    <a href={b.instagram_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 font-semibold text-navy hover:border-bordo">
                      <AtSign className="h-3.5 w-3.5" /> Instagram
                    </a>
                  )}
                  {b.facebook_url && (
                    <a href={b.facebook_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 font-semibold text-navy hover:border-bordo">
                      <Link2 className="h-3.5 w-3.5" /> Facebook
                    </a>
                  )}
                  {b.website && (
                    <a href={b.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 font-semibold text-navy hover:border-bordo">
                      <Globe className="h-3.5 w-3.5" /> Web sitesi
                    </a>
                  )}
                  {directionsUrl && (
                    <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 font-semibold text-navy hover:border-bordo">
                      <Navigation className="h-3.5 w-3.5" /> Yol tarifi
                    </a>
                  )}
                </div>

                {b.address && (
                  <p className="mb-3 flex items-start gap-1.5 text-xs text-ink/60">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {b.address}
                  </p>
                )}

                {ex.owner && (ex.owner.owner_name || ex.owner.owner_phone || ex.owner.owner_email) && (
                  <div className="mb-3 flex flex-wrap items-center gap-1.5 rounded-lg bg-gold/5 px-3 py-2 text-xs text-navy/80">
                    <User className="h-3.5 w-3.5 shrink-0 text-gold-dark" />
                    <span className="font-semibold">Sahip/yetkili bilgisi (yalnızca admin görür):</span>
                    {ex.owner.owner_name && <span>{ex.owner.owner_name}</span>}
                    {ex.owner.owner_phone && <span>· {ex.owner.owner_phone}</span>}
                    {ex.owner.owner_email && <span>· {ex.owner.owner_email}</span>}
                  </div>
                )}

                {ex.serviceAreas.length > 0 && (
                  <p className="mb-3 text-xs text-ink/50">
                    Hizmet alanı: {ex.serviceAreas.join(", ")}
                  </p>
                )}

                <div className="mb-3 flex flex-wrap gap-1.5">
                  {ex.features.map((f) => (
                    <span key={f} className="flex items-center gap-1 rounded-full bg-navy/5 px-2 py-0.5 text-[11px] text-navy">
                      <ListChecks className="h-3 w-3" /> {f}
                    </span>
                  ))}
                  {ex.tags.map((t) => (
                    <span key={t} className="flex items-center gap-1 rounded-full bg-bordo/5 px-2 py-0.5 text-[11px] text-bordo">
                      <TagIcon className="h-3 w-3" /> {t}
                    </span>
                  ))}
                  {ex.faqCount > 0 && (
                    <span className="flex items-center gap-1 rounded-full bg-offwhite px-2 py-0.5 text-[11px] text-ink/60">
                      <HelpCircle className="h-3 w-3" /> {ex.faqCount} SSS
                    </span>
                  )}
                  {b.opening_hours && (
                    <span className="flex items-center gap-1 rounded-full bg-offwhite px-2 py-0.5 text-[11px] text-ink/60">
                      <Clock className="h-3 w-3" /> Çalışma saatleri girilmiş
                    </span>
                  )}
                </div>

                {ex.photos.length > 0 && (
                  <div className="mb-1 flex gap-1.5 overflow-x-auto pb-1">
                    {ex.photos.map((url) => (
                      <div key={url} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-offwhite">
                        <Image src={url} alt="" fill unoptimized sizes="64px" className="object-cover" />
                      </div>
                    ))}
                    <span className="flex h-16 items-center pl-1 text-[11px] text-ink/40">
                      <Sparkles className="mr-1 h-3 w-3" /> {ex.photos.length} fotoğraf
                    </span>
                  </div>
                )}
              </div>
            </div>

            {b.opening_hours && (
              <div className="border-t border-line px-5 py-4">
                <WorkingHoursCard hours={b.opening_hours} />
              </div>
            )}

            <div className="flex gap-3 border-t border-line px-5 py-4">
              <button
                onClick={() => handleDecision(b.id, "approved", b.slug)}
                disabled={actingId === b.id}
                className="rounded-lg bg-navy px-4 py-2 text-sm font-bold text-white hover:bg-navy-dark disabled:opacity-60"
              >
                Onayla ve Yayınla (Temel — ücretsiz)
              </button>
              <button
                onClick={() => handleDecision(b.id, "rejected", b.slug)}
                disabled={actingId === b.id}
                className="rounded-lg border border-line px-4 py-2 text-sm font-bold text-ink/60 hover:bg-offwhite disabled:opacity-60"
              >
                Reddet
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
