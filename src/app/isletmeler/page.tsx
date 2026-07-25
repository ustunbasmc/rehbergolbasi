import Link from "next/link";
import { supabase } from "@/lib/supabase";
import BusinessCard from "@/components/BusinessCard";

export const revalidate = 60;

async function getData(query?: string) {
  const { data: allCategories } = await supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true });

  const categories = allCategories ?? [];
  const resmiKurumlar = categories.find(
    (c) => c.slug === "resmi-kurumlar" && !c.parent_id
  );

  const excludedCategoryIds = new Set<string>();
  if (resmiKurumlar) {
    excludedCategoryIds.add(resmiKurumlar.id);
    categories
      .filter((c) => c.parent_id === resmiKurumlar.id)
      .forEach((c) => excludedCategoryIds.add(c.id));
  }

  const displayCategories = categories.filter(
  (c) => !c.parent_id && !excludedCategoryIds.has(c.id)
);

  let businessQuery = supabase
    .from("businesses")
    .select("*")
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
  const businesses = (allBusinesses ?? []).filter(
    (b) => !excludedCategoryIds.has(b.category_id)
  );

  return { categories: displayCategories, businesses };
}

export default async function BusinessesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim();
  const { categories, businesses } = await getData(query);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="mb-2 font-display text-3xl font-bold text-navy">
        {query ? `"${query}" için sonuçlar` : "Tüm İşletmeler"}
      </h1>
      <p className="mb-8 text-ink/60">{businesses.length} işletme bulundu.</p>

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