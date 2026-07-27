import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Search, BarChart2, Star, MessageCircle, Clock, ShieldCheck,
  CheckCircle2, ArrowRight, Phone, TrendingUp, Users, Eye,
} from "lucide-react";

export const metadata: Metadata = {
  title: "İşletmenizi Gölbaşı'nda Görünür Yapın — RehberGölbaşı",
  description: "RehberGölbaşı'na kayıt olun, Gölbaşı'nda sizi arayan müşterilere ulaşın. İlk ay tamamen ücretsiz, kurulum yok, arama motoru optimizasyonu dahil.",
  alternates: { canonical: "https://rehbergolbasi.com/isletmeler-icin" },
};

export const revalidate = 60;

async function getStats() {
  const [{ count: businessCount }, { data: events }] = await Promise.all([
    supabase.from("businesses").select("*", { count: "exact", head: true }).eq("status", "approved").eq("is_active", true),
    supabase.from("business_events").select("event_type", { count: "exact", head: true }),
  ]);
  const { count: viewCount } = await supabase
    .from("business_events")
    .select("*", { count: "exact", head: true })
    .eq("event_type", "profile_view");
  return {
    businessCount: businessCount ?? 0,
    viewCount: viewCount ?? 0,
  };
}

const FEATURES = [
  {
    icon: Search,
    title: "Google'da Görünün",
    desc: "Her işletme profili, Google'ın arama sonuçlarında çıkacak şekilde SEO optimize edilmiş başlık, açıklama ve yapısal verilerle hazırlanır.",
  },
  {
    icon: BarChart2,
    title: "Gerçek Zamanlı Analitik",
    desc: "Profiliniz kaç kez görüntülendi, kaç kişi sizi aradı veya WhatsApp'tan yazdı — tüm verileri admin panelinden takip edin.",
  },
  {
    icon: Star,
    title: "Özenle Hazırlanan Profil",
    desc: "Uzun SEO'lu açıklama, sıkça sorulan sorular, fotoğraf galerisi, çalışma saatleri — her şeyi bizim ekibimiz sizin için hazırlar.",
  },
  {
    icon: MessageCircle,
    title: "Doğrudan WhatsApp Bağlantısı",
    desc: "Müşteriler profilinizden tek tıkla WhatsApp'tan size ulaşır. Dönüşüm oranı telefon aramasından çok daha yüksek.",
  },
  {
    icon: Clock,
    title: "İlk Ay Tamamen Ücretsiz",
    desc: "Hiçbir risk yok. Profilinizi oluşturun, 30 gün boyunca ücretsiz deneyin. Devam etmek isteyip istemediğinize sonra karar verin.",
  },
  {
    icon: ShieldCheck,
    title: "Kişisel Destek",
    desc: "Profil oluşturma, fotoğraf yükleme, bilgi güncelleme — her adımda WhatsApp üzerinden destek alın. Yalnız değilsiniz.",
  },
];

const STEPS = [
  {
    no: "01",
    title: "Başvurun",
    desc: "Formu doldurun veya WhatsApp'tan yazın. İşletme bilgilerinizi alıyoruz.",
  },
  {
    no: "02",
    title: "Profiliniz Hazırlanır",
    desc: "Ekibimiz size özel SEO'lu açıklama, SSS ve profil sayfasını hazırlar. Siz sadece onaylarsınız.",
  },
  {
    no: "03",
    title: "Yayına Girin",
    desc: "Profiliniz canlıya alınır. Gölbaşı'nda sizi arayan müşteriler artık sizi bulur.",
  },
];

