"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Wallet } from "lucide-react";

interface PaymentRow {
  id: string;
  business_id: string;
  amount: number | null;
  note: string | null;
  paid_at: string;
  business: { name: string; slug: string } | null;
}

function formatCurrency(amount: number | null) {
  if (amount === null) return "—";
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(amount);
}

export default function PaymentsList() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("payments")
      .select("*, business:businesses(name, slug)")
      .order("paid_at", { ascending: false })
      .limit(100);
    setPayments((data as unknown as PaymentRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const monthTotal = useMemo(() => {
    const now = new Date();
    return payments
      .filter((p) => {
        const d = new Date(p.paid_at);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      })
      .reduce((sum, p) => sum + (p.amount ?? 0), 0);
  }, [payments]);

  if (loading) return <p className="text-ink/50">Yükleniyor...</p>;

  return (
    <div>
      <div className="card-shadow mb-5 flex items-center gap-3 rounded-2xl border border-line bg-white p-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy/5 text-navy">
          <Wallet className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-semibold text-ink/50">Bu ay toplam tahsilat</p>
          <p className="font-display text-2xl font-bold text-navy">{formatCurrency(monthTotal)}</p>
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
              className="card-shadow flex items-center justify-between gap-3 rounded-xl border border-line bg-white p-4"
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
                <p className="text-xs text-ink/50">
                  {new Date(p.paid_at).toLocaleDateString("tr-TR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  {p.note && ` · ${p.note}`}
                </p>
              </div>
              <span className="font-display text-sm font-bold text-navy">
                {formatCurrency(p.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}