"use client";

import { DAY_LABELS, type OpeningHours, type DayHours } from "@/lib/types";

export default function OpeningHoursEditor({
  value,
  onChange,
}: {
  value: OpeningHours;
  onChange: (next: OpeningHours) => void;
}) {
  function updateDay(day: keyof OpeningHours, patch: Partial<DayHours>) {
    onChange({ ...value, [day]: { ...value[day], ...patch } });
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-line p-3">
      {(Object.keys(DAY_LABELS) as (keyof OpeningHours)[]).map((day) => (
        <div key={day} className="flex items-center gap-2 text-sm">
          <span className="w-24 shrink-0 font-medium text-navy">{DAY_LABELS[day]}</span>
          <label className="flex items-center gap-1.5 text-xs text-ink/60">
            <input
              type="checkbox"
              checked={!value[day].closed}
              onChange={(e) => updateDay(day, { closed: !e.target.checked })}
            />
            Açık
          </label>
          {!value[day].closed && (
            <>
              <input
                type="time"
                value={value[day].open}
                onChange={(e) => updateDay(day, { open: e.target.value })}
                className="rounded border border-line px-1.5 py-1 text-xs"
              />
              <span className="text-ink/40">–</span>
              <input
                type="time"
                value={value[day].close}
                onChange={(e) => updateDay(day, { close: e.target.value })}
                className="rounded border border-line px-1.5 py-1 text-xs"
              />
            </>
          )}
        </div>
      ))}
    </div>
  );
}