const FAQS = [
  {
    q: "Kaydolmak ne kadar sürer?",
    a: "Başvuru formunu doldurmak 5 dakika sürer. Profilinizi ekibimiz genellikle 24 saat içinde hazırlar ve yayına alır.",
  },
  {
    q: "İlk ay ücretsizden sonra ne olur?",
    a: "30 günlük ücretsiz deneme süreniz dolduğunda devam etmek isteyip istemediğinizi sorarız. Hayır derseniz profiliniz pasife alınır, hiçbir ücret kesilmez.",
  },
  {
    q: "Aylık ücret ne zaman başlar?",
    a: "İlk ay ücretsiz dönemi bittikten sonra aylık 360 TL ücretlendirme başlar. Ödeme yapmadığınız sürece profil otomatik pasife alınır.",
  },
  {
    q: "Profilimde ne tür bilgiler yer alır?",
    a: "İşletme adı, kategori, açıklama, telefon, WhatsApp, adres, çalışma saatleri, fotoğraf galerisi, özellikler, etiketler ve sıkça sorulan sorular bölümü.",
  },
  {
    q: "Profilimi sonradan güncelleyebilir miyim?",
    a: "Evet, herhangi bir güncelleme için WhatsApp'tan bize yazmanız yeterli. Fotoğraf, açıklama, çalışma saatleri gibi bilgileri istediğiniz zaman güncelleriz.",
  },
  {
    q: "Gölbaşı'nda değil, çevre ilçelerdeyim. Kayıt olabilir miyim?",
    a: "Rehbergolbasi.com şu an yalnızca Gölbaşı ve yakın çevresine hizmet veren işletmelere açıktır. İleride kapsamı genişletmeyi planlıyoruz.",
  },
];

