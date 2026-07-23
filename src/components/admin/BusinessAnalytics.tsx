"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Eye, Phone, MessageCircle, TrendingUp } from "lucide-react";

interface BusinessStat {
  id: string;
  name: string;
  slug: string;
  profile_views: number;
  phone_clicks: number;
  whatsapp_clicks: number;
  total: number;
}

export default function BusinessAnalytics() {
  const [stats, setStats] = useState<BusinessStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7" | "30" | "90">("30");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const since = new Date();
      since.setDate(since.getDate() - Number(period));

      const { data: businesses } = await supabase
        .from("businesses")
        .select("id, name, slug")
        .eq("status", "approved")
        .order("name");

      if (!businesses) { setLoading(false); return; }

      const { data: events } = await supabase
        .from("business_events")
        .select("business_id, event_type")
        .gte("occurred_at", since.toISOString());

      const eventMap: Record<string, { profile_views: number; phone_clicks: number; whatsapp_clicks: number }> = {};

      for (const b of businesses) {
        eventMap[b.id] = { profile_views: 0, phone_clicks: 0, whatsapp_clicks: 0 };
      }

      for (const e of events ?? []) {
        if (!eventMap[e.business_id]) continue;
        if (e.event_type === "profile_view") eventMap[e.business_id].profile_views++;
        if (e.event_type === "phone_click") eventMap[e.business_id].phone_clicks++;
        if (e.event_type === "whatsapp_click") eventMap[e.business_id].whatsapp_clicks++;
      }

      const result: BusinessStat[] = businesses.map((b) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        ...eventMap[b.id],
        total: eventMap[b.id].profile_views + eventMap[b.id].phone_clicks + eventMap[b.id].whatsapp_clicks,
      }));

      result.sort((a, b) => b.total - a.total);
      setStats(result);
      setLoading(false);
    }

    load();
  }, [period]);

  const totalViews = stats.reduce((s, b) => s + b.profile_views, 0);
  const totalPhone = stats.reduce((s, b) => s + b.phone_clicks, 0);
  const totalWhatsApp = stats.reduce((s, b) => s + b.whatsapp_clicks, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-ink/60">Dönem:</span>
        {(["7", "30", "90"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
              period === p
                ? "bg-navy text-white"
                : "border border-line bg-white text-ink/60 hover:bg-offwhite"
            }`}
          >
            Son {p} gün
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card-shadow rounded-2xl border border-line bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-ink/50">Toplam Görüntülenme</span>
            <Eye className="h-4 w-4 text-bordo" />
          </div>
          <span className="font-display text-2xl font-bold text-navy">{totalViews}</span>
        </div>
        <div className="card-shadow rounded-2xl border border-line bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-ink/50">Telefon Tıklamaları</span>
            <Phone className="h-4 w-4 text-bordo" />
          </div>
          <span className="font-display text-2xl font-bold text-navy">{totalPhone}</span>
        </div>
        <div className="card-shadow rounded-2xl border border-line bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-ink/50">WhatsApp Tıklamaları</span>
            <MessageCircle className="h-4 w-4 text-bordo" />
          </div>
          <span className="font-display text-2xl font-bold text-navy">{totalWhatsApp}</span>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-ink/40">Yükleniyor...</p>
      ) : (
        <div className="card-shadow overflow-hidden rounded-2xl border border-line bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-offwhite text-xs font-bold uppercase tracking-wide text-ink/40">
                <th className="px-4 py-3 text-left">İşletme</th>
                <th className="px-4 py-3 text-center">Görüntülenme</th>
                <th className="px-4 py-3 text-center">Arama</th>
                <th className="px-4 py-3 text-center">WhatsApp</th>
                <th className="px-4 py-3 text-center">Toplam</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((b, i) => (
                <tr
                  key={b.id}
                  className={`border-b border-line transition hover:bg-offwhite ${
                    i === 0 && b.total > 0 ? "bg-gold/5" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-semibold text-navy">{b.name}</td>
                  <td className="px-4 py-3 text-center text-ink/70">{b.profile_views}</td>
                  <td className="px-4 py-3 text-center text-ink/70">{b.phone_clicks}</td>
                  <td className="px-4 py-3 text-center text-ink/70">{b.whatsapp_clicks}</td>
                  <td className="px-4 py-3 text-center font-bold text-navy">{b.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}