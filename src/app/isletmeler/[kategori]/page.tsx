import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import CategoryResults from "@/components/CategoryResults";
import { getCategoryIcon } from "@/lib/categoryIcons";
import type { Metadata } from "next";
import type { Category } from "@/lib/types";

export const revalidate = 60;

async function getData(slug: string) {
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();
  if (!category) return null;

  let parent: Category | null = null;
  if (category.parent_id) {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("id", category.parent_id)
      .single();
    parent = data ?? null;
  }

  const { data: subcategories } = await supabase
    .from("categories")
    .select("*")
    .eq("parent_id", category.id)
    .order("display_order", { ascending: true });

  const categoryIds = [category.id, ...(subcategories ?? []).map((c) => c.id)];

  const { data: businesses } = await supabase
    .from("businesses")
    .select("*")
    .eq("status", "approved")
    .eq("is_active", true)
    .in("category_id", categoryIds)
    .order("tier", { ascending: false })
    .order("created_at", { ascending: false });

  return {
    category,
    parent,
    subcategories: subcategories ?? [],
    businesses: businesses ?? [],
  };
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ kategori: string }>;
}): Promise<Metadata> {
  const { kategori } = await params;
  const data = await getData(kategori);
  if (!data) {
    return { title: "Kategori Bulunamadı" };
  }
  const { category, businesses } = data;
  const title = category.name;
  const description =
    category.seo_intro ??
    `Gölbaşı'nda ${category.name.toLowerCase()} kategorisinde ${businesses.length} işletme. Telefon, adres ve iletişim bilgileriyle RehberGölbaşı'nda.`;
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description },
  };
}

export default async function CategoryPage({
  params
}: {
  params: Promise<{ kategori: string }>;
}) {
  const { kategori } = await params;
  const data = await getData(kategori);
  if (!data) notFound();
  const { category, parent, subcategories, businesses } = data;
  const Icon = getCategoryIcon(category.icon);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-navy px-6 py-10 sm:px-10 sm:py-12">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 90% 15%, rgba(201,162,75,0.18), transparent 55%)",
          }}
        />
        <div className="relative">
          <nav className="mb-4 flex flex-wrap items-center gap-1 text-xs font-semibold text-white/60">
            <Link href="/isletmeler" className="transition-colors hover:text-white">
              Tüm kategoriler
            </Link>
            {parent && (
              <>
                <span>/</span>
                <Link
                  href={`/isletmeler/${parent.slug}`}
                  className="transition-colors hover:text-white"
                >
                  {parent.name}
                </Link>
              </>
            )}
            {parent && (
              <>
                <span>/</span>
                <span className="text-white">{category.name}</span>
              </>
            )}
          </nav>
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-gold backdrop-blur-sm">
              <Icon className="h-7 w-7" />
            </span>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {category.name}
              </h1>
              <p className="text-sm text-white/60">{businesses.length} işletme</p>
            </div>
          </div>
          {category.seo_intro && (
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
              {category.seo_intro}
            </p>
          )}
        </div>
      </div>

      {/* Alt kategoriler */}
      {subcategories.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {subcategories.map((sub) => (
            <Link
              key={sub.id}
              href={`/isletmeler/${sub.slug}`}
              className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-navy transition-colors hover:border-bordo hover:text-bordo"
            >
              {sub.name}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8">
        <CategoryResults businesses={businesses} />
      </div>
    </div>
  );
}