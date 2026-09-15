"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

export default function KpiCard({
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
    <div className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg" style={{ background: gradient }}>
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
              {trend.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
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
