"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, HelpCircle } from "lucide-react";

const FAQS = [
  {
    q: "RehberGölbaşı'na işletme eklemek ücretli mi?",
    a: "Hayır, şu an için tamamen ücretsiz. Site kullanıcı sayısı ve işletme sayısı büyüdükçe isteğe bağlı öne çıkarma paketleri sunmayı planlıyoruz, ancak temel listelenme her zaman mümkün olacak.",
  },
  {
    q: "Başvurum ne kadar sürede onaylanıyor?",
    a: "Başvurular ekibimiz tarafından elle kontrol ediliyor ve genellikle kısa süre içinde sonuçlanıyor. Onaylandığında ya da reddedildiğinde herhangi bir bildirim almak istersen, formda bıraktığın iletişim bilgisi üzerinden sana ulaşabiliriz.",
  },
  {
    q: "İşletmemin bilgilerini nasıl güncellerim?",
    a: "Şu an işletme sahipleri için ayrı bir giriş sistemi bulunmuyor. Bilgi güncellemesi için işletme sayfandaki 'Bu işletme benim, güncellemek istiyorum' butonunu kullanarak bize ulaşabilir ya da bizimle doğrudan iletişime geçebilirsin.",
  },
  {
    q: "Aynı işletmeyi iki kere eklersem ne olur?",
    a: "Mükerrer başvurular admin kontrolünde fark edilip reddediliyor. Bir işletme zaten listede varsa, onu tekrar eklemek yerine güncelleme talebi göndermeni öneririz.",
  },
  {
    q: "Yorum ve puanlama sistemi var mı?",
    a: "Şu anki sürümde yok. Bunu ileride, kötüye kullanımı önleyecek sağlam bir sistemle birlikte eklemeyi düşünüyoruz.",
  },
  {
    q: "Verdiğim bilgiler ne kadar güvende?",
    a: "İşletme başvurusu sırasında girdiğin herkese açık bilgiler (isim, adres, telefon vb.) sitede yayınlanır. İstersen ek olarak bıraktığın sahiplik/iletişim bilgileri ise hiçbir zaman ziyaretçilere gösterilmez, sadece doğrulama amacıyla kullanılır. Detaylar için Gizlilik Politikamıza ve KVKK Aydınlatma Metnimize göz atabilirsin.",
  },
  {
    q: "Reklam ya da sponsorlu içerik var mı?",
    a: "Hayır, sitede üçüncü taraf reklamı göstermiyoruz. 'Öne Çıkan' rozeti, ileride sunacağımız isteğe bağlı bir görünürlük paketine ait olacak, dış reklam değildir.",
  },
];

export default function SSSPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-bordo/10 px-3 py-1.5 text-xs font-semibold text-bordo">
        <HelpCircle className="h-3.5 w-3.5" /> Sıkça Sorulan Sorular
      </span>
      <h1 className="mb-3 font-display text-3xl font-bold leading-tight tracking-tight text-navy sm:text-4xl">
        Aklına takılanlar
      </h1>
      <p className="mb-10 max-w-xl text-base leading-relaxed text-ink/70">
        RehberGölbaşı hakkında en çok sorulan sorular. Aradığını bulamazsan{" "}
        <Link href="/iletisim" className="font-semibold text-bordo hover:underline">
          bize ulaşabilirsin
        </Link>
        .
      </p>

      <div className="card-shadow rounded-2xl border border-line bg-white p-2 sm:p-4">
        <div className="flex flex-col divide-y divide-line">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i} className="p-4">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 text-left"
                >
                  <span className="font-semibold text-navy">{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-ink/40 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="mt-3 leading-relaxed text-ink/70">{faq.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}