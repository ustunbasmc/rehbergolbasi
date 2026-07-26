"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronDown } from "lucide-react";

interface Heading {
  level: number;
  text: string;
  id: string;
}

export default function GuideTableOfContents({ headings }: { headings: Heading[] }) {
  const [open, setOpen] = useState(false);

  if (headings.length <= 2) return null;

  return (
    <div className="mb-10 rounded-2xl border border-line bg-offwhite overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 px-6 py-4 text-left transition hover:bg-offwhite/80"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-bordo" />
          <span className="text-sm font-bold text-navy">İçindekiler</span>
          <span className="rounded-full bg-bordo/10 px-2 py-0.5 text-xs font-semibold text-bordo">
            {headings.length} başlık
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink/40">
            {open ? "Gizle" : "Göster"}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-ink/40 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {open && (
        <div className="border-t border-line px-6 py-4">
          <ul className="flex flex-col gap-2">
            {headings.map((h) => (
              <li key={h.id} className={h.level === 3 ? "ml-5" : ""}>
                <Link
                  href={`#${h.id}`}
                  onClick={() => setOpen(false)}
                  className={`text-sm hover:underline ${
                    h.level === 2
                      ? "font-semibold text-navy"
                      : "text-bordo"
                  }`}
                >
                  {h.level === 2 ? "→ " : "· "}
                  {h.text}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}