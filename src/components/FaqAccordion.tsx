"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { BusinessFaq } from "@/lib/types";

export default function FaqAccordion({ faqs }: { faqs: BusinessFaq[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (faqs.length === 0) return null;

  return (
    <div className="card-shadow rounded-2xl border border-line bg-white p-6">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-ink/40">
        Sıkça Sorulan Sorular
      </h2>
      <div className="flex flex-col divide-y divide-line">
        {faqs.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div key={faq.id} className="py-2.5 first:pt-0 last:pb-0">
              <button
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="flex w-full items-center justify-between gap-3 text-left text-sm font-semibold text-navy"
              >
                {faq.question}
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-ink/40 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{faq.answer}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}