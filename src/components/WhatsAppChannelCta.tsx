import { MessageCircle, ArrowRight } from "lucide-react";
import { WHATSAPP_CHANNEL_URL } from "@/lib/constants";

/**
 * "RehberGölbaşı Gündem" WhatsApp Kanalı'na katılım bağlantısı.
 * `pill`: gündem listesi başlığının altında kompakt buton, `banner`: haber
 * sonunda dikkat çekici kart.
 */
export default function WhatsAppChannelCta({ variant = "banner" }: { variant?: "pill" | "banner" }) {
  if (variant === "pill") {
    return (
      <a
        href={WHATSAPP_CHANNEL_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:brightness-95 active:scale-[0.98]"
      >
        <MessageCircle className="h-4 w-4" /> WhatsApp Kanalımıza Katıl
      </a>
    );
  }

  return (
    <a
      href={WHATSAPP_CHANNEL_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="card-shadow card-shadow-hover mt-8 flex items-center gap-3 rounded-2xl bg-green-50 p-4 transition"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
        <MessageCircle className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-sm font-bold text-navy">Gölbaşı haberleri WhatsApp&apos;ına gelsin</span>
        <span className="block text-xs text-ink/60">RehberGölbaşı Gündem kanalına katıl, yeni haberleri ilk sen öğren.</span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-green-700" />
    </a>
  );
}
