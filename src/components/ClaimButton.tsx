"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { UserCheck, X } from "lucide-react";

export default function ClaimButton({ businessId }: { businessId: string }) {
  const [open, setOpen] = useState(false);
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contact.trim()) return;

    setSending(true);
    setError(null);

    const { error: insertError } = await supabase.from("listing_reports").insert({
      business_id: businessId,
      type: "claim",
      contact_info: contact.trim(),
      reason: message.trim() || "İşletme sahipliği talebi",
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
      setContact("");
      setMessage("");
      setError(null);
    }, 200);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 rounded-md px-1 py-2 text-xs font-medium text-ink/40 hover:text-bordo"
      >
        <UserCheck className="h-3 w-3" /> Bu işletme benim, güncellemek istiyorum
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
              <h3 className="font-display text-base font-bold text-navy">
                İşletmeni Sahiplen
              </h3>
              <button onClick={handleClose} className="text-ink/40 hover:text-ink">
                <X className="h-4 w-4" />
              </button>
            </div>

            {sent ? (
              <p className="text-sm text-ink/70">
                Talebin bize ulaştı. Doğrulama için seninle en kısa sürede iletişime
                geçeceğiz.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <p className="text-xs text-ink/50">
                  Bu işletmenin sahibiysen, iletişim bilgini bırak — seni arayıp
                  doğrulayalım ve bilgileri güncelleme yetkisi verelim.
                </p>
                <input
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Telefon veya e-posta"
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
                />
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={2}
                  placeholder="Eklemek istediğin bir not (isteğe bağlı)"
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
                />
                {error && <p className="text-xs text-bordo">{error}</p>}
                <button
                  type="submit"
                  disabled={sending}
                  className="rounded-lg bg-bordo px-4 py-2 text-sm font-bold text-white hover:bg-bordo-dark disabled:opacity-60"
                >
                  {sending ? "Gönderiliyor..." : "Talebi Gönder"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}