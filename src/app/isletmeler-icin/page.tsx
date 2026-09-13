import type { Metadata } from "next";
import Link from "next/link";
import {
  Search, BarChart2, MessageCircle, Clock, ShieldCheck,
  CheckCircle2, ArrowRight, Phone, Building2, Globe,
} from "lucide-react";
import { getPublishedBusinessCount } from "@/lib/businessStats";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { formatWhatsappUrl } from "@/lib/analytics";

export const metadata: Metadata = {
  title: "İşletmenizi Gölbaşı'nda Görünür Yapın",
  description: "RehberGölbaşı'na kayıt olun, Gölbaşı'nda sizi arayan müşterilere ulaşın. Temel kayıt ücretsizdir, RehberGölbaşı Plus ile daha fazlasını sunarsınız.",
  alternates: { canonical: "https://rehbergolbasi.com/isletmeler-icin" },
};

export const revalidate = 60;

async function getStats() {
  const businessCount = await getPublishedBusinessCount();
  return { businessCount };
}

const FEATURES = [
  {
    icon: Building2,
    title: "Temel Kayıt Ücretsiz",
    desc: "İşletme adı, kategori, telefon, adres, harita ve çalışma saatleriyle profiliniz süresiz ücretsiz yayında kalır.",
  },
  {
    icon: Search,
    title: "Google'da Görünün",
    desc: "Her işletme profili, Google'ın arama sonuçlarında çıkacak şekilde SEO optimize edilmiş başlık, açıklama ve yapısal verilerle hazırlanır.",
  },
  {
    icon: BarChart2,
    title: "Plus ile Gerçek Zamanlı Analitik",
    desc: "RehberGölbaşı Plus'a geçince profiliniz kaç kez görüntülendi, kaç kişi sizi aradı veya WhatsApp'tan yazdı — tüm verileri takip edin.",
  },
  {
    icon: MessageCircle,
    title: "Doğrudan WhatsApp Bağlantısı",
    desc: "Plus ile müşteriler profilinizden tek tıkla WhatsApp'tan size ulaşır. Dönüşüm oranı telefon aramasından çok daha yüksek.",
  },
  {
    icon: Clock,
    title: "Plus'ta İlk 30 Gün Ücretsiz",
    desc: "Hiçbir risk yok. Plus'a geçin, 30 gün boyunca ücretsiz deneyin. Devam etmezseniz profiliniz Temel'e döner, yayından kalkmaz.",
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
    q: "Temel kayıt gerçekten ücretsiz mi?",
    a: "Evet. İşletme adı, kategori, mahalle, kısa açıklama, telefon, adres, harita ve çalışma saatleriyle Temel profiliniz süresiz ücretsizdir, hiçbir ödeme gerekmez.",
  },
  {
    q: "Plus denemesi bitince ne olur?",
    a: "30 günlük ücretsiz Plus deneme süreniz dolduğunda ödeme yapmazsanız profiliniz kaldırılmaz veya pasife alınmaz — otomatik olarak ücretsiz Temel profile döner ve yayında kalmaya devam eder.",
  },
  {
    q: "Plus aylık ücreti ne zaman başlar?",
    a: "İlk 30 günlük ücretsiz deneme bittikten sonra, devam etmek isterseniz aylık 360 TL ücretlendirme başlar. Ödeme yapmazsanız profil otomatik olarak ücretsiz Temel pakete döner.",
  },
  {
    q: "Profilimde ne tür bilgiler yer alır?",
    a: "Temel pakette işletme adı, kategori, mahalle, kısa açıklama, telefon, adres, harita ve çalışma saatleri yer alır. Plus'a geçtiğinizde WhatsApp bağlantısı, fotoğraf galerisi, uzun tanıtım, hizmetler, etiketler, menü/fiyat listesi, SSS ve analitikler eklenir.",
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
  const { businessCount } = await getStats();

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
            Temel işletme kaydı ücretsizdir. Gelişmiş profil, WhatsApp, galeri, analitik ve
            öne çıkarma özellikleri için RehberGölbaşı Plus'a geçebilirsiniz — ilk 30 gün ücretsiz.
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

      {/* Faydalar */}
      <section className="border-b border-line bg-white px-5 py-10">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 text-center sm:grid-cols-3">
          {[
            { icon: Building2, value: `${businessCount}+`, label: "Yayındaki Yerel İşletme" },
            { icon: Phone, value: "7/24", label: "Doğrudan Telefon ve WhatsApp" },
            { icon: Globe, value: "7/24", label: "Çevrimiçi Vitrin" },
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
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-navy">Şeffaf Fiyatlandırma</h2>
            <p className="mt-3 text-ink/60">Gizli ücret yok, sürpriz yok.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

            {/* Temel */}
            <div className="rounded-2xl border border-line bg-white p-8">
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-ink/40">Temel Profil</p>
              <div className="mb-2 flex items-end gap-2">
                <span className="font-display text-4xl font-bold text-navy">Ücretsiz</span>
              </div>
              <p className="mb-6 text-xs text-ink/40">Süresiz, hiçbir ödeme gerekmez</p>
              <ul className="mb-8 flex flex-col gap-3">
                {[
                  "İşletme adı, kategori ve alt kategori",
                  "Mahalle ve kısa açıklama",
                  "Telefon",
                  "Adres ve harita",
                  "Çalışma saatleri",
                  "Kapak görseli veya kategori yer tutucusu",
                  "Bilgi yanlış bildirimi & sahiplik talebi",
                  "Profil süresiz yayında kalır",
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

            {/* Plus */}
            <div className="relative rounded-2xl border-2 border-gold bg-navy p-8">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gold px-4 py-1 text-xs font-bold text-navy">
                En Popüler
              </div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-gold/60">RehberGölbaşı Plus</p>
              <div className="mb-2 flex items-end gap-2">
                <span className="font-display text-4xl font-bold text-white">360 TL</span>
                <span className="mb-1 text-sm text-white/50">/ ay</span>
              </div>
              <p className="mb-6 text-xs text-white/40">İlk 30 gün ücretsiz deneme</p>
              <ul className="mb-8 flex flex-col gap-3">
                {[
                  "Temel profilin tüm özellikleri",
                  "İlk 30 gün ücretsiz Plus denemesi",
                  "Geniş fotoğraf galerisi",
                  "WhatsApp bağlantısı",
                  "Uzun ve profesyonel tanıtım",
                  "Hizmetler, özellikler ve etiketler",
                  "Menü / fiyat listesi",
                  "Sıkça sorulan sorular",
                  "Görüntülenme & tıklama analitikleri",
                  "Kategori içinde öncelik",
                  "Öncelikli güncelleme ve destek",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-white/70">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-gold" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/isletme-ekle"
                className="flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-navy transition hover:bg-gold/90"
              >
                Plus ile Başla <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Öne Çıkan */}
            <div className="relative rounded-2xl border border-line bg-white p-8">
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-ink/40">Öne Çıkan</p>
              <div className="mb-2 flex items-end gap-2">
                <span className="font-display text-3xl font-bold text-navy">Özel Fiyat</span>
              </div>
              <p className="mb-6 text-xs text-ink/40">Detaylar için iletişime geçin</p>
              <ul className="mb-8 flex flex-col gap-3">
                {[
                  "Plus paketinin tüm özellikleri",
                  "Ana sayfada öne çıkarma",
                  "Kategori sayfasında üst sıra",
                  "Altın çerçeve rozet",
                  "Instagram içerik üretimi",
                  "Aylık performans raporu",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-ink/70">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href={formatWhatsappUrl(WHATSAPP_NUMBER!, "Merhaba, Öne Çıkan paket hakkında bilgi almak istiyorum.")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-bold text-white transition hover:bg-navy-dark"
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
              href={formatWhatsappUrl(WHATSAPP_NUMBER!, "Merhaba, RehberGölbaşı hakkında bilgi almak istiyorum.")}
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