"use client";

import { useState } from "react";
import { Clock, ChevronDown } from "lucide-react";
import { DAY_LABELS, type OpeningHours } from "@/lib/types";
import { getOpenStatus } from "@/lib/openingHours";

export default function WorkingHoursCard({ hours }: { hours: OpeningHours | null }) {
  const [expanded, setExpanded] = useState(false);
  const status = getOpenStatus(hours);

  if (!hours || !status) return null;

  return (
    <div className="card-shadow rounded-2xl border border-line bg-white p-5">
      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-ink/40">
        Çalışma Saatleri
      </p>

      <div className="mb-1 flex items-center gap-2">
        <span
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
            status.isOpen ? "bg-navy/10 text-navy" : "bg-bordo/10 text-bordo"
          }`}
        >
          <Clock className="h-3 w-3" />
          {status.isOpen ? "Şu an açık" : "Şu an kapalı"}
        </span>
        <span className="text-sm text-ink/60">{status.todayHours}</span>
      </div>

      <button
        onClick={() => setExpanded((v) => !v)}
        className="mt-2 flex items-center gap-1 text-xs font-semibold text-bordo hover:underline"
      >
        {expanded ? "Saatleri gizle" : "Tüm saatleri göster"}
        <ChevronDown className={`h-3.5 w-3.5 transition ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="mt-3 flex flex-col gap-1.5 border-t border-line pt-3">
          {(Object.keys(DAY_LABELS) as (keyof OpeningHours)[]).map((day) => (
            <div key={day} className="flex items-center justify-between text-xs">
              <span className="text-ink/60">{DAY_LABELS[day]}</span>
              <span className="font-medium text-navy">
                {hours[day].closed ? "Kapalı" : `${hours[day].open} - ${hours[day].close}`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}