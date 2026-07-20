"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Trash2, PhoneCall } from "lucide-react";

interface ContactRequestRow {
  id: string;
  name: string;
  phone: string;
  message: string | null;
  created_at: string;
  business_id: string;
  business: { name: string; slug: string } | null;
}

export default function ContactRequestsList() {
  const [requests, setRequests] = useState<ContactRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("contact_requests")
      .select("*, business:businesses(name, slug)")
      .order("created_at", { ascending: false });
    setRequests((data as unknown as ContactRequestRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  async function handleDismiss(id: string) {
    setActingId(id);
    await supabase.from("contact_requests").delete().eq("id", id);
    setActingId(null);
    loadRequests();
  }

  if (loading) return <p className="text-ink/50">Yükleniyor...</p>;

  if (requests.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-white p-10 text-center text-ink/60">
        Bekleyen talep yok.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {requests.map((req) => (
        <div key={req.id} className="card-shadow rounded-xl border border-line bg-white p-4">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <PhoneCall className="h-3.5 w-3.5 text-bordo" />
                <span className="font-display text-sm font-bold text-navy">{req.name}</span>
                <span className="text-sm text-ink/60">· {req.phone}</span>
              </div>
              {req.business && (
                <Link
                  href={`/isletme/${req.business.slug}`}
                  target="_blank"
                  className="text-xs font-semibold text-bordo hover:underline"
                >
                  {req.business.name}
                </Link>
              )}
              <p className="mt-0.5 font-mono text-[11px] text-ink/40">
                {new Date(req.created_at).toLocaleString("tr-TR")}
              </p>
            </div>
            <button
              onClick={() => handleDismiss(req.id)}
              disabled={actingId === req.id}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ink/50 hover:bg-offwhite disabled:opacity-60"
            >
              <Trash2 className="h-3.5 w-3.5" /> Kapat
            </button>
          </div>
          {req.message && <p className="text-sm text-ink/70">{req.message}</p>}
        </div>
      ))}
    </div>
  );
}