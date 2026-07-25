"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Eye, Phone, MessageCircle, TrendingUp, Monitor, Smartphone, Search } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar,
} from "recharts";

interface BusinessStat {
  id: string;
  name: string;
  slug: string;
  profile_views: number;
  phone_clicks: number;
  whatsapp_clicks: number;
  total: number;
}

interface DailyEvent {
  date: string;
  profile_view: number;
  phone_click: number;
  whatsapp_click: number;
}

interface RawEvent {
  business_id: string;
  event_type: string;
  occurred_at: string;
  device: string | null;
  referrer: string | null;
}

const COLORS = ["#8B0000", "#14213D", "#E5A817", "#6B7280"];

export default function BusinessAnalytics() {
  const [stats, setStats] = useState<BusinessStat[]>([]);
  const [dailyData, setDailyData] = useState<DailyEvent[]>([]);
  const [deviceData, setDeviceData] = useState<{ name: string; value: number }[]>([]);
  const [referrerData, setReferrerData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7" | "30" | "90">("30");
  const [search, setSearch] = useState("");

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
        .select("business_id, event_type, occurred_at, device, referrer")
        .gte("occurred_at", since.toISOString());

      const rawEvents: RawEvent[] = events ?? [];

      // İşletme bazlı istatistikler
      const eventMap: Record<string, { profile_views: number; phone_clicks: number; whatsapp_clicks: number }> = {};
      for (const b of businesses) {
        eventMap[b.id] = { profile_views: 0, phone_clicks: 0, whatsapp_clicks: 0 };
      }
      for (const e of rawEvents) {
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

      // Günlük trend
      const dayMap: Record<string, DailyEvent> = {};
      for (let i = Number(period) - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        dayMap[key] = { date: key, profile_view: 0, phone_click: 0, whatsapp_click: 0 };
      }
      for (const e of rawEvents) {
        const key = e.occurred_at.slice(0, 10);
        if (!dayMap[key]) continue;
        if (e.event_type === "profile_view") dayMap[key].profile_view++;
        if (e.event_type === "phone_click") dayMap[key].phone_click++;
        if (e.event_type === "whatsapp_click") dayMap[key].whatsapp_click++;
      }
      setDailyData(Object.values(dayMap));

      // Cihaz dağılımı
      const deviceMap: Record<string, number> = { mobile: 0, desktop: 0, unknown: 0 };
      for (const e of rawEvents) {
        const d = e.device ?? "unknown";
        deviceMap[d] = (deviceMap[d] ?? 0) + 1;
      }
      setDeviceData([
        { name: "Mobil", value: deviceMap.mobile },
        { name: "Masaüstü", value: deviceMap.desktop },
        { name: "Bilinmiyor", value: deviceMap.unknown },
      ].filter((d) => d.value > 0));

      // Referrer dağılımı
      const refMap: Record<string, number> = {};
      for (const e of rawEvents) {
        let ref = "Direkt";
        if (e.referrer) {
          try {
            const url = new URL(e.referrer);
            ref = url.hostname.replace("www.", "");
          } catch {
            ref = e.referrer.slice(0, 30);
          }
        }
        refMap[ref] = (refMap[ref] ?? 0) + 1;
      }
      const refArr = Object.entries(refMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
      setReferrerData(refArr);

      setLoading(false);
    }

    load();
  }, [period]);

  const totalViews = stats.reduce((s, b) => s + b.profile_views, 0);
  const totalPhone = stats.reduce((s, b) => s + b.phone_clicks, 0);
  const totalWhatsApp = stats.reduce((s, b) => s + b.whatsapp_clicks, 0);
  const totalAll = totalViews + totalPhone + totalWhatsApp;

  const filtered = stats.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <p className="text-sm text-ink/40">Yükleniyor...</p>;
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Dönem seçici */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold text-ink/60">Dönem:</span>
        {(["7", "30", "90"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
              period === p ? "bg-navy text-white" : "border border-line bg-white text-ink/60 hover:bg-offwhite"
            }`}
          >
            Son {p} gün
          </button>
        ))}
      </div>

      {/* Özet kartlar */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Toplam Etkileşim", value: totalAll, icon: TrendingUp },
          { label: "Görüntülenme", value: totalViews, icon: Eye },
          { label: "Arama", value: totalPhone, icon: Phone },
          { label: "WhatsApp", value: totalWhatsApp, icon: MessageCircle },
        ].map((c) => (
          <div key={c.label} className="card-shadow rounded-2xl border border-line bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-ink/50">{c.label}</span>
              <c.icon className="h-4 w-4 text-bordo" />
            </div>
            <span className="font-display text-2xl font-bold text-navy">{c.value}</span>
          </div>
        ))}
      </div>

      {/* Günlük trend grafiği */}
      <div className="card-shadow rounded-2xl border border-line bg-white p-5">
        <h3 className="mb-4 text-sm font-bold text-navy">Günlük Trend</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
            <Tooltip labelFormatter={(v) => `Tarih: ${v}`} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="profile_view" name="Görüntülenme" stroke="#14213D" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="phone_click" name="Arama" stroke="#8B0000" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="whatsapp_click" name="WhatsApp" stroke="#25D366" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Cihaz & Referrer grafikleri */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="card-shadow rounded-2xl border border-line bg-white p-5">
          <h3 className="mb-4 text-sm font-bold text-navy">Cihaz Dağılımı</h3>
          {deviceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
  data={deviceData}
  dataKey="value"
  nameKey="name"
  cx="50%"
  cy="50%"
  outerRadius={70}
>
  {deviceData.map((entry, i) => (
    <Cell key={i} fill={COLORS[i % COLORS.length]} />
  ))}
</Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-40 items-center justify-center text-sm text-ink/40">Veri yok</div>
          )}
          <div className="mt-3 flex justify-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-ink/60">
              <Smartphone className="h-3.5 w-3.5" /> Mobil
            </div>
            <div className="flex items-center gap-1.5 text-xs text-ink/60">
              <Monitor className="h-3.5 w-3.5" /> Masaüstü
            </div>
          </div>
        </div>

        <div className="card-shadow rounded-2xl border border-line bg-white p-5">
          <h3 className="mb-4 text-sm font-bold text-navy">Trafik Kaynakları</h3>
          {referrerData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={referrerData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                <Tooltip />
                <Bar dataKey="value" name="Ziyaret" fill="#14213D" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-40 items-center justify-center text-sm text-ink/40">Veri yok</div>
          )}
        </div>
      </div>

      {/* İşletme bazlı tablo */}
      <div className="card-shadow rounded-2xl border border-line bg-white">
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <Search className="h-4 w-4 text-ink/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="İşletme ara..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-ink/30"
          />
        </div>
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
            {filtered.map((b, i) => (
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
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-ink/40">
                  İşletme bulunamadı
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}