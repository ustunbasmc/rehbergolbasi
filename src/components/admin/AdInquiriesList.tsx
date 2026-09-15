"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Trash2, Megaphone, Phone } from "lucide-react";
import { AD_PLACEMENTS } from "@/lib/adPlacements";

interface AdInquiry {
  id: string;
  business_name: string;
  contact_name: string;
  phone: string;
  email: string | null;
  placement: string | null;
  message: string | null;
  created_at: string;
}

const PLACEMENT_LABEL: Record<string, string> = Object.fromEntries(
  AD_PLACEMENTS.map((p) => [p.key, p.label])
);

export default function AdInquiriesList() {
  const [items, setItems] = useState<AdInquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("ad_inquiries")
      .select("*")
      .order("created_at", { ascending: false });
    setItems((data as AdInquiry[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Bu talebi silmek istediğine emin misin?");
    if (!confirmed) return;
    await supabase.from("ad_inquiries").delete().eq("id", id);
    load();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-bold text-navy">Reklam Talepleri</h2>
        <p className="text-sm text-ink/50">/reklam-ver sayfasından gelen reklam verme başvuruları.</p>
      </div>

      {loading ? (
        <p className="text-sm text-ink/40">Yükleniyor...</p>
      ) : items.length === 0 ? (
        <div className="card-shadow rounded-2xl bg-white p-10 text-center text-ink/60">
          Bekleyen reklam talebi yok.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} className="card-shadow rounded-xl bg-white p-4">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <div className="mb-0.5 flex items-center gap-1.5">
                    <Megaphone className="h-3.5 w-3.5 text-bordo" />
                    <p className="font-display text-sm font-bold text-navy">{item.business_name}</p>
                  </div>
                  <p className="text-xs text-ink/50">
                    {item.contact_name}
                    {item.placement && ` · ${PLACEMENT_LABEL[item.placement] ?? item.placement}`}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="rounded-lg p-1.5 text-bordo hover:bg-bordo/5"
                  aria-label="Sil"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {item.message && <p className="mb-2 text-sm text-ink/70">{item.message}</p>}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <a
                  href={`tel:${item.phone}`}
                  className="flex items-center gap-1.5 font-semibold text-bordo hover:underline"
                >
                  <Phone className="h-3.5 w-3.5" /> {item.phone}
                </a>
                {item.email && <span className="text-ink/50">{item.email}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
