"use client";

import { Users, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip } from "recharts";

// "2007'den", "2013'ten" gibi - yılın Türkçe okunuşuna göre 2 yönlü ünlü uyumu +
// ünsüz sertleşmesi gerektirir. Sadece 2007-2025 arası kullanıldığından elle
// doğrulanmış sabit bir tablo yeterli.
const YEAR_ABLATIVE_SUFFIX: Record<number, string> = {
  2007: "'den", 2008: "'den", 2009: "'dan", 2010: "'dan", 2011: "'den", 2012: "'den",
  2013: "'ten", 2014: "'ten", 2015: "'ten", 2016: "'dan", 2017: "'den", 2018: "'den",
  2019: "'dan", 2020: "'den", 2021: "'den", 2022: "'den", 2023: "'ten", 2024: "'ten", 2025: "'ten",
};

export default function PopulationTrendCard({
  population,
  populationYear,
  history,
}: {
  population: number;
  populationYear: number;
  history: { year: number; count: number }[];
}) {
  const first = history[0];
  const growthPct = first ? Math.round(((population - first.count) / first.count) * 100) : null;
  const sinceSuffix = first ? YEAR_ABLATIVE_SUFFIX[first.year] ?? "'den" : "";

  return (
    <div className="card-shadow rounded-2xl bg-white p-6">
      <h2 className="mb-1 text-xs font-bold uppercase tracking-wide text-ink/40">Nüfus (TÜİK ADNKS {populationYear})</h2>
      <p className="flex items-center gap-1.5 font-display text-2xl font-bold text-navy">
        <Users className="h-5 w-5 text-bordo" /> {population.toLocaleString("tr-TR")}
      </p>
      {growthPct !== null && first && growthPct !== 0 && (
        <p className={`mt-1 flex items-center gap-1 text-xs font-semibold ${growthPct > 0 ? "text-green-700" : "text-bordo"}`}>
          <TrendingUp className={`h-3.5 w-3.5 ${growthPct < 0 ? "rotate-180" : ""}`} />
          {`${first.year}${sinceSuffix} bu yana %${Math.abs(growthPct)} ${growthPct > 0 ? "artış" : "azalış"}`}
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
