"use client";

import { useState } from "react";
import { MessageCircle, Send, User, Building2 } from "lucide-react";

function formatDate(iso: string | null) {
  if (!iso) return "belirtilmemiş";
  return new Date(iso).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" });
}

interface Props {
  businessName: string;
  slug: string;
  whatsapp: string | null;
  ownerPhone: string | null;
  freeUntil: string | null;
  paidUntil: string | null;
}

export default function WhatsAppNotifier({
  businessName,
  slug,
  whatsapp,
  ownerPhone,
  freeUntil,
  paidUntil,
}: Props) {
  const expiryDate = paidUntil ?? freeUntil;

  const targetNumber = ownerPhone || whatsapp;
  const usingOwnerPhone = !!ownerPhone;

  const profileUrl = `rehbergolbasi.com/isletme/${slug}`;
  const adUrl = "rehbergolbasi.com/reklam-ver";

  const templates: Record<string, string> = {
    hosgeldin: `Merhaba ${businessName} ekibi! 🎉\n\nİşletmeniz RehberGölbaşı'nda onaylandı ve yayına alındı:\n${profileUrl}\n\nTemel profiliniz ücretsiz ve süresizdir. Profilinizde bir eksik/güncelleme olursa (yeni fotoğraf, farklı hizmet, telefon değişikliği vb.) buradan yazmanız yeterli, hemen düzenleriz.\n\nBu arada, sitemizde taksi, gündem ve işletme sayfalarında hedefli reklam alanı kiralama imkanımız da var. İlgilenirseniz: ${adUrl}`,
    "10_gun": `Merhaba ${businessName} ekibi,\n\nProfiliniz: ${profileUrl}\n\nRehberGölbaşı Plus üyeliğiniz ${formatDate(expiryDate)} tarihinde sona eriyor (10 gün kaldı). Plus'a devam etmek isterseniz ödeme bilgilerini iletebiliriz.`,
    "3_gun": `Merhaba ${businessName} ekibi,\n\nHatırlatmak isteriz: RehberGölbaşı Plus üyeliğiniz ${formatDate(expiryDate)} tarihinde sona eriyor (3 gün kaldı). Ödeme yapmak için bize dönüş yapabilirsiniz.\n\nProfiliniz: ${profileUrl}`,
    son_gun: `Merhaba ${businessName} ekibi,\n\nRehberGölbaşı Plus üyeliğiniz bugün (${formatDate(expiryDate)}) sona eriyor. Ödeme yapılmazsa 7 gün içinde profiliniz otomatik olarak ücretsiz Temel pakete döner (kaldırılmaz, yayında kalmaya devam eder). Plus'a devam etmek için hemen dönüş yapabilirsiniz.\n\nProfiliniz: ${profileUrl}`,
    pasif: `Merhaba ${businessName} ekibi,\n\nÖdeme alınamadığı için RehberGölbaşı Plus üyeliğiniz sona erdi, profiliniz (${profileUrl}) ücretsiz Temel pakete döndü ve yayında kalmaya devam ediyor. Plus'a yeniden geçmek isterseniz bize ulaşmanız yeterli.\n\nPlus dışında, hedefli reklam alanlarımızla da öne çıkabilirsiniz: ${adUrl}`,
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
    <div className="card-shadow rounded-lg bg-offwhite p-3">
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
            <option value="pasif">Plus Süresi Doldu Bilgisi</option>
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