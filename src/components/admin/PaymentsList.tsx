"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Wallet, Calendar } from "lucide-react";

interface PaymentRow {
  id: string;
  business_id: string;
  amount: number;
  period_start: string;
  period_end: string;
  status: string;
  paid_at: string | null;
  notes: string | null;
  business: { name: string; slug: string } | null;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(amount);
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function PaymentsList() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("payments")
      .select("*, business:businesses(name, slug)")
      .order("paid_at", { ascending: false, nullsFirst: false })
      .limit(100);
    setPayments((data as unknown as PaymentRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const { monthTotal, allTimeTotal } = useMemo(() => {
    const now = new Date();
    let monthTotal = 0;
    let allTimeTotal = 0;
    payments.forEach((p) => {
      allTimeTotal += p.amount ?? 0;
      if (!p.paid_at) return;
      const d = new Date(p.paid_at);
      if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) {
        monthTotal += p.amount ?? 0;
      }
    });
    return { monthTotal, allTimeTotal };
  }, [payments]);

  if (loading) return <p className="text-ink/50">Yükleniyor...</p>;

  return (
    <div>
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="card-shadow flex items-center gap-3 rounded-2xl border border-line bg-white p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy/5 text-navy">
            <Wallet className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold text-ink/50">Bu ay toplam tahsilat</p>
            <p className="font-display text-2xl font-bold text-navy">{formatCurrency(monthTotal)}</p>
          </div>
        </div>
        <div className="card-shadow flex items-center gap-3 rounded-2xl border border-line bg-white p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-gold-dark">
            <Wallet className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold text-ink/50">Toplam (tüm zamanlar)</p>
            <p className="font-display text-2xl font-bold text-navy">{formatCurrency(allTimeTotal)}</p>
          </div>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="rounded-2xl border border-line bg-offwhite p-10 text-center text-ink/60">
          Henüz kayıtlı ödeme yok.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {payments.map((p) => (
            <div
              key={p.id}
              className="card-shadow flex flex-col gap-2 rounded-xl border border-line bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                {p.business ? (
                  <Link
                    href={`/isletme/${p.business.slug}`}
                    target="_blank"
                    className="font-display text-sm font-bold text-navy hover:underline"
                  >
                    {p.business.name}
                  </Link>
                ) : (
                  <span className="text-sm text-ink/40">Silinmiş işletme</span>
                )}
                <p className="mt-0.5 flex items-center gap-1 text-xs text-ink/50">
                  <Calendar className="h-3 w-3" />
                  Ödeme tarihi: {formatDateTime(p.paid_at)}
                </p>
                <p className="text-xs text-ink/50">
                  Kapsadığı dönem: {formatShortDate(p.period_start)} – {formatShortDate(p.period_end)}
                </p>
                {p.notes && <p className="mt-1 text-xs text-ink/60">Not: {p.notes}</p>}
              </div>
              <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                <span className="font-display text-base font-bold text-navy">
                  {formatCurrency(p.amount)}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    p.status === "paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-offwhite text-ink/50"
                  }`}
                >
                  {p.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}