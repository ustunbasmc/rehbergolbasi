"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import BusinessCard from "@/components/BusinessCard";
import { getOpenStatus } from "@/lib/openingHours";
import type { Business } from "@/lib/types";

export interface MahalleBusinessGroup {
  key: string;
  label: string;
  businesses: Business[];
  note?: string;
}

export default function MahalleBusinessGroups({
  groups,
  totalCount,
}: {
  groups: MahalleBusinessGroup[];
  totalCount: number;
}) {
  const [openOnly, setOpenOnly] = useState(false);

  const filteredGroups = useMemo(() => {
    if (!openOnly) return groups;
    return groups
      .map((g) => ({
        ...g,
        businesses: g.businesses.filter((b) => getOpenStatus(b.opening_hours)?.isOpen),
      }))
      .filter((g) => g.businesses.length > 0);
  }, [groups, openOnly]);

  if (totalCount === 0) {
    return (
      <div className="card-shadow rounded-2xl bg-offwhite p-10 text-center text-ink/60">
        Bu mahallede henüz işletme eklenmedi.{" "}
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
        <p className="text-sm text-ink/60">{totalCount} işletme</p>
        <button
          onClick={() => setOpenOnly((v) => !v)}
          className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
            openOnly ? "border-bordo bg-bordo/10 text-bordo" : "border-line text-ink/60 hover:border-bordo/40"
          }`}
        >
          <Clock className="h-3.5 w-3.5" /> Sadece şu an açık olanlar
        </button>
      </div>

      {filteredGroups.length === 0 ? (
        <div className="card-shadow rounded-2xl bg-offwhite p-10 text-center text-ink/60">
          Şu an açık olan işletme bulunamadı.
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {filteredGroups.map((group) => (
            <div key={group.key}>
              <h3 className="mb-3 font-display text-base font-bold text-navy">
                {group.label} <span className="text-sm font-normal text-ink/40">({group.businesses.length})</span>
              </h3>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {group.businesses.map((b) => (
                  <BusinessCard key={b.id} business={b} />
                ))}
              </div>
              {group.note && <p className="mt-3 text-xs text-ink/50">{group.note}</p>}
            </div>
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-ink/40">
        Aradığın işletmeyi göremiyor musun?{" "}
        <Link href="/isletme-ekle" className="font-semibold text-bordo hover:underline">
          Ekle
        </Link>
      </p>
    </div>
  );
}
