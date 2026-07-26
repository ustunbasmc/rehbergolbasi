import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Clock, BookOpen } from "lucide-react";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Rehberler — Gölbaşı Hakkında Her Şey",
  description: "Gölbaşı'nda yaşamı kolaylaştıran rehber yazıları. Nereye gidilir, ne yapılır, nelere dikkat edilir — hepsi burada.",
  alternates: {
    canonical: "https://rehbergolbasi.com/rehberler",
  },
  openGraph: {
    title: "Rehberler — Gölbaşı Hakkında Her Şey",
    description: "Gölbaşı'nda yaşamı kolaylaştıran rehber yazıları.",
  },
};

async function getGuides() {
  const { data } = await supabase
    .from("guides")
    .select("id, title, slug, excerpt, cover_image_url, read_time, featured, created_at")
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });
  return data ?? [];
}

export default async function RehberlerPage() {
  const guides = await getGuides();
  const featured = guides.filter((g) => g.featured);
  const rest = guides.filter((g) => !g.featured);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14">
      {/* Başlık */}
      <div className="mb-10 text-center">
        <div className="mb-3 flex items-center justify-center gap-2">
          <BookOpen className="h-5 w-5 text-bordo" />
          <span className="text-xs font-bold uppercase tracking-widest text-bordo">
            Gölbaşı Rehberleri
          </span>
        </div>
        <h1 className="font-display text-4xl font-bold text-navy">
          Gölbaşı Hakkında Her Şey
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-ink/60">
          Gölbaşı'nda yaşamı kolaylaştıran rehber yazıları — nereye gidilir, ne yapılır, nelere dikkat edilir.
        </p>
      </div>

      {guides.length === 0 ? (
        <div className="rounded-2xl border border-line bg-offwhite p-16 text-center">
          <BookOpen className="mx-auto mb-3 h-8 w-8 text-ink/20" />
          <p className="text-sm text-ink/50">Henüz rehber yazısı yok. Yakında eklenecek!</p>
        </div>
      ) : (
        <>
          {/* Öne çıkan rehberler */}
          {featured.length > 0 && (
            <div className="mb-12">
              <h2 className="mb-5 font-display text-xl font-bold text-navy">Öne Çıkan Rehberler</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((guide) => (
                  <Link
                    key={guide.id}
                    href={`/rehberler/${guide.slug}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition hover:shadow-lg"
                  >
                    <div className="relative h-48 w-full bg-offwhite">
                      {guide.cover_image_url ? (
                        <Image
                          src={guide.cover_image_url}
                          alt={guide.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <BookOpen className="h-10 w-10 text-ink/10" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <span className="absolute left-3 top-3 rounded-full bg-gold px-2.5 py-1 text-xs font-bold text-gold-dark">
                        Öne Çıkan
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="mb-2 font-display text-lg font-bold text-navy group-hover:text-bordo transition-colors">
                        {guide.title}
                      </h3>
                      {guide.excerpt && (
                        <p className="mb-3 flex-1 text-sm text-ink/60 line-clamp-2">
                          {guide.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-ink/40">
                        <Clock className="h-3.5 w-3.5" />
                        {guide.read_time} dk okuma
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Diğer rehberler */}
          {rest.length > 0 && (
            <div>
              {featured.length > 0 && (
                <h2 className="mb-5 font-display text-xl font-bold text-navy">Tüm Rehberler</h2>
              )}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((guide) => (
                  <Link
                    key={guide.id}
                    href={`/rehberler/${guide.slug}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition hover:shadow-lg"
                  >
                    <div className="relative h-40 w-full bg-offwhite">
                      {guide.cover_image_url ? (
                        <Image
                          src={guide.cover_image_url}
                          alt={guide.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <BookOpen className="h-8 w-8 text-ink/10" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="mb-1.5 font-display text-base font-bold text-navy group-hover:text-bordo transition-colors">
                        {guide.title}
                      </h3>
                      {guide.excerpt && (
                        <p className="mb-3 flex-1 text-sm text-ink/60 line-clamp-2">
                          {guide.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-ink/40">
                        <Clock className="h-3.5 w-3.5" />
                        {guide.read_time} dk okuma
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}