"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { AtSign, MapPin, Mail, Send } from "lucide-react";

export default function IletisimPage() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !contact.trim() || !message.trim()) return;
    if (honeypot.trim() !== "") return;

    setSending(true);
    setError(null);

    const { error: insertError } = await supabase.from("site_messages").insert({
      name: name.trim(),
      contact: contact.trim(),
      message: message.trim(),
    });

    setSending(false);

    if (insertError) {
      setError("Gönderilemedi, lütfen tekrar dene.");
      return;
    }

    setSent(true);
    setName("");
    setContact("");
    setMessage("");
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
      <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-bordo/10 px-3 py-1.5 text-xs font-semibold text-bordo">
        <Mail className="h-3.5 w-3.5" /> İletişim
      </span>
      <h1 className="mb-3 font-display text-3xl font-bold leading-tight tracking-tight text-navy sm:text-4xl">
        Bize ulaş
      </h1>
      <p className="mb-10 max-w-xl text-base leading-relaxed text-ink/70">
        Bir sorunuz mu var, işletmenle ilgili bir talebin mi, yoksa bize bir öneri mi
        iletmek istiyorsun? Aşağıdaki formu doldur, en kısa sürede dönüş yapalım.
      </p>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="card-shadow flex-1 rounded-2xl border border-line bg-white p-6 sm:p-8">
          {sent ? (
            <div className="py-8 text-center">
              <p className="font-display text-lg font-bold text-navy">Teşekkürler!</p>
              <p className="mt-1 text-sm text-ink/60">
                Mesajın bize ulaştı, en kısa sürede dönüş yapacağız.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="absolute left-[-9999px] h-0 w-0 opacity-0"
                aria-hidden="true"
              />
              <div>
                <label className="mb-1 block text-sm font-semibold text-navy">Adın</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-navy">
                  Telefon veya e-posta
                </label>
                <input
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
                  placeholder="Sana nasıl ulaşalım?"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-navy">Mesajın</label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
                />
              </div>
              {error && <p className="text-sm text-bordo">{error}</p>}
              <button
                type="submit"
                disabled={sending}
                className="flex items-center justify-center gap-2 rounded-lg bg-bordo px-5 py-3 text-sm font-bold text-white hover:bg-bordo-dark disabled:opacity-60"
              >
                <Send className="h-4 w-4" /> {sending ? "Gönderiliyor..." : "Gönder"}
              </button>
            </form>
          )}
        </div>

        <div className="flex flex-col gap-4 lg:w-72">
          <div className="card-shadow rounded-2xl border border-line bg-white p-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-ink/40">
              İletişim Bilgileri
            </p>
            <p className="flex items-center gap-2 text-sm text-ink/70">
              <MapPin className="h-4 w-4 shrink-0 text-ink/40" /> Gölbaşı, Ankara
            </p>
            <a
              href="https://instagram.com/rehbergolbasi"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2.5 flex items-center gap-2 text-sm text-ink/70 transition-colors hover:text-bordo"
            >
              <AtSign className="h-4 w-4 shrink-0 text-ink/40" /> rehbergolbasi
            </a>
          </div>

          <div className="rounded-2xl border border-line bg-offwhite p-5">
            <p className="text-sm font-semibold text-navy">İşletmeni mi eklemek istiyorsun?</p>
            <p className="mt-1 text-xs leading-relaxed text-ink/60">
              Bu form genel sorular içindir. İşletme eklemek için{" "}
              <a href="/isletme-ekle" className="font-semibold text-bordo hover:underline">
                başvuru sayfasını
              </a>{" "}
              kullan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}