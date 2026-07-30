"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export default function AccordionSection({
  title,
  subtitle,
  defaultOpen = false,
  children,
}: {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 bg-offwhite px-4 py-3.5 text-left"
      >
        <div>
          <p className="text-sm font-bold text-navy">{title}</p>
          {subtitle && <p className="text-xs text-ink/50">{subtitle}</p>}
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-ink/40 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && <div className="flex flex-col gap-4 p-4">{children}</div>}
    </div>
  );
}