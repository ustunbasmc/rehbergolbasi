"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Flag, X } from "lucide-react";

export default function ReportButton({ businessId }: { businessId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) return;

    setSending(true);
    setError(null);

    const { error: insertError } = await supabase.from("listing_reports").insert({
      business_id: businessId,
      reason: reason.trim(),
    });

    setSending(false);

    if (insertError) {
      setError("Gönderilemedi, lütfen tekrar dene.");
      return;
    }

    setSent(true);
  }

  function handleClose() {
    setOpen(false);
    setTimeout(() => {
      setSent(false);
      setReason("");
      setError(null);
    }, 200);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 rounded-md px-1 py-2 text-xs font-medium text-ink/40 hover:text-bordo"
      >
        <Flag className="h-3 w-3" /> Bilgi yanlış mı? Bildir
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-dark/50 px-4"
          onClick={handleClose}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-navy">Bildir</h3>
              <button onClick={handleClose} className="text-ink/40 hover:text-ink">
                <X className="h-4 w-4" />
              </button>
            </div>

            {sent ? (
              <p className="text-sm text-ink/70">
                Teşekkürler, bildirimin bize ulaştı. En kısa sürede kontrol edeceğiz.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <p className="text-xs text-ink/50">
                  Bu işletmeyle ilgili yanlış/güncel olmayan bir bilgi mi fark ettin? Kısaca
                  anlat.
                </p>
                <textarea
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Örn. telefon numarası değişmiş, işletme kapanmış vb."
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
                />
                {error && <p className="text-xs text-bordo">{error}</p>}
                <button
                  type="submit"
                  disabled={sending}
                  className="rounded-lg bg-bordo px-4 py-2 text-sm font-bold text-white hover:bg-bordo-dark disabled:opacity-60"
                >
                  {sending ? "Gönderiliyor..." : "Gönder"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}