"use client";

import { useState } from "react";
import { MessageCircle, Send, User, Building2 } from "lucide-react";

function formatDate(iso: string | null) {
  if (!iso) return "belirtilmemiş";
  return new Date(iso).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" });
}

interface Props {
  businessName: string;
  whatsapp: string | null;
  ownerPhone: string | null;
  freeUntil: string | null;
  paidUntil: string | null;
}

export default function WhatsAppNotifier({
  businessName,
  whatsapp,
  ownerPhone,
  freeUntil,
  paidUntil,
}: Props) {
  const expiryDate = paidUntil ?? freeUntil;

  const targetNumber = ownerPhone || whatsapp;
  const usingOwnerPhone = !!ownerPhone;

  const templates: Record<string, string> = {
    hosgeldin: `Merhaba ${businessName} ekibi! 🎉\n\nİşletmeniz RehberGölbaşı'nda onaylandı ve yayına alındı. İlk ayınız tamamen ücretsiz.\n\nSayfanızı kontrol etmek ister misiniz? Herhangi bir düzeltme/ekleme talebiniz olursa bize yazmanız yeterli.`,
    "10_gun": `Merhaba ${businessName} ekibi,\n\nRehberGölbaşı'ndaki listelenme süreniz ${formatDate(expiryDate)} tarihinde sona eriyor (10 gün kaldı). Yayında kalmaya devam etmek isterseniz ödeme bilgilerini iletebiliriz.`,
    "3_gun": `Merhaba ${businessName} ekibi,\n\nHatırlatmak isteriz: RehberGölbaşı'ndaki listelenme süreniz ${formatDate(expiryDate)} tarihinde sona eriyor (3 gün kaldı). Ödeme yapmak için bize dönüş yapabilirsiniz.`,
    son_gun: `Merhaba ${businessName} ekibi,\n\nRehberGölbaşı'ndaki listelenme süreniz bugün (${formatDate(expiryDate)}) sona eriyor. Ödeme yapılmazsa 7 gün içinde sayfanız geçici olarak pasife alınacak. Yayında kalmak için hemen dönüş yapabilirsiniz.`,
    pasif: `Merhaba ${businessName} ekibi,\n\nÖdeme alınamadığı için RehberGölbaşı'ndaki sayfanız geçici olarak pasife alındı. Yeniden yayına almak isterseniz bize ulaşmanız yeterli.`,
    serbest: "",
  };

  const [templateKey, setTemplateKey] = useState("hosgeldin");
  const [message, setMessage] = useState(templates.hosgeldin);

  function handleTemplateChange(key: string) {
    setTemplateKey(key);
    setMessage(templates[key]);
  }

  const waLink = targetNumber
    ? `https://wa.me/${targetNumber.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`
    : null;

  return (
    <div className="rounded-lg border border-line bg-offwhite p-3">
      <div className="mb-2 flex items-center gap-1.5">
        <MessageCircle className="h-3.5 w-3.5 text-navy" />
        <p className="text-xs font-bold uppercase tracking-wide text-navy">
          WhatsApp Bildirimi Gönder
        </p>
      </div>

      {!targetNumber ? (
        <p className="text-xs text-ink/50">
          Bu işletme için ne sahiplik telefonu ne de WhatsApp numarası kayıtlı.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs text-ink/60">
            {usingOwnerPhone ? (
              <>
                <User className="h-3.5 w-3.5 text-bordo" />
                Sahiplik telefonuna gönderilecek: <span className="font-semibold text-navy">{targetNumber}</span>
              </>
            ) : (
              <>
                <Building2 className="h-3.5 w-3.5 text-navy" />
                İşletme WhatsApp hattına gönderilecek: <span className="font-semibold text-navy">{targetNumber}</span>
              </>
            )}
          </div>

          <select
            value={templateKey}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="w-full rounded-lg border border-line bg-white px-3 py-1.5 text-xs outline-none focus:border-bordo"
          >
            <option value="hosgeldin">Hoş Geldin</option>
            <option value="10_gun">Hatırlatma — 10 gün kaldı</option>
            <option value="3_gun">Hatırlatma — 3 gün kaldı</option>
            <option value="son_gun">Hatırlatma — Son gün</option>
            <option value="pasif">Pasife Alındı Bilgisi</option>
            <option value="serbest">Serbest Mesaj</option>
          </select>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-xs outline-none focus:border-bordo"
            placeholder="Mesaj metni..."
          />

          <a
            href={waLink ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-white ${
              message.trim()
                ? "bg-[#25D366] hover:opacity-90"
                : "pointer-events-none bg-ink/20"
            }`}
          >
            <Send className="h-3.5 w-3.5" /> WhatsApp'ta Aç ve Gönder
          </a>
          <p className="text-[11px] text-ink/40">
            WhatsApp açılır, mesaj hazır gelir — göndermek için WhatsApp içindeki gönder
            butonuna basman yeterli.
          </p>
        </div>
      )}
    </div>
  );
}