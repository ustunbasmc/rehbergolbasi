import Link from "next/link";
import Image from "next/image";
import { AtSign, MapPin, ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto">
      {/* CTA strip */}
      <div className="bg-bordo">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-display text-xl font-bold text-white sm:text-2xl">
              İşletmeni Gölbaşı&apos;nda görünür yap
            </p>
            <p className="mt-1 text-sm text-white/80">
              Formu doldur, birkaç dakikada tamamla, ekibimiz kontrol edip yayına alsın.
            </p>
          </div>
          <Link
            href="/isletme-ekle"
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-6 py-3 text-sm font-bold text-bordo shadow-sm transition-colors hover:bg-offwhite"
          >
            Hemen Ekle <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Main footer */}
      <div className="border-t-2 border-gold bg-navy text-white">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <div className="grid gap-10 sm:grid-cols-4">
            <div className="sm:col-span-1">
              <div className="mb-4 inline-flex rounded-xl bg-white p-3">
                <Image
                  src="/logo.png"
                  alt="RehberGölbaşı"
                  width={220}
                  height={62}
                  className="h-11 w-auto"
                />
              </div>
              <p className="max-w-xs text-sm leading-relaxed text-white/70">
                Gölbaşı&apos;nda güvenilir işletmeleri bir araya getiren yerel dijital
                rehber.
              </p>
            </div>

            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-wider text-gold">
                Keşfet
              </p>
              <div className="flex flex-col gap-2.5 text-sm">
                <Link href="/" className="text-white/75 transition-colors hover:text-white">
                  Anasayfa
                </Link>
                <Link
                  href="/isletmeler"
                  className="text-white/75 transition-colors hover:text-white"
                >
                  Tüm İşletmeler
                </Link>
                <Link
                  href="/isletme-ekle"
                  className="text-white/75 transition-colors hover:text-white"
                >
                  İşletmeni Ekle
                </Link>
              </div>
            </div>

            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-wider text-gold">
                Kurumsal
              </p>
              <div className="flex flex-col gap-2.5 text-sm">
                <Link href="/hakkimizda" className="text-white/75 transition-colors hover:text-white">
                  Hakkımızda
                </Link>
                <Link href="/sss" className="text-white/75 transition-colors hover:text-white">
                  Sıkça Sorulan Sorular
                </Link>
                <Link href="/iletisim" className="text-white/75 transition-colors hover:text-white">
                  İletişim
                </Link>
              </div>
            </div>

            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-wider text-gold">
                İletişim
              </p>
              <p className="flex items-center gap-2 text-sm text-white/75">
                <MapPin className="h-4 w-4 shrink-0 text-white/40" /> Gölbaşı, Ankara
              </p>
              <a
                href="https://instagram.com/rehbergolbasi"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex w-fit items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 text-sm text-white/85 transition-colors hover:bg-white/20 hover:text-white"
              >
                <AtSign className="h-4 w-4" /> rehbergolbasi
              </a>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-white/40">
              © {new Date().getFullYear()} RehberGölbaşı — Tüm hakları saklıdır.
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-white/50">
              <Link href="/gizlilik-politikasi" className="transition-colors hover:text-white">
                Gizlilik Politikası
              </Link>
              <Link href="/kvkk" className="transition-colors hover:text-white">
                KVKK Aydınlatma Metni
              </Link>
              <Link href="/kullanim-sartlari" className="transition-colors hover:text-white">
                Kullanım Şartları
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}