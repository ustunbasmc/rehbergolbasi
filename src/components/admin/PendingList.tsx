"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Business } from "@/lib/types";
import { pingIndexNow } from "@/lib/indexNow";

export default function PendingList() {
  const [pending, setPending] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const loadPending = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("businesses")
      .select("*, category:categories(name)")
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    setPending(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  async function handleDecision(id: string, status: "approved" | "rejected", slug: string) {
    setActingId(id);

    if (status === "approved") {
      const freeUntil = new Date();
      freeUntil.setMonth(freeUntil.getMonth() + 1);
      await supabase
        .from("businesses")
        .update({ status, free_until: freeUntil.toISOString(), is_active: true })
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
      <div className="rounded-2xl border border-line bg-offwhite p-10 text-center text-ink/60">
        Bekleyen başvuru yok.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {pending.map((b) => (
        <div key={b.id} className="card-shadow rounded-2xl border border-line bg-white p-5">
          <div className="mb-2">
            <h3 className="font-display text-lg font-bold text-navy">{b.name}</h3>
            <p className="font-mono text-xs text-ink/50">
              {b.category?.name ?? "Kategori yok"} · {b.neighborhood ?? "Mahalle belirtilmemiş"}
            </p>
          </div>
          {b.description && <p className="mb-3 text-sm text-ink/70">{b.description}</p>}
          <div className="mb-4 flex flex-wrap gap-3 text-xs text-ink/60">
            {b.phone && <span>📞 {b.phone}</span>}
            {b.whatsapp && <span>💬 {b.whatsapp}</span>}
            {b.instagram_url && <span>📷 {b.instagram_url}</span>}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleDecision(b.id, "approved", b.slug)}
              disabled={actingId === b.id}
              className="rounded-lg bg-navy px-4 py-2 text-sm font-bold text-white hover:bg-navy-dark disabled:opacity-60"
            >
              Onayla (1 ay ücretsiz başlat)
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
      ))}
    </div>
  );
}