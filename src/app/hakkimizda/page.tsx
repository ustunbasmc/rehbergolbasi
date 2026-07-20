import type { Metadata } from "next";
import { MapPin, Heart, Users, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description:
    "RehberGölbaşı, Gölbaşı'ndaki işletmeleri ve komşuları buluşturan yerel dijital rehberdir.",
};

export default function HakkimizdaPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-bordo/10 px-3 py-1.5 text-xs font-semibold text-bordo">
        <Sparkles className="h-3.5 w-3.5" /> Hakkımızda
      </span>
      <h1 className="mb-4 font-display text-3xl font-bold leading-tight tracking-tight text-navy sm:text-4xl">
        Gölbaşı&apos;nın komşudan komşuya rehberi
      </h1>
      <p className="mb-10 max-w-2xl text-base leading-relaxed text-ink/70">
        RehberGölbaşı, Gölbaşı&apos;nda yaşayan insanları burada iş yapan esnafla,
        kuaförle, restoranla, emlakçıyla bir araya getirmek için kuruldu. Amacımız
        basit: aradığın hizmeti karışık, reklam dolu genel ilan sitelerinde
        kaybolmadan, doğrudan komşularının önerdiği yerlerde bulman.
      </p>

      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card-shadow rounded-2xl border border-line bg-white p-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bordo/10 text-bordo">
            <MapPin className="h-4 w-4" />
          </span>
          <p className="mt-3 font-display text-lg font-bold text-navy">Sadece Gölbaşı</p>
          <p className="mt-1 text-sm text-ink/60">
            Ankara&apos;nın her yerinden değil, sadece Gölbaşı&apos;ndan işletmeler.
          </p>
        </div>
        <div className="card-shadow rounded-2xl border border-line bg-white p-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bordo/10 text-bordo">
            <Users className="h-4 w-4" />
          </span>
          <p className="mt-3 font-display text-lg font-bold text-navy">Yerel Odaklı</p>
          <p className="mt-1 text-sm text-ink/60">
            Büyük şehir platformlarının aksine, mahalle mahalle çalışıyoruz.
          </p>
        </div>
        <div className="card-shadow rounded-2xl border border-line bg-white p-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bordo/10 text-bordo">
            <Heart className="h-4 w-4" />
          </span>
          <p className="mt-3 font-display text-lg font-bold text-navy">Esnafın Yanında</p>
          <p className="mt-1 text-sm text-ink/60">
            Küçük işletmelerin dijitalde görünür olmasını kolaylaştırıyoruz.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <h2 className="mb-2 font-display text-xl font-bold text-navy">Neden Çıktık?</h2>
          <p className="leading-relaxed text-ink/70">
            Gölbaşı büyüyen, hızla gelişen bir ilçe. Ama burada yeni açılan bir kuaförü,
            güvenilir bir tesisatçıyı ya da mahallenin en iyi pilavcısını bulmak hâlâ
            çoğunlukla ağızdan ağıza öneriyle oluyor. RehberGölbaşı, bu öneri zincirini
            dijitale taşıyıp herkesin erişebileceği bir hale getirmeyi hedefliyor.
          </p>
        </div>
        <div>
          <h2 className="mb-2 font-display text-xl font-bold text-navy">Nasıl Çalışıyoruz?</h2>
          <p className="leading-relaxed text-ink/70">
            İşletme sahipleri kendi bilgilerini (adres, çalışma saatleri, fotoğraflar,
            menü, iletişim) siteye ekliyor, ekibimiz başvuruyu kontrol edip onaylıyor.
            Ziyaretçiler ise kategoriye göre arayıp doğrudan telefon veya WhatsApp
            üzerinden işletmeye ulaşabiliyor — aracı yok, komisyon yok.
          </p>
        </div>
        <div>
          <h2 className="mb-2 font-display text-xl font-bold text-navy">Nereye Gidiyoruz?</h2>
          <p className="leading-relaxed text-ink/70">
            Şu an büyüme aşamasındayız ve platformu herkese ücretsiz sunuyoruz.
            Gölbaşı&apos;ndaki işletmelerin büyük çoğunluğunu bir araya getirdikçe,
            işletmelere daha fazla görünürlük sağlayan ek özellikler ekleyeceğiz.
          </p>
        </div>
      </div>
    </div>
  );
}