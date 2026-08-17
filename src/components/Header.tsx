"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Plus, Search, ChevronDown } from "lucide-react";

const FAYDALI_BILGILER = [
  { href: "/nobetci-eczane", label: "Nöbetçi Eczane" },
  { href: "/isletmeler/resmi-kurumlar", label: "Resmi Kurumlar" },
  { href: "/otobus-saatleri", label: "Otobüs Saatleri" },
];

const NAV_ITEMS = [
  { href: "/", label: "Anasayfa", exact: true },
  { href: "/isletmeler", label: "İşletmeler", exact: false },
  { href: "/rehberler", label: "Rehberler", exact: false },
  { href: "/hakkimizda", label: "Hakkımızda", exact: false },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileFaydaliOpen, setMobileFaydaliOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/isletmeler?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
    setQuery("");
  }

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  const faydaliActive = FAYDALI_BILGILER.some((item) => pathname.startsWith(item.href));

  return (
    <header
      className={`sticky top-0 z-50 border-b border-gold/60 bg-white/95 backdrop-blur transition-shadow duration-200 ${
        scrolled ? "shadow-[0_6px_20px_rgba(20,33,61,0.10)]" : ""
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-2.5 sm:py-3">
        {/* Sol: mobil menü + logo + nav */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
            className="flex h-10 w-10 items-center justify-center rounded-full text-navy sm:hidden"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <Link href="/" className="flex shrink-0 flex-col items-start" onClick={() => setOpen(false)}>
            <Image
              src="/logo.png"
              alt="RehberGölbaşı"
              width={220}
              height={62}
              priority
              className="h-10 w-auto sm:h-12"
            />
            <span className="hidden pl-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-ink/35 sm:block">
              Gölbaşı&apos;nın Dijital Rehberi
            </span>
          </Link>

          <nav className="hidden items-center gap-6 font-body text-sm font-semibold text-ink sm:flex">
            {NAV_ITEMS.slice(0, 2).map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative py-1 transition-colors hover:text-bordo ${
                    active ? "text-bordo" : ""
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute inset-x-0 -bottom-0.5 h-0.5 origin-left bg-bordo transition-transform duration-200 ${
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              );
            })}

            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`group relative flex items-center gap-1 py-1 transition-colors hover:text-bordo ${
                  faydaliActive ? "text-bordo" : ""
                }`}
              >
                Faydalı Bilgiler
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                <span
                  className={`absolute inset-x-0 -bottom-0.5 h-0.5 origin-left bg-bordo transition-transform duration-200 ${
                    faydaliActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </button>
              {dropdownOpen && (
                <div className="absolute left-0 top-full mt-2 flex w-56 flex-col overflow-hidden rounded-xl border border-line bg-white py-1.5 shadow-lg">
                  {FAYDALI_BILGILER.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setDropdownOpen(false)}
                      className="px-4 py-2.5 text-sm font-semibold text-ink hover:bg-offwhite hover:text-bordo"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {NAV_ITEMS.slice(2).map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative py-1 transition-colors hover:text-bordo ${
                    active ? "text-bordo" : ""
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute inset-x-0 -bottom-0.5 h-0.5 origin-left bg-bordo transition-transform duration-200 ${
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sağ: arama + CTA */}
        <div className="flex shrink-0 items-center justify-end gap-2">
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
            href="/isletmeler-icin"
            className={`hidden py-1 text-sm font-semibold transition-colors hover:text-bordo md:block ${
              isActive("/isletmeler-icin", false) ? "text-bordo" : "text-ink"
            }`}
          >
            İşletmeniz İçin
          </Link>

          <Link
            href="/isletme-ekle"
            className="hidden items-center overflow-hidden rounded-full shadow-sm transition-all hover:shadow-md sm:flex"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-navy text-[11px] font-black tracking-tight text-white">
              RG
            </span>
            <span className="-ml-px flex items-center gap-1.5 bg-bordo py-2.5 pl-4 pr-5 text-sm font-bold text-white transition-colors hover:bg-bordo-dark">
              <Plus className="h-4 w-4" /> İşletmeni Ekle
            </span>
          </Link>
        </div>
      </div>

      {/* Mobil açılır menü */}
      {open && (
        <nav className="flex flex-col gap-1 border-t border-line bg-white px-5 py-4 sm:hidden">
          <Link
            href="/isletmeler"
            onClick={() => setOpen(false)}
            className={`rounded-lg px-3 py-3 font-semibold hover:bg-offwhite ${
              isActive("/isletmeler", false) ? "bg-bordo/5 text-bordo" : "text-ink"
            }`}
          >
            İşletmeler
          </Link>

          <button
            onClick={() => setMobileFaydaliOpen(!mobileFaydaliOpen)}
            className={`flex items-center justify-between rounded-lg px-3 py-3 text-left font-semibold hover:bg-offwhite ${
              faydaliActive ? "text-bordo" : "text-ink"
            }`}
          >
            Faydalı Bilgiler
            <ChevronDown className={`h-4 w-4 transition-transform ${mobileFaydaliOpen ? "rotate-180" : ""}`} />
          </button>
          {mobileFaydaliOpen && (
            <div className="ml-3 flex flex-col gap-1 border-l-2 border-line pl-3">
              {FAYDALI_BILGILER.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-semibold text-ink/70 hover:bg-offwhite"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
          <Link
            href="/rehberler"
            onClick={() => setOpen(false)}
            className={`rounded-lg px-3 py-3 font-semibold hover:bg-offwhite ${
              isActive("/rehberler", false) ? "bg-bordo/5 text-bordo" : "text-ink"
            }`}
          >
            Rehberler
          </Link>
          <Link
            href="/hakkimizda"
            onClick={() => setOpen(false)}
            className={`rounded-lg px-3 py-3 font-semibold hover:bg-offwhite ${
              isActive("/hakkimizda", false) ? "bg-bordo/5 text-bordo" : "text-ink"
            }`}
          >
            Hakkımızda
          </Link>
          <Link
            href="/isletmeler-icin"
            onClick={() => setOpen(false)}
            className={`rounded-lg px-3 py-3 font-semibold hover:bg-offwhite ${
              isActive("/isletmeler-icin", false) ? "bg-bordo/5 text-bordo" : "text-ink"
            }`}
          >
            İşletmeniz İçin
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