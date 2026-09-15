import type { Metadata } from "next";
import Link from "next/link";
import {
  Target, TrendingUp, Wallet, Users, ArrowRight, MessageCircle, CheckCircle2,
} from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { formatWhatsappUrl } from "@/lib/analytics";
import { AD_PLACEMENTS, formatAdPrice } from "@/lib/adPlacements";
import AdInquiryForm from "@/components/AdInquiryForm";

export const metadata: Metadata = {
  title: "İşletmeniz İçin Reklam Verin",
  description: "RehberGölbaşı'nda Gölbaşı'na özel hedefli reklam alanları kiralayın. Taksi, işletmeler, gündem ve daha fazla sayfada görünür olun.",
  alternates: { canonical: "https://rehbergolbasi.com/reklam-ver" },
};

const WHY = [
  {
    icon: Target,
    title: "Tam Yerel Hedefleme",
    desc: "Sadece Gölbaşı ve çevresindeki gerçek müşteri adaylarına ulaşırsınız — bütçeniz alakasız gösterimlere gitmez.",
  },
  {
    icon: TrendingUp,
    title: "Yüksek Niyetli Ziyaretçi",
    desc: "Ziyaretçilerimiz zaten bir işletme, taksi, eczane ya da hizmet arıyor. Reklamınız tam doğru anda karşılarına çıkar.",
  },
  {
    icon: Wallet,
    title: "Uygun ve Şeffaf Fiyat",
    desc: "Büyük reklam ağlarının aksine, sabit aylık ücretle net bütçe planlarsınız. Gizli maliyet veya minimum harcama şartı yok.",
  },
  {
    icon: Users,
    title: "Doğrudan Gölbaşı Halkına Erişim",
    desc: "Sitemiz günlük olarak Gölbaşı'nda işletme, taksi, eczane ve gündem arayan yerel kullanıcılar tarafından ziyaret ediliyor.",
  },
];

const STEPS = [
  {
    no: "01",
    title: "Yerleşim Seçin",
    desc: "Aşağıdaki fiyat tablosundan işletmenize en uygun sayfa ve reklam formatını belirleyin.",
  },
  {
    no: "02",
    title: "Teklif Alın",
    desc: "Formu doldurun, ekibimiz size görsel boyutu, süre ve ödeme detaylarıyla birlikte dönüş yapsın.",
  },
  {
    no: "03",
    title: "Yayına Girin",
    desc: "Görselinizi onaylayın, reklamınız belirlediğiniz tarih aralığında canlıya alınsın.",
  },
];

export default function ReklamVerPage() {
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
            <span className="text-xs font-bold tracking-wide text-gold">Gölbaşı&apos;nın Dijital Rehberi</span>
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            İşletmeniz İçin<br />
            <span className="text-gold">Reklam Verin</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/70 leading-relaxed">
            Gölbaşı&apos;nda her gün işletme, taksi, eczane ve gündem arayan binlerce ziyaretçiye,
            en çok görüntülenen sayfalarda hedefli reklamla ulaşın.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="#teklif-al"
              className="flex items-center gap-2 rounded-full bg-gold px-8 py-3.5 text-sm font-bold text-navy transition hover:bg-gold/90"
            >
              Teklif Al <ArrowRight className="h-4 w-4" />
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

      {/* Neden reklam ver */}
      <section className="px-5 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-navy">Neden RehberGölbaşı&apos;nda Reklam Vermelisiniz?</h2>
            <p className="mt-3 text-ink/60">
              Büyük reklam ağlarının aksine, tamamen Gölbaşı&apos;na özel bir kitleye ulaşırsınız.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map((f) => (
              <div key={f.title} className="card-shadow card-shadow-hover rounded-2xl bg-white p-6 transition">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-bordo to-bordo-dark shadow-sm">
                  <f.icon className="h-5 w-5 text-white" />
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
            <p className="mt-3 text-ink/60">3 adımda reklamınız yayında.</p>
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
            <h2 className="font-display text-3xl font-bold text-navy">Reklam Alanları ve Fiyatları</h2>
            <p className="mt-3 text-ink/60">
              Tüm fiyatlar aylık, KDV dahildir. Görselin hazırlanmasında ihtiyaç halinde ücretsiz destek sağlanır.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-separate border-spacing-0 overflow-hidden rounded-2xl card-shadow">
              <thead>
                <tr className="bg-navy text-left text-white">
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide">Yerleşim</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide">Sayfa</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide">Açıklama</th>
                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide">Aylık Ücret</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {AD_PLACEMENTS.map((p, i) => (
                  <tr key={p.key} className={i % 2 === 1 ? "bg-offwhite/60" : ""}>
                    <td className="px-5 py-4 text-sm font-bold text-navy">{p.label}</td>
                    <td className="px-5 py-4 text-sm text-ink/60">{p.pageLabel}</td>
                    <td className="px-5 py-4 text-sm text-ink/50">{p.description}</td>
                    <td className="px-5 py-4 text-right text-sm font-bold text-bordo">{formatAdPrice(p.priceMonthly)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex flex-wrap gap-4 text-xs text-ink/40">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Minimum 1 ay</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> İstediğiniz zaman iptal</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Görsel hazırlama desteği</span>
          </div>
        </div>
      </section>

      {/* Teklif al */}
      <section id="teklif-al" className="bg-offwhite px-5 py-20">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-3xl font-bold text-navy">Hemen Teklif Alın</h2>
            <p className="mt-4 text-ink/60 leading-relaxed">
              Formu doldurun, size en uygun yerleşimi ve tarih aralığını birlikte belirleyelim.
              İsterseniz doğrudan WhatsApp üzerinden de bize ulaşabilirsiniz.
            </p>
            <Link
              href={formatWhatsappUrl(WHATSAPP_NUMBER!, "Merhaba, RehberGölbaşı'nda reklam vermek istiyorum.")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-bordo px-6 py-3 text-sm font-bold text-white transition hover:bg-bordo-dark"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp&apos;tan Yazın
            </Link>
          </div>
          <AdInquiryForm />
        </div>
      </section>

    </div>
  );
}
