import { supabase } from "@/lib/supabase";
import BusinessApplyForm from "@/components/BusinessApplyForm";
import { Sparkles, Clock, MessageCircle, ShieldCheck, TrendingUp } from "lucide-react";

export const revalidate = 60;

async function getCategories() {
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true });
  return data ?? [];
}

export default async function IsletmeEklePage() {
  const categories = await getCategories();

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
            İşletmeni Gölbaşı&apos;nın dijital vitrinine taşı
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/70 sm:text-base">
            Komşularının işletmeni bulmasını kolaylaştır. Formu doldur, birkaç dakika
            içinde tamamla, ekibimiz kontrol edip yayına alsın.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-sm sm:text-sm">
              <TrendingUp className="h-4 w-4 text-gold" /> Şu an ücretsiz
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-sm sm:text-sm">
              <Clock className="h-4 w-4 text-gold" /> Hızlı onay süreci
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-sm sm:text-sm">
              <MessageCircle className="h-4 w-4 text-gold" /> Direkt WhatsApp/telefon talebi
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="lg:flex-1">
          <div className="card-shadow rounded-2xl border border-line bg-white p-6 sm:p-8">
            <BusinessApplyForm categories={categories} />
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:w-80">
          <div className="card-shadow rounded-2xl border border-line bg-white p-6">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-ink/40">
              Neden RehberGölbaşı?
            </h2>
            <ul className="flex flex-col gap-3 text-sm text-ink/70">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-bordo/10 text-bordo">
                  <Sparkles className="h-3 w-3" />
                </span>
                Gölbaşı&apos;na özel, karışık ilan sitelerinden arınmış bir dizin
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-bordo/10 text-bordo">
                  <MessageCircle className="h-3 w-3" />
                </span>
                Müşteriler seni doğrudan arayabilir ya da WhatsApp&apos;tan yazabilir
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-bordo/10 text-bordo">
                  <Clock className="h-3 w-3" />
                </span>
                Çalışma saatleri, menü, SSS gibi detayları tek sayfada topla
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-line bg-offwhite p-6">
            <div className="mb-2 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-navy" />
              <p className="text-sm font-semibold text-navy">Bilgilerin güvende</p>
            </div>
            <p className="text-xs leading-relaxed text-ink/60">
              Son adımda istersen bıraktığın sahiplik bilgileri sitede hiç yayınlanmaz,
              yalnızca doğrulama amacıyla kullanılır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}