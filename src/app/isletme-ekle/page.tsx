import type { Metadata } from "next";
import BusinessApplyForm from "@/components/BusinessApplyForm";
import { Sparkles, ShieldCheck, Clock, CreditCard } from "lucide-react";

export const metadata: Metadata = {
  title: "İşletmeni Ücretsiz Ekle",
  description:
    "Gölbaşı'ndaki işletmeni 60 saniyede ücretsiz gönder. Tanıtım yazısını, kategorileri ve işletme profilini RehberGölbaşı ekibi hazırlasın.",
  alternates: { canonical: "https://rehbergolbasi.com/isletme-ekle" },
};

const TRUST_BADGES = [
  { icon: CreditCard, text: "Temel işletme kaydı süresiz ücretsiz" },
  { icon: ShieldCheck, text: "Kredi kartı gerekmez" },
  { icon: Sparkles, text: "Profilinizi ekibimiz hazırlıyor" },
  { icon: Clock, text: "Bilgiler yayınlanmadan önce kontrol edilir" },
];

export default function IsletmeEklePage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl bg-navy px-6 py-10 sm:px-10 sm:py-14">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 85% 20%, rgba(201,162,75,0.18), transparent 55%)",
          }}
        />
        <div className="relative">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-gold" /> Gölbaşı&apos;nın işletme rehberi
          </span>
          <h1 className="max-w-xl font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            İşletmeni 60 saniyede gönder
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/70 sm:text-base">
            Bize yalnızca temel bilgileri ilet. Tanıtım yazısını, kategorileri ve işletme
            profilinin tamamını ekibimiz hazırlasın.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            {TRUST_BADGES.map((badge) => (
              <div
                key={badge.text}
                className="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-sm sm:text-sm"
              >
                <badge.icon className="h-4 w-4 text-gold" /> {badge.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="lg:flex-1 lg:max-w-2xl">
          <div className="card-shadow rounded-2xl bg-white p-6 sm:p-8">
            <BusinessApplyForm />
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:w-80">
          <div className="card-shadow rounded-2xl bg-white p-6">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-ink/40">
              Şimdi ne oluyor?
            </h2>
            <ul className="flex flex-col gap-3 text-sm text-ink/70">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-bordo/10 text-bordo">
                  1
                </span>
                Başvurunu gönderirsin, birkaç dakika sürer.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-bordo/10 text-bordo">
                  2
                </span>
                Ekibimiz bilgilerini kontrol edip profilini hazırlar.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-bordo/10 text-bordo">
                  3
                </span>
                Eksik bir şey olursa verdiğin numaradan seninle iletişime geçeriz.
              </li>
            </ul>
          </div>

          <div className="card-shadow rounded-2xl bg-offwhite p-6">
            <div className="mb-2 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-navy" />
              <p className="text-sm font-semibold text-navy">Bilgilerin güvende</p>
            </div>
            <p className="text-xs leading-relaxed text-ink/60">
              Başvuran kişi bilgilerin sitede yayınlanmaz, yalnızca doğrulama ve iletişim amacıyla
              kullanılır. Fotoğrafların yalnızca profilin onaylanmadan önce ekibimiz tarafından
              görülür.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
