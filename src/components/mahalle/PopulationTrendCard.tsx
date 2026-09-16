"use client";

import { Users, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip } from "recharts";

export default function PopulationTrendCard({
  population2023,
  history,
}: {
  population2023: number;
  history: { year: number; count: number }[];
}) {
  const first = history[0];
  const growthPct = first ? Math.round(((population2023 - first.count) / first.count) * 100) : null;

  return (
    <div className="card-shadow rounded-2xl bg-white p-6">
      <h2 className="mb-1 text-xs font-bold uppercase tracking-wide text-ink/40">Nüfus (TÜİK ADNKS)</h2>
      <p className="flex items-center gap-1.5 font-display text-2xl font-bold text-navy">
        <Users className="h-5 w-5 text-bordo" /> {population2023.toLocaleString("tr-TR")}
      </p>
      {growthPct !== null && first && (
        <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-green-700">
          <TrendingUp className="h-3.5 w-3.5" /> {`${first.year}'den bu yana %${growthPct} artış`}
        </p>
      )}
      {history.length > 1 && (
        <div className="-mx-2 mt-3 h-20">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="popGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7A1F2E" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#7A1F2E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="year" tick={{ fontSize: 9 }} interval={3} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value) => [Number(value).toLocaleString("tr-TR"), "Nüfus"]}
                labelFormatter={(label) => `${label}`}
              />
              <Area type="monotone" dataKey="count" stroke="#7A1F2E" strokeWidth={2} fill="url(#popGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      <p className="mt-2 border-t border-line pt-2 text-[11px] text-ink/40">
        Kaynak: TÜİK Adrese Dayalı Nüfus Kayıt Sistemi
      </p>
    </div>
  );
}
