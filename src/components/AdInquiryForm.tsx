"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Send } from "lucide-react";
import { AD_PLACEMENTS, formatAdPrice, type AdPlacementKey } from "@/lib/adPlacements";

export default function AdInquiryForm({ prices }: { prices?: Record<AdPlacementKey, number> }) {
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [placement, setPlacement] = useState<AdPlacementKey | "">("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!businessName.trim() || !contactName.trim() || !phone.trim()) return;
    if (honeypot.trim() !== "") return;

    setSending(true);
    setError(null);

    const { error: insertError } = await supabase.from("ad_inquiries").insert({
      business_name: businessName.trim(),
      contact_name: contactName.trim(),
      phone: phone.trim(),
      email: email.trim() || null,
      placement: placement || null,
      message: message.trim() || null,
    });

    setSending(false);

    if (insertError) {
      setError("Gönderilemedi, lütfen tekrar dene veya WhatsApp'tan yazın.");
      return;
    }

    setSent(true);
  }

  return (
    <div className="card-shadow rounded-2xl bg-white p-6 sm:p-8">
      <h2 className="mb-1 font-display text-lg font-bold text-navy">Reklam Teklifi Alın</h2>
      <p className="mb-5 text-sm text-ink/50">
        Bilgilerinizi bırakın, size uygun yerleşim ve fiyat için en kısa sürede dönüş yapalım.
      </p>

      {sent ? (
        <p className="text-sm text-ink/70">
          Talebiniz alındı, en kısa sürede sizinle iletişime geçeceğiz.
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
          <input
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="İşletme / firma adı"
            className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-bordo"
          />
          <input
            required
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Yetkili adı"
            className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-bordo"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Telefon numarası"
              className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-bordo"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-posta (isteğe bağlı)"
              className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-bordo"
            />
          </div>
          <select
            value={placement}
            onChange={(e) => setPlacement(e.target.value as AdPlacementKey | "")}
            className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-bordo"
          >
            <option value="">İlgilendiğiniz yerleşim (isteğe bağlı)</option>
            {AD_PLACEMENTS.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label} — {formatAdPrice(prices?.[p.key] ?? p.priceMonthly)}/ay
              </option>
            ))}
          </select>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Eklemek istediğiniz bir not (isteğe bağlı)"
            className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-bordo"
          />
          {error && <p className="text-xs text-bordo">{error}</p>}
          <button
            type="submit"
            disabled={sending}
            className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-bordo px-4 py-3 text-sm font-bold text-white transition hover:bg-bordo-dark disabled:opacity-60"
          >
            {sending ? "Gönderiliyor..." : "Teklif İste"} <Send className="h-4 w-4" />
          </button>
        </form>
      )}
    </div>
  );
}
