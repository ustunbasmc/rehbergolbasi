"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Eye, Clock, TrendingUp, Building2, Wallet,
  MessageCircle, ArrowUpRight, Sparkles, Trophy,
  ListTodo, FileEdit, Car, Newspaper, Pill, Bus, Search as SearchIcon,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";
import type { Tab } from "@/components/AdminDashboard";
import KpiCard from "./dashboard/KpiCard";
import ModuleBreakdown, { type ModuleCardData } from "./dashboard/ModuleBreakdown";
import SiteTrendChart, { type TrendPoint } from "./dashboard/SiteTrendChart";
import TopContentLists, { type TopGundemPost, type TopSearchTerm } from "./dashboard/TopContentLists";
import DeviceReferrerBreakdown, {
  type DeviceCount,
  type ReferrerCount,
} from "./dashboard/DeviceReferrerBreakdown";
import RecentActivity, {
  RECENT_ACTIVITY_EVENT_TYPES,
  type RecentActivityItem,
} from "./dashboard/RecentActivity";
import {
  MODULES,
  MODULE_BREAKDOWN_EVENTS,
  moduleForEvent,
  classifyReferrer,
  extractQuery,
  type RawBusinessEvent,
} from "./dashboard/moduleStats";

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

const MODULE_ICONS: Record<string, React.ElementType> = {
  business: Building2,
  home: Sparkles,
  taxi: Car,
  gundem: Newspaper,
  eczane: Pill,
  otobus: Bus,
};

const MODULE_GRADIENTS: Record<string, string> = {
  business: "from-navy to-navy-dark",
  home: "from-bordo to-bordo-dark",
  taxi: "from-gold to-gold-dark",
  gundem: "from-green-500 to-green-600",
  eczane: "from-sky-500 to-sky-600",
  otobus: "from-violet-500 to-violet-600",
};

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-ink/35">{children}</p>
  );
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);
}