export default async function IsletmelerIcinPage() {
  const { businessCount, viewCount } = await getStats();

  return (
    <div className="overflow-hidden">

      {/* Hero */}
      <section className="relative bg-navy px-5 py-20 text-center sm:py-28">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #C9A24B 0%, transparent 50%), radial-gradient(circle at 80% 50%, #7A1F2E 0%, transparent 50%)" }}
        />
        <div className="relative mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-gold" />
            <span className="text-xs font-bold tracking-wide text-gold">Gölbaşı'nın Dijital Rehberi</span>
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            İşletmenizi Gölbaşı'nda<br />
            <span className="text-gold">Görünür Yapın</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/70 leading-relaxed">
            Gölbaşı'nda sizi arayan müşterilere ulaşın. SEO optimize profil, WhatsApp bağlantısı ve gerçek zamanlı analitik — ilk ay tamamen ücretsiz.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/isletme-ekle"
              className="flex items-center gap-2 rounded-full bg-gold px-8 py-3.5 text-sm font-bold text-navy transition hover:bg-gold/90"
            >
              Hemen Başvur — Ücretsiz <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#fiyatlandirma"
              className="flex items-center gap-2 rounded-full border border-white/20 px-8 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Fiyatları Gör
            </Link>
          </div>
        </div>
      </section>

      {/* İstatistikler */}
      <section className="border-b border-line bg-white px-5 py-10">
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-6 text-center">
          {[
            { icon: Users, value: `${businessCount}+`, label: "Kayıtlı İşletme" },
            { icon: Eye, value: `${viewCount}+`, label: "Profil Görüntülenme" },
            { icon: TrendingUp, value: "7/24", label: "Çevrimiçi Vitrin" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-2">
              <s.icon className="h-5 w-5 text-bordo" />
              <span className="font-display text-3xl font-bold text-navy">{s.value}</span>
              <span className="text-xs font-semibold text-ink/50">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Neden RehberGölbaşı */}
      <section className="px-5 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-navy">Neden RehberGölbaşı?</h2>
            <p className="mt-3 text-ink/60">
              Sadece bir dizin değil — işletmenizin dijital vitrini.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-line bg-white p-6 transition hover:shadow-md">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-bordo/10">
                  <f.icon className="h-5 w-5 text-bordo" />
                </div>
                <h3 className="mb-2 font-display text-base font-bold text-navy">{f.title}</h3>
                <p className="text-sm text-ink/60 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nasıl çalışır */}
      <section className="bg-offwhite px-5 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-navy">Nasıl Çalışır?</h2>
            <p className="mt-3 text-ink/60">3 adımda Gölbaşı'nın dijital rehberinde yerinizi alın.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.no} className="relative flex flex-col items-center text-center">
                {i < STEPS.length - 1 && (
                  <div className="absolute left-1/2 top-6 hidden h-0.5 w-full bg-line sm:block" />
                )}
                <div className="relative z-10 mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-bordo font-display text-lg font-bold text-white">
                  {s.no}
                </div>
                <h3 className="mb-2 font-display text-base font-bold text-navy">{s.title}</h3>
                <p className="text-sm text-ink/60 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fiyatlandırma */}
      <section id="fiyatlandirma" className="px-5 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-navy">Şeffaf Fiyatlandırma</h2>
            <p className="mt-3 text-ink/60">Gizli ücret yok, sürpriz yok.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

            {/* Standart */}
            <div className="rounded-2xl border border-line bg-white p-8">
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-ink/40">Standart</p>
              <div className="mb-2 flex items-end gap-2">
                <span className="font-display text-4xl font-bold text-navy">360 TL</span>
                <span className="mb-1 text-sm text-ink/50">/ ay</span>
              </div>
              <p className="mb-6 text-xs text-ink/40">Günlük sadece 12 TL</p>
              <ul className="mb-8 flex flex-col gap-3">
                {[
                  "SEO optimize profil sayfası",
                  "Fotoğraf galerisi",
                  "WhatsApp & telefon butonu",
                  "Çalışma saatleri ve harita",
                  "Sıkça sorulan sorular",
                  "Görüntülenme & tıklama analitikleri",
                  "İlk ay tamamen ücretsiz",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-ink/70">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/isletme-ekle"
                className="flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-bold text-white transition hover:bg-navy-dark"
              >
                Ücretsiz Başla <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Öne Çıkan */}
            <div className="relative rounded-2xl border-2 border-gold bg-navy p-8">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gold px-4 py-1 text-xs font-bold text-navy">
                En Popüler
              </div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-gold/60">Öne Çıkan</p>
              <div className="mb-2 flex items-end gap-2">
                <span className="font-display text-4xl font-bold text-white">Özel Fiyat</span>
              </div>
              <p className="mb-6 text-xs text-white/40">Detaylar için iletişime geçin</p>
              <ul className="mb-8 flex flex-col gap-3">
                {[
                  "Standart paketin tüm özellikleri",
                  "Ana sayfada öne çıkarma",
                  "Kategori sayfasında üst sıra",
                  "Altın çerçeve rozet",
                  "Instagram içerik üretimi",
                  "Aylık performans raporu",
                  "Öncelikli destek",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-white/70">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-gold" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href={`https://wa.me/905396394206?text=${encodeURIComponent("Merhaba, Öne Çıkan paket hakkında bilgi almak istiyorum.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-navy transition hover:bg-gold/90"
              >
                <Phone className="h-4 w-4" /> WhatsApp'tan Sorun
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* SSS */}
      <section className="bg-offwhite px-5 py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-navy">Sıkça Sorulan Sorular</h2>
          </div>
          <div className="flex flex-col gap-4">
            {FAQS.map((faq) => (
              <div key={faq.q} className="rounded-2xl border border-line bg-white p-6">
                <h3 className="mb-2 font-display text-base font-bold text-navy">{faq.q}</h3>
                <p className="text-sm text-ink/60 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alt CTA */}
      <section className="px-5 py-20">
        <div className="mx-auto max-w-2xl rounded-3xl bg-bordo px-8 py-14 text-center">
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Gölbaşı'nda görünür olmanın zamanı geldi.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-white/70">
            İlk ay tamamen ücretsiz. Kredi kartı gerekmez, kurulum yok — sadece işletmenizin bilgileri yeterli.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/isletme-ekle"
              className="flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-bordo transition hover:bg-white/90"
            >
              Hemen Başvur <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`https://wa.me/905396394206?text=${encodeURIComponent("Merhaba, RehberGölbaşı hakkında bilgi almak istiyorum.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-white/30 px-8 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp'tan Yazın
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}