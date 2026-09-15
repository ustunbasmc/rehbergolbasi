"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { GUNDEM_REPORT_REASON_LABELS, GUNDEM_REPORT_STATUS_LABELS } from "@/lib/types";
import type { GundemReport, GundemReportStatus } from "@/lib/types";

type ReportRow = GundemReport & { post: { title: string; slug: string } | null };

export default function GundemReportsList() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<GundemReportStatus | "all">("all");

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("gundem_reports")
      .select("*, post:gundem_posts(title, slug)")
      .order("created_at", { ascending: false });
    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    const { data } = await query.limit(100);
    setReports((data ?? []) as ReportRow[]);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(report: ReportRow, status: GundemReportStatus) {
    await supabase
      .from("gundem_reports")
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq("id", report.id);
    load();
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-navy">Gündem Bildirimleri</h2>
          <p className="text-xs text-ink/50">Haberlerdeki &quot;Bilgi hatalı mı?&quot; bildirimleri</p>
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as GundemReportStatus | "all")} className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo">
          <option value="all">Tüm durumlar</option>
          {Object.entries(GUNDEM_REPORT_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-ink/40">Yükleniyor...</p>
      ) : reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line p-10 text-center text-sm text-ink/50">
          Bildirim yok.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((report) => (
            <div key={report.id} className="card-shadow rounded-2xl bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-navy">{report.post?.title ?? "Haber silinmiş"}</p>
                  <p className="text-xs text-ink/50">{GUNDEM_REPORT_REASON_LABELS[report.reason]} · {new Date(report.created_at).toLocaleString("tr-TR")}</p>
                </div>
                <select
                  value={report.status}
                  onChange={(e) => updateStatus(report, e.target.value as GundemReportStatus)}
                  className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-bordo"
                >
                  {Object.entries(GUNDEM_REPORT_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              {report.detail && <p className="mt-2 text-sm text-ink/70">{report.detail}</p>}
              {report.contact_info && <p className="mt-1 text-xs text-ink/40">İletişim: {report.contact_info}</p>}
              {report.post?.slug && (
                <a href={`/gundem/${report.post.slug}`} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs font-semibold text-bordo hover:underline">
                  Haberi görüntüle →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
