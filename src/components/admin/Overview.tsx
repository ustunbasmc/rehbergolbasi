"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Eye, Clock, TrendingUp, TrendingDown, Building2, Wallet,
  Phone, MessageCircle, ArrowUpRight, Sparkles, Trophy,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";

interface CategoryCount {
  name: string;
  count: number;
}

interface StatusCount {
  name: string;
  value: number;
}

interface MonthRevenue {
  label: string;
  key: string;
  total: number;
}

interface TopViewed {
  id: string;
  name: string;
  slug: string;
  view_count: number;
}

interface ExpiringSoon {
  id: string;
  name: string;
  slug: string;
  daysLeft: number;
}

interface DailyEvent {
  date: string;
  label: string;
  views: number;
  calls: number;
  whatsapp: number;
}

const STATUS_COLORS: Record<string, string> = {
  Bekleyen: "#C9A24B",
  Onaylı: "#14213D",
  Reddedilen: "#7A1F2E",
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);
}

function KpiCard({
  icon: Icon,
  label,
  value,
  trend,
  gradient,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  trend?: { value: number; positive: boolean };
  gradient: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg"
      style={{ background: gradient }}
    >
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-6 -right-2 h-20 w-20 rounded-full bg-white/5" />
      <div className="relative">
        <div className="mb-3 flex items-center justify-between">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Icon className="h-5 w-5" />
          </span>
          {trend && (
            <span
              className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                trend.positive ? "bg-white/20" : "bg-black/20"
              }`}
            >
              {trend.positive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trend.value}%
            </span>
          )}
        </div>
        <p className="font-display text-2xl font-bold sm:text-3xl">{value}</p>
        <p className="text-xs font-medium text-white/70">{label}</p>
      </div>
    </div>
  );
}

export default function Overview() {
  const [categoryData, setCategoryData] = useState<CategoryCount[]>([]);
  const [statusData, setStatusData] = useState<StatusCount[]>([]);
  const [revenueData, setRevenueData] = useState<MonthRevenue[]>([]);
  const [topViewed, setTopViewed] = useState<TopViewed[]>([]);
  const [expiringSoon, setExpiringSoon] = useState<ExpiringSoon[]>([]);
  const [dailyEvents, setDailyEvents] = useState<DailyEvent[]>([]);
  const [kpis, setKpis] = useState({
    totalBusinesses: 0,
    activeBusinesses: 0,
    monthRevenue: 0,
    totalEngagement: 0,
    totalCalls: 0,
    totalWhatsapp: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);

    const since14 = new Date();
    since14.setDate(since14.getDate() - 13);

    const [
      { data: businesses },
      { data: payments },
      { data: topBusinesses },
      { data: expiryCandidates },
      { data: events },
    ] = await Promise.all([
      supabase.from("businesses").select("status, is_active, category:categories(name)"),
      supabase.from("payments").select("amount, paid_at"),
      supabase
        .from("businesses")
        .select("id, name, slug, view_count")
        .eq("status", "approved")
        .order("view_count", { ascending: false })
        .limit(5),
      supabase
        .from("businesses")
        .select("id, name, slug, free_until, paid_until")
        .eq("status", "approved")
        .eq("is_active", true),
      supabase
        .from("business_events")
        .select("event_type, occurred_at")
        .gte("occurred_at", since14.toISOString()),
    ]);

    if (businesses) {
      const catMap = new Map<string, number>();
      const statusMap = { pending: 0, approved: 0, rejected: 0 };
      let active = 0;

      businesses.forEach((b) => {
        const catName = (b.category as { name?: string } | null)?.name ?? "Diğer";
        catMap.set(catName, (catMap.get(catName) ?? 0) + 1);

        if (b.status === "pending") statusMap.pending++;
        if (b.status === "approved") statusMap.approved++;
        if (b.status === "rejected") statusMap.rejected++;
        if (b.status === "approved" && b.is_active) active++;
      });

      setCategoryData(
        Array.from(catMap.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
      );

      setStatusData([
        { name: "Bekleyen", value: statusMap.pending },
        { name: "Onaylı", value: statusMap.approved },
        { name: "Reddedilen", value: statusMap.rejected },
      ]);

      setKpis((prev) => ({
        ...prev,
        totalBusinesses: businesses.length,
        activeBusinesses: active,
      }));
    }

    const now = new Date();
    const months: MonthRevenue[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleDateString("tr-TR", { month: "short" }),
        total: 0,
      });
    }
    let currentMonthRevenue = 0;
    (payments ?? []).forEach((p) => {
      if (!p.paid_at) return;
      const d = new Date(p.paid_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const month = months.find((m) => m.key === key);
      if (month) month.total += p.amount ?? 0;
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
        currentMonthRevenue += p.amount ?? 0;
      }
    });
    setRevenueData(months);
    setKpis((prev) => ({ ...prev, monthRevenue: currentMonthRevenue }));

    setTopViewed(
      (topBusinesses ?? []).map((b) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        view_count: b.view_count ?? 0,
      }))
    );

    const soon: ExpiringSoon[] = (expiryCandidates ?? [])
      .map((b) => {
        const expiry = b.paid_until ?? b.free_until;
        if (!expiry) return null;
        const daysLeft = Math.ceil((new Date(expiry).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return { id: b.id, name: b.name, slug: b.slug, daysLeft };
      })
      .filter((b): b is ExpiringSoon => b !== null && b.daysLeft <= 14)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);
    setExpiringSoon(soon);

    // Günlük etkileşim trendi (son 14 gün)
    const dayMap: Record<string, DailyEvent> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dayMap[key] = {
        date: key,
        label: d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" }),
        views: 0,
        calls: 0,
        whatsapp: 0,
      };
    }
    let totalCalls = 0;
    let totalWhatsapp = 0;
    let totalViews = 0;
    (events ?? []).forEach((e) => {
      const key = e.occurred_at.slice(0, 10);
      if (!dayMap[key]) return;
      if (e.event_type === "profile_view") { dayMap[key].views++; totalViews++; }
      if (e.event_type === "phone_click") { dayMap[key].calls++; totalCalls++; }
      if (e.event_type === "whatsapp_click") { dayMap[key].whatsapp++; totalWhatsapp++; }
    });
    setDailyEvents(Object.values(dayMap));
    setKpis((prev) => ({
      ...prev,
      totalEngagement: totalViews + totalCalls + totalWhatsapp,
      totalCalls,
      totalWhatsapp,
    }));

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-offwhite" />
        ))}
      </div>
    );
  }

  const hasBusinesses = categoryData.length > 0;

  if (!hasBusinesses) {
    return (
      <div className="rounded-2xl border border-line bg-white p-10 text-center text-ink/60">
        Henüz grafik gösterecek kadar veri yok.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* KPI Kartları */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard
          icon={Building2}
          label="Aktif İşletme"
          value={`${kpis.activeBusinesses}`}
          gradient="linear-gradient(135deg, #14213D 0%, #1e3a5f 100%)"
        />
        <KpiCard
          icon={Wallet}
          label="Bu Ay Gelir"
          value={formatCurrency(kpis.monthRevenue)}
          gradient="linear-gradient(135deg, #7A1F2E 0%, #a12d40 100%)"
        />
        <KpiCard
          icon={Sparkles}
          label="14 Günlük Etkileşim"
          value={`${kpis.totalEngagement}`}
          gradient="linear-gradient(135deg, #C9A24B 0%, #dbb968 100%)"
        />
        <KpiCard
          icon={MessageCircle}
          label="WhatsApp Tıklaması"
          value={`${kpis.totalWhatsapp}`}
          gradient="linear-gradient(135deg, #25864a 0%, #34a85f 100%)"
        />
      </div>

      {/* Günlük Etkileşim Trendi */}
      <div className="card-shadow rounded-2xl border border-line bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ArrowUpRight className="h-4 w-4 text-bordo" />
            <h3 className="font-display text-base font-bold text-navy">Son 14 Gün — Ziyaretçi Etkileşimi</h3>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={dailyEvents} margin={{ left: -20 }}>
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14213D" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#14213D" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorWhatsapp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#25864a" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#25864a" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7A1F2E" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7A1F2E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={1} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="views" name="Görüntülenme" stroke="#14213D" fill="url(#colorViews)" strokeWidth={2} />
            <Area type="monotone" dataKey="whatsapp" name="WhatsApp" stroke="#25864a" fill="url(#colorWhatsapp)" strokeWidth={2} />
            <Area type="monotone" dataKey="calls" name="Arama" stroke="#7A1F2E" fill="url(#colorCalls)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Gelir grafiği */}
      <div className="card-shadow rounded-2xl border border-line bg-white p-5">
        <div className="mb-4 flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-bordo" />
          <h3 className="font-display text-base font-bold text-navy">Son 6 Ay Gelir</h3>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={revenueData} margin={{ left: -10 }}>
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value) => formatCurrency(Number(value) || 0)} />
            <Bar dataKey="total" fill="#14213D" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="card-shadow rounded-2xl border border-line bg-white p-5">
          <h3 className="mb-4 font-display text-base font-bold text-navy">
            Kategoriye Göre İşletme Sayısı
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryData} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#7A1F2E" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card-shadow rounded-2xl border border-line bg-white p-5">
          <h3 className="mb-4 font-display text-base font-bold text-navy">Durum Dağılımı</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
              >
                {statusData.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" height={30} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="card-shadow rounded-2xl border border-line bg-white p-5">
          <div className="mb-3 flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-gold-dark" />
            <h3 className="font-display text-base font-bold text-navy">
              En Çok Görüntülenen İşletmeler
            </h3>
          </div>
          {topViewed.length === 0 ? (
            <p className="text-sm text-ink/40">Henüz veri yok.</p>
          ) : (
            <div className="flex flex-col divide-y divide-line">
              {topViewed.map((b, i) => (
                <div key={b.id} className="flex items-center justify-between py-2.5">
                  <Link
                    href={`/isletme/${b.slug}`}
                    target="_blank"
                    className="flex items-center gap-2 text-sm font-semibold text-navy hover:text-bordo"
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                        i === 0
                          ? "bg-gold text-gold-dark"
                          : i === 1
                          ? "bg-ink/10 text-ink/60"
                          : i === 2
                          ? "bg-bordo/10 text-bordo"
                          : "bg-offwhite text-ink/40"
                      }`}
                    >
                      {i + 1}
                    </span>
                    {b.name}
                  </Link>
                  <span className="flex items-center gap-1 text-xs font-semibold text-ink/50">
                    <Eye className="h-3 w-3" /> {b.view_count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card-shadow rounded-2xl border border-line bg-white p-5">
          <div className="mb-3 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-bordo" />
            <h3 className="font-display text-base font-bold text-navy">Süresi Yaklaşanlar</h3>
          </div>
          {expiringSoon.length === 0 ? (
            <p className="text-sm text-ink/40">Önümüzdeki 14 gün içinde süresi dolan işletme yok.</p>
          ) : (
            <div className="flex flex-col divide-y divide-line">
              {expiringSoon.map((b) => (
                <div key={b.id} className="flex items-center justify-between py-2.5">
                  <Link
                    href={`/isletme/${b.slug}`}
                    target="_blank"
                    className="text-sm font-semibold text-navy hover:text-bordo"
                  >
                    {b.name}
                  </Link>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      b.daysLeft <= 0
                        ? "bg-bordo/10 text-bordo"
                        : b.daysLeft <= 3
                        ? "bg-gold/10 text-gold-dark"
                        : "bg-navy/5 text-navy"
                    }`}
                  >
                    {b.daysLeft <= 0 ? "Süresi doldu" : `${b.daysLeft} gün kaldı`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}