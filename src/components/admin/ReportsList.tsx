"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Trash2, Flag, UserCheck } from "lucide-react";

interface Report {
  id: string;
  reason: string;
  type: string;
  contact_info: string | null;
  created_at: string;
  business_id: string;
  business: { name: string; slug: string } | null;
}

export default function ReportsList() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("listing_reports")
      .select("*, business:businesses(name, slug)")
      .order("created_at", { ascending: false });
    setReports((data as unknown as Report[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  async function handleDismiss(id: string) {
    setActingId(id);
    await supabase.from("listing_reports").delete().eq("id", id);
    setActingId(null);
    loadReports();
  }

  if (loading) return <p className="text-ink/50">Yükleniyor...</p>;

  if (reports.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-white p-10 text-center text-ink/60">
        Bekleyen bildirim yok.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {reports.map((report) => {
        const isClaim = report.type === "claim";
        return (
          <div
            key={report.id}
            className="card-shadow rounded-xl border border-line bg-white p-4"
          >
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <div className="mb-0.5 flex items-center gap-2">
                  <span
                    className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isClaim ? "bg-gold/15 text-gold-dark" : "bg-bordo/10 text-bordo"
                    }`}
                  >
                    {isClaim ? (
                      <>
                        <UserCheck className="h-2.5 w-2.5" /> Sahiplenme Talebi
                      </>
                    ) : (
                      <>
                        <Flag className="h-2.5 w-2.5" /> Bildirim
                      </>
                    )}
                  </span>
                </div>
                {report.business ? (
                  <Link
                    href={`/isletme/${report.business.slug}`}
                    target="_blank"
                    className="font-display text-sm font-bold text-navy hover:text-bordo"
                  >
                    {report.business.name}
                  </Link>
                ) : (
                  <span className="text-sm font-bold text-ink/40">Silinmiş işletme</span>
                )}
                <p className="mt-0.5 font-mono text-[11px] text-ink/40">
                  {new Date(report.created_at).toLocaleString("tr-TR")}
                </p>
              </div>
              <button
                onClick={() => handleDismiss(report.id)}
                disabled={actingId === report.id}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ink/50 hover:bg-offwhite disabled:opacity-60"
              >
                <Trash2 className="h-3.5 w-3.5" /> Kapat
              </button>
            </div>
            <p className="text-sm text-ink/70">{report.reason}</p>
            {report.contact_info && (
              <p className="mt-1.5 text-xs font-semibold text-navy">
                İletişim: {report.contact_info}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}