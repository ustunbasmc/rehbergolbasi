"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Plus, Search } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/isletmeler?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
    setQuery("");
  }

  return (
    <header
      className={`sticky top-0 z-50 border-b-2 border-gold bg-white/95 backdrop-blur transition-shadow duration-200 ${
        scrolled ? "shadow-[0_6px_20px_rgba(20,33,61,0.10)]" : ""
      }`}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-3 px-5 py-2.5 sm:py-3">
        {/* Sol: menü */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
            className="flex h-10 w-10 items-center justify-center rounded-full text-navy sm:hidden"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <nav className="hidden items-center gap-6 font-body text-sm font-semibold text-ink sm:flex">
            <Link href="https://www.rehbergolbasi.com" className="group relative py-1 transition-colors hover:text-bordo">
              Anasayfa
              <span className="absolute inset-x-0 -bottom-0.5 h-0.5 origin-left scale-x-0 bg-bordo transition-transform duration-200 group-hover:scale-x-100" />
            </Link>
            <Link href="/isletmeler" className="group relative py-1 transition-colors hover:text-bordo">
              İşletmeler
              <span className="absolute inset-x-0 -bottom-0.5 h-0.5 origin-left scale-x-0 bg-bordo transition-transform duration-200 group-hover:scale-x-100" />
            </Link>
            <Link href="/hakkimizda" className="group relative py-1 transition-colors hover:text-bordo">
              Hakkımızda
              <span className="absolute inset-x-0 -bottom-0.5 h-0.5 origin-left scale-x-0 bg-bordo transition-transform duration-200 group-hover:scale-x-100" />
            </Link>
          </nav>
        </div>

        {/* Orta: logo */}
        <Link href="/" className="flex items-center justify-center" onClick={() => setOpen(false)}>
          <Image
            src="/logo.png"
            alt="RehberGölbaşı"
            width={220}
            height={62}
            priority
            className="h-10 w-auto sm:h-12"
          />
        </Link>

        {/* Sağ: arama + CTA */}
        <div className="flex items-center justify-end gap-2">
          {searchOpen ? (
            <form onSubmit={handleSearchSubmit} className="flex items-center">
              <input
                ref={searchInputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onBlur={() => !query && setSearchOpen(false)}
                placeholder="İşletme ara..."
                className="w-32 rounded-full border border-line px-3 py-1.5 text-sm outline-none focus:border-bordo sm:w-48"
              />
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Ara"
              className="flex h-10 w-10 items-center justify-center rounded-full text-navy transition-colors hover:bg-navy/5"
            >
              <Search className="h-5 w-5" />
            </button>
          )}
          <Link
            href="/isletme-ekle"
            className="hidden items-center gap-1.5 rounded-full bg-bordo px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-bordo-dark hover:shadow-md sm:flex"
          >
            <Plus className="h-4 w-4" /> İşletmeni Ekle
          </Link>
        </div>
      </div>

      {/* Mobil açılır menü */}
      {open && (
        <nav className="flex flex-col gap-1 border-t border-line bg-white px-5 py-4 sm:hidden">
          <Link
            href="/isletmeler"
            onClick={() => setOpen(false)}
            className="rounded-lg px-3 py-3 font-semibold text-ink hover:bg-offwhite"
          >
            İşletmeler
          </Link>
          <Link
            href="/hakkimizda"
            onClick={() => setOpen(false)}
            className="rounded-lg px-3 py-3 font-semibold text-ink hover:bg-offwhite"
          >
            Hakkımızda
          </Link>
          <Link
            href="/isletme-ekle"
            onClick={() => setOpen(false)}
            className="mt-1 flex items-center justify-center gap-1.5 rounded-full bg-bordo px-4 py-3 text-center font-bold text-white"
          >
            <Plus className="h-4 w-4" /> İşletmeni Ekle
          </Link>
        </nav>
      )}
    </header>
  );
}