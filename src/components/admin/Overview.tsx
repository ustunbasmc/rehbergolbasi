"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
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

const STATUS_COLORS: Record<string, string> = {
  Bekleyen: "#C9A24B",
  Onaylı: "#14213D",
  Reddedilen: "#7A1F2E",
};

export default function Overview() {
  const [categoryData, setCategoryData] = useState<CategoryCount[]>([]);
  const [statusData, setStatusData] = useState<StatusCount[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);

    const { data: businesses } = await supabase
      .from("businesses")
      .select("status, category:categories(name)");

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
  );
}