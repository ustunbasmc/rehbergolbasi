"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { PhoneCall } from "lucide-react";

export default function ContactRequestForm({ businessId }: { businessId: string }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    if (honeypot.trim() !== "") return;

    setSending(true);
    setError(null);

    const { error: insertError } = await supabase.from("contact_requests").insert({
      business_id: businessId,
      name: name.trim(),
      phone: phone.trim(),
      message: message.trim() || null,
    });

    setSending(false);

    if (insertError) {
      setError("Gönderilemedi, lütfen tekrar dene.");
      return;
    }

    setSent(true);
  }

  return (
    <div className="card-shadow rounded-2xl border border-line bg-white p-6">
      <h2 className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink/40">
        <PhoneCall className="h-3.5 w-3.5" /> Sizi Arayalım
      </h2>

      {sent ? (
        <p className="text-sm text-ink/70">
          Talebin işletmeye iletildi, seninle en kısa sürede iletişime geçecekler.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
          <input
            type="text"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            className="absolute left-[-9999px] h-0 w-0 opacity-0"
            aria-hidden="true"
          />
          <p className="mb-1 text-xs text-ink/50">
            Bilgilerini bırak, işletme seni arasın.
          </p>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Adın"
            className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
          />
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Telefon numaran"
            className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            placeholder="Not (isteğe bağlı)"
            className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
          />
          {error && <p className="text-xs text-bordo">{error}</p>}
          <button
            type="submit"
            disabled={sending}
            className="rounded-lg bg-bordo px-4 py-2.5 text-sm font-bold text-white hover:bg-bordo-dark disabled:opacity-60"
          >
            {sending ? "Gönderiliyor..." : "Talep Gönder"}
          </button>
        </form>
      )}
    </div>
  );
}