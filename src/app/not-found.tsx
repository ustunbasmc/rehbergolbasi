import Link from "next/link";
import { Compass, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-5 py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-bordo/10 text-bordo">
        <Compass className="h-7 w-7" />
      </span>
      <p className="mt-6 font-display text-7xl font-bold tracking-tight text-navy">404</p>
      <h1 className="mt-3 font-display text-2xl font-bold text-navy">
        Bu sayfayı bulamadık
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink/60">
        Aradığın sayfa taşınmış, kaldırılmış olabilir ya da hiç var olmamış olabilir.
        Gölbaşı&apos;ndaki işletmelere buradan devam edebilirsin.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 rounded-full bg-bordo px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-bordo-dark"
        >
          <Home className="h-4 w-4" /> Anasayfaya Dön
        </Link>
        <Link
          href="/isletmeler"
          className="flex items-center justify-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-bold text-navy transition-colors hover:border-navy"
        >
          <Search className="h-4 w-4" /> İşletmelere Göz At
        </Link>
      </div>
    </div>
  );
}