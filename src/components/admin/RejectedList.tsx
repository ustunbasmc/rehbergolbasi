"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Business } from "@/lib/types";
import { RotateCcw, Trash2 } from "lucide-react";

export default function RejectedList() {
  const [rejected, setRejected] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const loadRejected = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("businesses")
      .select("*, category:categories(name)")
      .eq("status", "rejected")
      .order("created_at", { ascending: false });
    setRejected(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadRejected();
  }, [loadRejected]);

  async function handleReconsider(id: string) {
    setActingId(id);
    await supabase.from("businesses").update({ status: "pending" }).eq("id", id);
    setActingId(null);
    loadRejected();
  }

  async function handleDelete(id: string, name: string) {
    const confirmed = window.confirm(`"${name}" kalıcı olarak silinsin mi?`);
    if (!confirmed) return;

    setActingId(id);
    await supabase.from("businesses").delete().eq("id", id);
    setActingId(null);
    loadRejected();
  }

  if (loading) return <p className="text-ink/50">Yükleniyor...</p>;

  if (rejected.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-white p-10 text-center text-ink/60">
        Reddedilen başvuru yok.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {rejected.map((b) => (
        <div
          key={b.id}
          className="card-shadow flex items-center justify-between rounded-xl border border-line bg-white px-4 py-3"
        >
          <div>
            <h3 className="font-display text-base font-bold text-navy">{b.name}</h3>
            <p className="font-mono text-xs text-ink/50">
              {b.category?.name ?? "Kategori yok"} · {b.neighborhood ?? "Mahalle yok"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleReconsider(b.id)}
              disabled={actingId === b.id}
              className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-navy hover:bg-offwhite disabled:opacity-60"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Yeniden Değerlendir
            </button>
            <button
              onClick={() => handleDelete(b.id, b.name)}
              disabled={actingId === b.id}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-bordo hover:bg-bordo/5 disabled:opacity-60"
            >
              <Trash2 className="h-3.5 w-3.5" /> Sil
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}