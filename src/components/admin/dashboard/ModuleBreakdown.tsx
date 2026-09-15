"use client";

import type { ModuleKey } from "./moduleStats";

export interface ModuleCardData {
  key: ModuleKey;
  label: string;
  icon: React.ElementType;
  gradient: string;
  total: number;
  breakdown: { label: string; value: number }[];
}

export default function ModuleBreakdown({ modules }: { modules: ModuleCardData[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {modules.map((m) => {
        const Icon = m.icon;
        return (
          <div key={m.key} className="card-shadow flex flex-col gap-3 rounded-2xl bg-white p-4">
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-white ${m.gradient}`}>
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <p className="font-display text-xl font-bold text-navy">{m.total}</p>
              <p className="text-xs font-semibold text-ink/50">{m.label}</p>
            </div>
            {m.breakdown.length > 0 && (
              <div className="flex flex-col gap-1 border-t border-line pt-2 text-[11px] text-ink/50">
                {m.breakdown.map((b) => (
                  <div key={b.label} className="flex items-center justify-between gap-2">
                    <span className="truncate">{b.label}</span>
                    <span className="shrink-0 font-bold text-ink/70">{b.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
