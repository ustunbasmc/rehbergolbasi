"use client";

import { useState } from "react";
import { Copy, Check, MessageCircle } from "lucide-react";

interface Template {
  title: string;
  category: string;
  content: string;
}

const TEMPLATES: Template[] = [
  {
    title: "Yeni İşletme Daveti (Genel)",
    category: "Davet",
    content: `Merhaba, mesajınız için teşekkürler 😊

Ben Mehmet, RehberGölbaşı'ndan yazıyorum. Kısaca ne yaptığımızı anlatayım: Gölbaşı'daki işletmeleri tek bir sitede topluyoruz — rehbergolbasi.com. Amacımız, insanların ihtiyaç duydukları bir hizmeti veya ürünü aradığında karşılarına sizin gibi gerçek, güvenilir işletmeler çıksın.

İşletmenizi de bu rehbere eklemek istiyoruz. Size somut olarak ne katıyor:

- Google'da bulunursunuz — şu an sosyal medyanız var ama Google aramasında çıkmıyor olabilirsiniz. Biz sizin için bir profil hazırlıyoruz, arama sonuçlarında görünmenizi sağlıyoruz.
- Sitemizde arama yapan kullanıcılara da görünürsünüz — rehbergolbasi.com üzerinden ilgili hizmeti/ürünü arayan kişiler direkt sizin profilinizi görebiliyor.
- Direkt müşteri gelir — profilinizi gören kişi tek tıkla WhatsApp'tan size yazabiliyor, aracı yok.
- Profesyonel bir görünüm — fotoğraflarınız, hizmetleriniz, telefon numaranız düzenli bir sayfada, elle hazırlıyoruz.

İlk ay tamamen ücretsiz, hiçbir risk almıyorsunuz. Beğenmezseniz kaldırırız, tek kelime etmeyiz. Devam etmek isterseniz sonrasında günlük sadece 12 TL.

Başlamak için birkaç bilgiye ihtiyacım var:
1. İşletme adınız
2. Adresiniz/hizmet bölgeniz
3. Telefon/WhatsApp numaranız
4. Sunduğunuz hizmetler/ürünler
5. Instagram hesabınız (varsa)

Bu bilgileri paylaşırsanız hemen profilinizi hazırlamaya başlıyorum 👍`,
  },
  {
    title: "Profil Hazır, Onay Bekliyor",
    category: "Takip",
    content: `Merhaba, işletmenizin profilini ücretsiz olarak hazırladık 🎉

👉 rehbergolbasi.com/isletme/[SLUG]

Gölbaşı'nda ilgili aramalarda sizi üst sıralarda göstermek için SEO'lu bir profil hazırladık.

İlk ay tamamen ücretsiz — devam etmek isteyip istemediğinize 1 ay sonra karar verirsiniz, hiçbir zorunluluk yok. Beğenmezseniz profilinizi kaldırıyoruz, tek kelime etmiyoruz. 😊

Profilinize bir göz atar mısınız?`,
  },
  {
    title: "Ücretsiz Süre Bitiyor Hatırlatması",
    category: "Takip",
    content: `Merhaba, umarım iyisinizdir 😊

RehberGölbaşı'ndaki ücretsiz deneme sürenizin bitmesine birkaç gün kaldı. Profilinizin yayında kalması için devam etmek isterseniz, günlük sadece 12 TL (aylık 360 TL) ile devam edebiliriz.

Devam etmek istemezseniz de sorun değil, tek kelime söylemeden profilinizi kaldırırız — hiçbir yükümlülüğünüz yok.

Ne düşünüyorsunuz?`,
  },
  {
    title: "Kayıt Sonrası Teşekkür",
    category: "Onay",
    content: `Harika, hoş geldiniz! 🎉

İşletmeniz artık RehberGölbaşı'nda yayında: rehbergolbasi.com/isletme/[SLUG]

Profilinizde bir eksik/güncelleme olursa (yeni fotoğraf, farklı hizmet, telefon değişikliği vb.) buradan yazmanız yeterli, hemen güncelleriz.

İyi işler dileriz! 🙌`,
  },
  {
    title: "Sosyal Medya İçerik Paketi Teklifi",
    category: "Üst Satış",
    content: `Merhaba, bir fikrim var 💡

RehberGölbaşı profilinizin yanında, isterseniz sizin için Instagram/Facebook tanıtım içeriği de hazırlayabiliriz — fotoğraf düzenleme, açıklama metni, hashtag önerisi dahil.

Bu, profilinizin sosyal medyada da görünürlüğünü artırır. İlgilenirseniz detayları konuşalım.`,
  },
];

export default function MessageTemplates() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("Tümü");

  const categories = ["Tümü", ...Array.from(new Set(TEMPLATES.map((t) => t.category)))];
  const filtered = filter === "Tümü" ? TEMPLATES : TEMPLATES.filter((t) => t.category === filter);

  async function handleCopy(content: string, index: number) {
    await navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-display text-lg font-bold text-navy">Mesaj Şablonları</h2>
        <p className="text-xs text-ink/50">Hazır WhatsApp mesajlarını tek tıkla kopyala.</p>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              filter === cat
                ? "bg-bordo text-white"
                : "border border-line bg-white text-ink/60 hover:bg-offwhite"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {filtered.map((template, i) => {
          const originalIndex = TEMPLATES.indexOf(template);
          return (
            <div key={template.title} className="rounded-2xl border border-line bg-white p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-bordo/10 text-bordo">
                    <MessageCircle className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-navy">{template.title}</p>
                    <p className="text-xs text-ink/40">{template.category}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(template.content, originalIndex)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition ${
                    copiedIndex === originalIndex
                      ? "bg-green-100 text-green-700"
                      : "bg-navy text-white hover:bg-navy-dark"
                  }`}
                >
                  {copiedIndex === originalIndex ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> Kopyalandı
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Kopyala
                    </>
                  )}
                </button>
              </div>
              <p className="whitespace-pre-line rounded-lg bg-offwhite p-3 text-xs leading-relaxed text-ink/70">
                {template.content}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}