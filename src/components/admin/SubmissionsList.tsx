"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { ApplicantType, BusinessSubmission, SubmissionStatus } from "@/lib/types";

type SubmissionRow = BusinessSubmission & { business: { slug: string; name: string } | null };
import { APPLICANT_TYPE_LABELS, SUBMISSION_STATUS_LABELS } from "@/lib/types";
import { AlertTriangle, Camera, ExternalLink } from "lucide-react";
import SubmissionDetailModal from "@/components/admin/SubmissionDetailModal";

const STATUS_COLORS: Record<SubmissionStatus, string> = {
  new: "bg-navy/10 text-navy",
  information_requested: "bg-gold/15 text-gold-dark",
  preparing: "bg-gold/15 text-gold-dark",
  pending_approval: "bg-bordo/10 text-bordo",
  published: "bg-green-100 text-green-700",
  rejected: "bg-ink/10 text-ink/50",
  duplicate: "bg-ink/10 text-ink/50",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

export default function SubmissionsList() {
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [photoCounts, setPhotoCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<ApplicantType | "all">("all");
  const [duplicateOnly, setDuplicateOnly] = useState(false);
  const [selected, setSelected] = useState<SubmissionRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("business_submissions")
      .select("*, business:businesses(slug, name)")
      .order("created_at", { ascending: false })
      .limit(200);

    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    if (typeFilter !== "all") query = query.eq("applicant_type", typeFilter);
    if (duplicateOnly) query = query.eq("possible_duplicate", true);
    if (search.trim()) {
      const term = search.trim();
      query = query.or(
        `business_name.ilike.%${term}%,contact_phone.ilike.%${term}%,reference_code.ilike.%${term}%`
      );
    }

    const { data } = await query;
    const rows = data ?? [];
    setSubmissions(rows);

    if (rows.length > 0) {
      const { data: photoRows } = await supabase
        .from("business_submission_photos")
        .select("submission_id")
        .in("submission_id", rows.map((r) => r.id));
      const counts: Record<string, number> = {};
      (photoRows ?? []).forEach((p) => {
        counts[p.submission_id] = (counts[p.submission_id] ?? 0) + 1;
      });
      setPhotoCounts(counts);
    } else {
      setPhotoCounts({});
    }

    setLoading(false);
  }, [statusFilter, typeFilter, duplicateOnly, search]);

  useEffect(() => {
    const timeout = setTimeout(load, 250);
    return () => clearTimeout(timeout);
  }, [load]);

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="İşletme adı, telefon veya referans kodu..."
          className="flex-1 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo sm:min-w-[220px]"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as SubmissionStatus | "all")}
          className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
        >
          <option value="all">Tüm durumlar</option>
          {(Object.keys(SUBMISSION_STATUS_LABELS) as SubmissionStatus[]).map((s) => (
            <option key={s} value={s}>{SUBMISSION_STATUS_LABELS[s]}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as ApplicantType | "all")}
          className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
        >
          <option value="all">Tüm başvuru türleri</option>
          {(Object.keys(APPLICANT_TYPE_LABELS) as ApplicantType[]).map((t) => (
            <option key={t} value={t}>{APPLICANT_TYPE_LABELS[t]}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setDuplicateOnly((v) => !v)}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
            duplicateOnly ? "border-gold bg-gold/10 text-gold-dark" : "border-line text-ink/60 hover:border-gold/40"
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5" /> Olası mükerrer
        </button>
      </div>

      {loading ? (
        <p className="text-ink/50">Yükleniyor...</p>
      ) : submissions.length === 0 ? (
        <div className="card-shadow rounded-2xl bg-offwhite p-10 text-center text-ink/60">
          Sonuç bulunamadı.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {submissions.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelected(s)}
              className="card-shadow card-shadow-hover flex flex-col gap-2 rounded-xl bg-white px-4 py-3 text-left transition sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-base font-bold text-navy">{s.business_name}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_COLORS[s.status]}`}>
                    {SUBMISSION_STATUS_LABELS[s.status]}
                  </span>
                  {s.possible_duplicate && (
                    <span className="flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold-dark">
                      <AlertTriangle className="h-2.5 w-2.5" /> Olası mükerrer
                    </span>
                  )}
                  {s.business && (
                    <a
                      href={`/isletme/${s.business.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-[10px] font-bold text-green-700 hover:underline"
                    >
                      <ExternalLink className="h-2.5 w-2.5" /> Yayında
                    </a>
                  )}
                </div>
                <p className="mt-1 font-mono text-xs text-ink/50">
                  {s.reference_code} · {APPLICANT_TYPE_LABELS[s.applicant_type]} · {s.applicant_name} ·{" "}
                  {s.contact_phone} · {formatDate(s.created_at)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {(photoCounts[s.id] ?? 0) > 0 && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-ink/50">
                    <Camera className="h-3.5 w-3.5" /> {photoCounts[s.id]}
                  </span>
                )}
                <span className="text-sm font-semibold text-bordo">Detay →</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <SubmissionDetailModal
          submission={selected}
          onClose={() => setSelected(null)}
          onUpdated={() => {
            load();
          }}
        />
      )}
    </div>
  );
}
