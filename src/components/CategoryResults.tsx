"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import BusinessCard from "@/components/BusinessCard";
import { getOpenStatus } from "@/lib/openingHours";
import type { Business } from "@/lib/types";
import { Clock } from "lucide-react";

export default function CategoryResults({ businesses }: { businesses: Business[] }) {
  const [openOnly, setOpenOnly] = useState(false);

  const filtered = useMemo(() => {
    if (!openOnly) return businesses;
    return businesses.filter((b) => {
      const status = getOpenStatus(b.opening_hours);
      return status?.isOpen;
    });
  }, [businesses, openOnly]);

  if (businesses.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-offwhite p-10 text-center text-ink/60">
        Bu kategoride henüz işletme eklenmedi.{" "}
        <Link href="/isletme-ekle" className="text-bordo underline">
          Bir işletme öner
        </Link>
        .
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-ink/60">
          {filtered.length} işletme {openOnly && "(şu an açık)"}
        </p>
        <button
          onClick={() => setOpenOnly((v) => !v)}
          className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
            openOnly
              ? "border-bordo bg-bordo/10 text-bordo"
              : "border-line text-ink/60 hover:border-bordo/40"
          }`}
        >
          <Clock className="h-3.5 w-3.5" /> Sadece şu an açık olanlar
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-line bg-offwhite p-10 text-center text-ink/60">
          Şu an açık olan işletme bulunamadı.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => (
            <BusinessCard key={b.id} business={b} />
          ))}
        </div>
      )}

      <p className="mt-4 text-xs text-ink/40">
        Aradığın işletmeyi göremiyor musun?{" "}
        <Link href="/isletme-ekle" className="font-semibold text-bordo hover:underline">
          Ekle
        </Link>
      </p>
    </div>
  );
}