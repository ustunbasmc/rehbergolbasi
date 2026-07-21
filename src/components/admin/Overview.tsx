"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Eye, Clock, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
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

const STATUS_COLORS: Record<string, string> = {
  Bekleyen: "#C9A24B",
  Onaylı: "#14213D",
  Reddedilen: "#7A1F2E",
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);
}

export default function Overview() {
  const [categoryData, setCategoryData] = useState<CategoryCount[]>([]);
  const [statusData, setStatusData] = useState<StatusCount[]>([]);
  const [revenueData, setRevenueData] = useState<MonthRevenue[]>([]);
  const [topViewed, setTopViewed] = useState<TopViewed[]>([]);
  const [expiringSoon, setExpiringSoon] = useState<ExpiringSoon[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);

    const [{ data: businesses }, { data: payments }, { data: topBusinesses }, { data: expiryCandidates }] =
      await Promise.all([
        supabase.from("businesses").select("status, category:categories(name)"),
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
      ]);

    if (businesses) {
      const catMap = new Map<string, number>();
      const statusMap = { pending: 0, approved: 0, rejected: 0 };

      businesses.forEach((b) => {
        const catName = (b.category as { name?: string } | null)?.name ?? "Diğer";
        catMap.set(catName, (catMap.get(catName) ?? 0) + 1);

        if (b.status === "pending") statusMap.pending++;
        if (b.status === "approved") statusMap.approved++;
        if (b.status === "rejected") statusMap.rejected++;
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
    (payments ?? []).forEach((p) => {
      if (!p.paid_at) return;
      const d = new Date(p.paid_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const month = months.find((m) => m.key === key);
      if (month) month.total += p.amount ?? 0;
    });
    setRevenueData(months);

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

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <p className="text-ink/50">Yükleniyor...</p>;

  const hasBusinesses = categoryData.length > 0;

  if (!hasBusinesses) {
    return (
      <div className="rounded-2xl border border-line bg-white p-10 text-center text-ink/60">
        Henüz grafik gösterecek kadar veri yok.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="card-shadow rounded-2xl border border-line bg-white p-5">
        <div className="mb-4 flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-bordo" />
          <h3 className="font-display text-base font-bold text-navy">Son 6 Ay Gelir</h3>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={revenueData} margin={{ left: -10 }}>
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Bar dataKey="total" fill="#14213D" radius={[4, 4, 0, 0]} />
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
              <YAxis
                type="category"
                dataKey="name"
                width={110}
                tick={{ fontSize: 11 }}
              />
              <Tooltip />
              <Bar dataKey="count" fill="#7A1F2E" radius={[0, 4, 4, 0]} />
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
            <Eye className="h-4 w-4 text-bordo" />
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
                    <span className="font-mono text-xs text-ink/40">{i + 1}.</span>
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