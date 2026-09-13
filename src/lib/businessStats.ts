import { supabase } from "@/lib/supabase";

interface CategoryLike {
  id: string;
  slug: string;
  parent_id: string | null;
}

/**
 * "Resmi Kurumlar" ve alt kategorileri, halka açık "X işletme" sayaçlarına
 * dahil edilmez (ticari işletme rehberi olarak konumlandırma). Ana sayfa,
 * /isletmeler ve /isletmeler-icin bu TEK tanımı kullanarak aynı sayıyı
 * gösterir — sayı hiçbir yerde hard-code edilmez veya ayrı ayrı yeniden
 * hesaplanmaz.
 *
 * Kategori listesi zaten sayfa tarafından çekilmişse (ör. ana sayfa,
 * /isletmeler) network round-trip'i tekrarlamamak için bu saf fonksiyonu
 * kullan. Kategori listesi henüz yoksa `getExcludedCategoryIds()` kullan.
 */
export function computeExcludedCategoryIds(categories: CategoryLike[]): string[] {
  const resmiKurumlar = categories.find((c) => c.slug === "resmi-kurumlar" && !c.parent_id);
  if (!resmiKurumlar) return [];

  return [
    resmiKurumlar.id,
    ...categories.filter((c) => c.parent_id === resmiKurumlar.id).map((c) => c.id),
  ];
}

export async function getExcludedCategoryIds(): Promise<string[]> {
  const { data: categories } = await supabase
    .from("categories")
    .select("id, slug, parent_id");

  return computeExcludedCategoryIds(categories ?? []);
}

/**
 * Yalnızca ziyaretçiye açık (status=approved, is_active=true), ticari
 * kategorilerdeki (resmi kurumlar hariç) işletmeleri sayar. Ana sayfa,
 * tüm işletmeler sayfası ve "İşletmeniz İçin" sayfası bu tek kaynağı kullanır.
 */
export async function getPublishedBusinessCount(): Promise<number> {
  const excludedIds = await getExcludedCategoryIds();

  let query = supabase
    .from("businesses")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved")
    .eq("is_active", true);

  if (excludedIds.length > 0) {
    query = query.not("category_id", "in", `(${excludedIds.join(",")})`);
  }

  const { count } = await query;
  return count ?? 0;
}