export default function Overview({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
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
  const [todos, setTodos] = useState({
    pendingCount: 0,
    expiringCount: 0,
    draftGuidesCount: 0,
  });

  // Site geneli (tüm modüller) — yalnızca ana sayfada zaten var olan
  // işletme-profili event'leriyle sınırlı değil, business_events'te
  // tanımlı TÜM event tiplerini kapsar (bkz. dashboard/moduleStats.ts).
  const [siteTotalEvents, setSiteTotalEvents] = useState(0);
  const [moduleCards, setModuleCards] = useState<ModuleCardData[]>([]);
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceCount[]>([]);
  const [referrerData, setReferrerData] = useState<ReferrerCount[]>([]);
  const [topPosts, setTopPosts] = useState<TopGundemPost[]>([]);
  const [searchTerms, setSearchTerms] = useState<TopSearchTerm[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);

  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);

    const since14 = new Date();
    since14.setDate(since14.getDate() - 13);
    const since30 = new Date();
    since30.setDate(since30.getDate() - 29);

    const [
      { data: businesses },
      { data: payments },
      { data: topBusinesses },
      { data: expiryCandidates },
      { data: events14 },
      { count: draftGuides },
      { data: workOrderRevenue },
      { data: events30 },
      { data: gundemTop },
      { data: recentEvents },
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
      supabase
        .from("guides")
        .select("id", { count: "exact", head: true })
        .eq("published", false),
      supabase.from("work_orders").select("price, revenue_date").neq("status", "cancelled"),
      supabase
        .from("business_events")
        .select("event_type, occurred_at, device, referrer, meta")
        .gte("occurred_at", since30.toISOString()),
      supabase
        .from("gundem_posts")
        .select("slug, title, view_count")
        .is("deleted_at", null)
        .in("status", ["scheduled", "published"])
        .order("view_count", { ascending: false })
        .limit(5),
      supabase
        .from("business_events")
        .select("id, event_type, occurred_at, device, referrer, meta, business:businesses(name)")
        .in("event_type", RECENT_ACTIVITY_EVENT_TYPES)
        .order("occurred_at", { ascending: false })
        .limit(12),
    ]);

    setRecentActivity(
      (recentEvents ?? []).map((e) => ({
        id: e.id,
        eventType: e.event_type,
        occurredAt: e.occurred_at,
        businessName: (e.business as unknown as { name?: string } | null)?.name ?? null,
        query: extractQuery(e.meta as Record<string, unknown> | null),
        device: e.device ?? null,
        referrer: e.referrer ?? null,
      }))
    );

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

      setTodos((prev) => ({ ...prev, pendingCount: statusMap.pending }));
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
    (workOrderRevenue ?? []).forEach((w) => {
      if (!w.revenue_date || !w.price) return;
      const d = new Date(w.revenue_date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const month = months.find((m) => m.key === key);
      if (month) month.total += w.price;
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
        currentMonthRevenue += w.price;
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

    setTodos((prev) => ({
      ...prev,
      expiringCount: soon.filter((b) => b.daysLeft <= 7).length,
      draftGuidesCount: draftGuides ?? 0,
    }));

    // Günlük etkileşim trendi (son 14 gün) — yalnızca işletme profili event'leri
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
    (events14 ?? []).forEach((e) => {
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

    // ---- Site geneli (30 gün, tüm modüller) ----
    const rawEvents: RawBusinessEvent[] = (events30 ?? []) as unknown as RawBusinessEvent[];

    const moduleTotals: Record<string, number> = {};
    const moduleTypeCounts: Record<string, Record<string, number>> = {};
    const deviceCounts: Record<string, number> = { mobile: 0, desktop: 0 };
    const referrerCounts = new Map<string, number>();
    const queryCounts = new Map<string, number>();
    const trendMap: Record<string, TrendPoint> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      trendMap[key] = {
        label: d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" }),
        business: 0,
        home: 0,
        taxi: 0,
        gundem: 0,
        eczane: 0,
        otobus: 0,
      };
    }

    rawEvents.forEach((e) => {
      const mod = moduleForEvent(e.event_type, e.meta);
      if (mod) {
        moduleTotals[mod] = (moduleTotals[mod] ?? 0) + 1;
        moduleTypeCounts[mod] ??= {};
        moduleTypeCounts[mod][e.event_type] = (moduleTypeCounts[mod][e.event_type] ?? 0) + 1;

        const dayKey = e.occurred_at.slice(0, 10);
        if (trendMap[dayKey]) {
          trendMap[dayKey][mod] += 1;
        }
      }

      if (e.device === "mobile" || e.device === "desktop") {
        deviceCounts[e.device] += 1;
      }

      const refLabel = classifyReferrer(e.referrer);
      referrerCounts.set(refLabel, (referrerCounts.get(refLabel) ?? 0) + 1);

      const q = extractQuery(e.meta);
      if (q) queryCounts.set(q, (queryCounts.get(q) ?? 0) + 1);
    });

    setSiteTotalEvents(rawEvents.length);

    setModuleCards(
      MODULES.map((m) => {
        const total = moduleTotals[m.key] ?? 0;
        const knownBreakdown = MODULE_BREAKDOWN_EVENTS[m.key].map((b) => ({
          label: b.label,
          value: moduleTypeCounts[m.key]?.[b.type] ?? 0,
        }));
        // moduleTotals bir modüle eşlenen TÜM event tiplerini sayar, ama
        // MODULE_BREAKDOWN_EVENTS yalnızca öne çıkan birkaçını listeler
        // (ör. taksi_location_* huni adımları kasıtlı olarak dışarıda) —
        // aradaki farkı "Diğer" satırıyla gösterip toplam ile kırılımın
        // her zaman eşleşmesini sağlıyoruz.
        const other = total - knownBreakdown.reduce((sum, b) => sum + b.value, 0);
        return {
          key: m.key,
          label: m.label,
          icon: MODULE_ICONS[m.key],
          gradient: MODULE_GRADIENTS[m.key],
          total,
          breakdown: other > 0 ? [...knownBreakdown, { label: "Diğer", value: other }] : knownBreakdown,
        };
      })
    );

    setTrendData(Object.values(trendMap));

    setDeviceData([
      { name: "Mobil", value: deviceCounts.mobile },
      { name: "Masaüstü", value: deviceCounts.desktop },
    ]);

    setReferrerData(
      Array.from(referrerCounts.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8)
    );

    setSearchTerms(
      Array.from(queryCounts.entries())
        .map(([term, count]) => ({ term, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 12)
    );

    setTopPosts(
      (gundemTop ?? []).map((p) => ({ slug: p.slug, title: p.title, view_count: p.view_count ?? 0 }))
    );

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
      <div className="card-shadow rounded-2xl bg-white p-10 text-center text-ink/60">
        Henüz grafik gösterecek kadar veri yok.
      </div>
    );
  }

  const todoItems = [
    todos.pendingCount > 0 && {
      icon: ListTodo,
      text: `${todos.pendingCount} bekleyen başvuru var`,
      color: "text-gold-dark",
      tab: "pending" as Tab,
    },
    todos.expiringCount > 0 && {
      icon: Clock,
      text: `${todos.expiringCount} işletmenin süresi 7 gün içinde doluyor`,
      color: "text-bordo",
      tab: "expiry" as Tab,
    },
    todos.draftGuidesCount > 0 && {
      icon: FileEdit,
      text: `${todos.draftGuidesCount} rehber taslak halinde bekliyor`,
      color: "text-navy",
      tab: "guides" as Tab,
    },
  ].filter(Boolean) as { icon: React.ElementType; text: string; color: string; tab: Tab }[];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <SectionEyebrow>Genel Durum</SectionEyebrow>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
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
            label="30 Günlük Site Etkileşimi"
            value={`${siteTotalEvents}`}
            gradient="linear-gradient(135deg, #C9A24B 0%, #dbb968 100%)"
          />
          <KpiCard
            icon={MessageCircle}
            label="WhatsApp Tıklaması (14g)"
            value={`${kpis.totalWhatsapp}`}
            gradient="linear-gradient(135deg, #25864a 0%, #34a85f 100%)"
          />
        </div>
          <RecentActivity items={recentActivity} />
        </div>
      </div>

      {/* Bugün Yapılacaklar */}
      {todoItems.length > 0 && (
        <div className="card-shadow rounded-2xl bg-gold/5 p-4">
          <div className="mb-2 flex items-center gap-1.5">
            <ListTodo className="h-4 w-4 text-gold-dark" />
            <span className="text-sm font-bold text-navy">Bugün Yapılacaklar</span>
          </div>
          <div className="flex flex-col gap-1">
            {todoItems.map((item, i) => (
              <button
                key={i}
                onClick={() => onNavigate(item.tab)}
                className="flex items-center gap-2 rounded-lg px-1.5 py-1 text-left text-sm text-ink/70 transition hover:bg-white/60"
              >
                <item.icon className={`h-3.5 w-3.5 shrink-0 ${item.color}`} />
                {item.text}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <SectionEyebrow>Site Etkileşimi (Son 30 Gün)</SectionEyebrow>
        <div className="flex flex-col gap-5">
          {/* Modül kartları — site geneli, tüm event tipleri (son 30 gün) */}
          <div>
            <div className="mb-3 flex items-center gap-1.5">
              <SearchIcon className="h-4 w-4 text-bordo" />
              <h3 className="font-display text-base font-bold text-navy">Modül Bazlı Etkileşim</h3>
            </div>
            <ModuleBreakdown modules={moduleCards} />
          </div>

          {/* Site geneli günlük trend */}
          <div className="card-shadow rounded-2xl bg-white p-5">
            <div className="mb-4 flex items-center gap-1.5">
              <ArrowUpRight className="h-4 w-4 text-bordo" />
              <h3 className="font-display text-base font-bold text-navy">Günlük Trend</h3>
            </div>
            <SiteTrendChart data={trendData} />
          </div>
        </div>
      </div>

      <div>
        <SectionEyebrow>İçerik &amp; Trafik Kaynakları</SectionEyebrow>
        <div className="flex flex-col gap-5">
          {/* En çok okunan gündem + en çok aranan terimler */}
          <TopContentLists posts={topPosts} terms={searchTerms} />

          {/* Cihaz + kaynak dağılımı (site geneli) */}
          <DeviceReferrerBreakdown devices={deviceData} referrers={referrerData} />
        </div>
      </div>

      <div className="flex flex-col gap-5">
      <SectionEyebrow>İşletme Yönetimi</SectionEyebrow>
      {/* Eski: işletme profili etkileşim trendi (14 gün) */}
      <div className="card-shadow rounded-2xl bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Eye className="h-4 w-4 text-bordo" />
            <h3 className="font-display text-base font-bold text-navy">Son 14 Gün — İşletme Profili Etkileşimi</h3>
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
      <div className="card-shadow rounded-2xl bg-white p-5">
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
        <div className="card-shadow rounded-2xl bg-white p-5">
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

        <div className="card-shadow rounded-2xl bg-white p-5">
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
        <div className="card-shadow rounded-2xl bg-white p-5">
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

        <div className="card-shadow rounded-2xl bg-white p-5">
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
    </div>
  );
}
