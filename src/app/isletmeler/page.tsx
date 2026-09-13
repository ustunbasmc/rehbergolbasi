import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import BusinessCard from "@/components/BusinessCard";
import SearchFilters, { type SortOption } from "@/components/SearchFilters";
import { getOpenStatus } from "@/lib/openingHours";
import { computeExcludedCategoryIds } from "@/lib/businessStats";
import type { Business } from "@/lib/types";

export const revalidate = 60;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q?.trim();
  return {
    title: query ? `"${query}" için sonuçlar` : "Tüm İşletmeler",
    description:
      "Gölbaşı'ndaki tüm işletmeleri kategoriye, mahalleye göre filtreleyerek keşfedin.",
    alternates: {
      canonical: "https://rehbergolbasi.com/isletmeler",
    },
  };
}

async function getData(query?: string) {
  const { data: allCategories } = await supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true });

  const categories = allCategories ?? [];
  const excludedCategoryIds = new Set(computeExcludedCategoryIds(categories));

  const displayCategories = categories.filter(
    (c) => !c.parent_id && !excludedCategoryIds.has(c.id)
  );

  let businessQuery = supabase
    .from("businesses")
    .select("*, category:categories(name, icon)")
    .eq("status", "approved")
    .eq("is_active", true)
    .order("tier", { ascending: false })
    .order("created_at", { ascending: false });

  if (query) {
    businessQuery = businessQuery.or(
      `name.ilike.%${query}%,description.ilike.%${query}%,neighborhood.ilike.%${query}%`
    );
  }

  const { data: allBusinesses } = await businessQuery;
  const businesses = ((allBusinesses ?? []) as Business[]).filter(
    (b) => !excludedCategoryIds.has(b.category_id)
  );

  return { categories: displayCategories, businesses };
}

function applyFilters(
  businesses: Business[],
  { mahalle, acikOnly, sirala }: { mahalle?: string; acikOnly: boolean; sirala: SortOption }
) {
  let result = businesses;

  if (mahalle) {
    result = result.filter((b) => b.neighborhood === mahalle);
  }
  if (acikOnly) {
    result = result.filter((b) => getOpenStatus(b.opening_hours)?.isOpen);
  }

  const sorted = [...result];
  if (sirala === "az") {
    sorted.sort((a, b) => a.name.localeCompare(b.name, "tr"));
  } else if (sirala === "yeni") {
    sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else {
    sorted.sort((a, b) => {
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }
  return sorted;
}

export default async function BusinessesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; mahalle?: string; acik?: string; sirala?: string }>;
}) {
  const { q, mahalle, acik, sirala } = await searchParams;
  const query = q?.trim();
  const { categories, businesses: allResults } = await getData(query);

  const hasActiveSearch = !!query;

  const neighborhoods = Array.from(
    new Set(allResults.map((b) => b.neighborhood).filter((n): n is string => !!n))
  ).sort((a, b) => a.localeCompare(b, "tr"));

  const sortOption: SortOption =
    sirala === "az" || sirala === "yeni" ? sirala : "onerilen";
  const acikOnly = acik === "1";

  const businesses = applyFilters(allResults, { mahalle, acikOnly, sirala: sortOption });

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="mb-2 font-display text-3xl font-bold text-navy">
        {query ? `"${query}" için sonuçlar` : "Tüm İşletmeler"}
      </h1>
      <p className="mb-8 text-ink/60">{businesses.length} işletme bulundu.</p>

      {hasActiveSearch ? (
        <Suspense fallback={<div className="mb-6 h-9" />}>
          <SearchFilters neighborhoods={neighborhoods} />
        </Suspense>
      ) : (
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/isletmeler/${cat.slug}`}
              className="rounded-full border border-line px-4 py-1.5 text-sm font-semibold text-navy transition hover:border-bordo hover:text-bordo"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {businesses.length === 0 ? (
        <div className="rounded-2xl border border-line bg-offwhite p-10 text-center text-ink/60">
          {query ? "Aramanla eşleşen işletme bulunamadı." : "Henüz onaylanmış işletme yok."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {businesses.map((b) => (
            <BusinessCard key={b.id} business={b} />
          ))}
        </div>
      )}
    </div>
  );
}
