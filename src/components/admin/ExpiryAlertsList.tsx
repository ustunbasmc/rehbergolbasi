"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { AlertTriangle, Clock, XCircle, Trash2 } from "lucide-react";

interface AlertRow {
  id: string;
  alert_type: "10_gun" | "3_gun" | "son_gun" | "pasife_alindi";
  created_at: string;
  business_id: string;
  business: {
    name: string;
    slug: string;
    free_until: string | null;
    paid_until: string | null;
    is_active: boolean;
  } | null;
}

const ALERT_LABELS: Record<AlertRow["alert_type"], { label: string; color: string; icon: typeof Clock }> = {
  "10_gun": { label: "10 gün kaldı", color: "text-ink/60", icon: Clock },
  "3_gun": { label: "3 gün kaldı", color: "text-gold-dark", icon: Clock },
  son_gun: { label: "Son gün", color: "text-bordo", icon: AlertTriangle },
  pasife_alindi: { label: "Pasife alındı", color: "text-white", icon: XCircle },
};

export default function ExpiryAlertsList() {
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("expiry_alerts")
      .select("*, business:businesses(name, slug, free_until, paid_until, is_active)")
      .order("created_at", { ascending: false })
      .limit(50);
    setAlerts((data as unknown as AlertRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  async function handleDismiss(id: string) {
    await supabase.from("expiry_alerts").delete().eq("id", id);
    loadAlerts();
  }

  if (loading) return <p className="text-ink/50">Yükleniyor...</p>;

  if (alerts.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-offwhite p-10 text-center text-ink/60">
        Bekleyen süre uyarısı yok.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {alerts.map((a) => {
        const meta = ALERT_LABELS[a.alert_type];
        const Icon = meta.icon;
        const isDeactivated = a.alert_type === "pasife_alindi";
        return (
          <div
            key={a.id}
            className={`card-shadow flex items-center justify-between gap-3 rounded-xl border border-line p-4 ${
              isDeactivated ? "bg-navy" : "bg-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full ${
                  isDeactivated ? "bg-white/10" : "bg-offwhite"
                } ${meta.color}`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div>
                {a.business ? (
                  <Link
                    href={`/isletme/${a.business.slug}`}
                    target="_blank"
                    className={`font-display text-sm font-bold hover:underline ${
                      isDeactivated ? "text-white" : "text-navy"
                    }`}
                  >
                    {a.business.name}
                  </Link>
                ) : (
                  <span className="text-sm text-ink/40">Silinmiş işletme</span>
                )}
                <p className={`text-xs font-semibold ${meta.color}`}>{meta.label}</p>
              </div>
            </div>
            <button
              onClick={() => handleDismiss(a.id)}
              className={`rounded-lg p-2 hover:bg-black/5 ${isDeactivated ? "text-white/60" : "text-ink/40"}`}
              aria-label="Uyarıyı kapat"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}