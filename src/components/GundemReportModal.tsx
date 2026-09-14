"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { trackGundemEvent } from "@/lib/analytics";
import { GUNDEM_REPORT_REASON_LABELS, type GundemReportReason } from "@/lib/types";

const REASONS = Object.entries(GUNDEM_REPORT_REASON_LABELS) as [GundemReportReason, string][];

export default function GundemReportModal({
  postId,
  postSlug,
  postTitle,
  onClose,
}: {
  postId: string;
  postSlug: string;
  postTitle: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState<GundemReportReason | null>(null);
  const [detail, setDetail] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason) return;
    if (honeypot.trim() !== "") return;

    setSending(true);
    setError(null);

    const { error: insertError } = await supabase.from("gundem_reports").insert({
      post_id: postId,
      reason,
      detail: detail.trim() || null,
      contact_info: contactInfo.trim() || null,
    });

    setSending(false);

    if (insertError) {
      setError(
        insertError.message?.includes("RATE_LIMITED")
          ? "Bu haber için kısa süre önce bir bildirim gönderildi. Lütfen daha sonra tekrar deneyin."
          : "Gönderilemedi, lütfen tekrar deneyin."
      );
      return;
    }

    trackGundemEvent("news_correction_report", { postSlug });
    setSent(true);
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-navy-dark/50 sm:items-center sm:px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-t-2xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-navy">{postTitle} — Bilgi Bildir</h3>
          <button onClick={onClose} aria-label="Kapat" className="flex h-8 w-8 items-center justify-center text-ink/40 hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>

        {sent ? (
          <p className="py-2 text-sm text-ink/70">
            Teşekkürler, bildirimin bize ulaştı. Ekibimiz en kısa sürede kontrol edecek.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              className="absolute left-[-9999px] h-0 w-0 opacity-0"
              aria-hidden="true"
            />

            <fieldset>
              <legend className="mb-2 text-xs font-semibold text-ink/50">Ne yanlış?</legend>
              <div className="flex flex-col gap-1.5">
                {REASONS.map(([value, label]) => (
                  <label
                    key={value}
                    className={`flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition ${
                      reason === value ? "border-bordo bg-bordo/5 text-bordo" : "border-line text-navy hover:border-bordo/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="gundem-report-reason"
                      value={value}
                      checked={reason === value}
                      onChange={() => setReason(value)}
                      className="h-4 w-4 accent-bordo"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value.slice(0, 300))}
              rows={2}
              placeholder="Eklemek istediğin bir detay var mı? (isteğe bağlı)"
              className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
            />

            <input
              type="text"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value.slice(0, 200))}
              placeholder="İletişim bilgisi (isteğe bağlı)"
              className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
            />

            {error && <p className="text-xs font-medium text-bordo">{error}</p>}

            <button
              type="submit"
              disabled={!reason || sending}
              className="flex min-h-11 items-center justify-center rounded-xl bg-bordo px-4 py-2.5 text-sm font-bold text-white hover:bg-bordo-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? "Gönderiliyor..." : "Bildirimi Gönder"}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
