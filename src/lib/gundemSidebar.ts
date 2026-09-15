import { supabase } from "@/lib/supabase";
import { getExcludedCategoryIds } from "@/lib/businessStats";

export interface GundemSidebarBusiness {
  id: string;
  name: string;
  slug: string;
  neighborhood: string | null;
  cover_image_url: string | null;
  phone: string | null;
  whatsapp: string | null;
  category: { name: string } | null;
}

const SIDEBAR_BUSINESS_COUNT = 3;
const SIDEBAR_SELECT = "id, name, slug, neighborhood, cover_image_url, phone, whatsapp, category:categories(name)";

/**
 * Basit, hızlı, deterministik string hash (FNV-1a). Math.random() veya
 * Date.now() KULLANILMAZ — aynı gün içinde aynı habere gelen her istekte
 * aynı "çeşitlilik" seçimi çıksın diye (SSR tutarlılığı, hydration hatası
 * riski yok, oturum/gün boyunca kart sırası sabit kalır).
 */
function stableHash(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function todaySeed(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD — gün boyunca sabit
}

/**
 * Haber detay sayfasındaki "Gölbaşı'nda Keşfet" işletme önerilerini üretir.
 * Öncelik sırası (madde: İŞLETME SEÇİMİ):
 *   1) Admin tarafından habere açıkça ilişkilendirilmiş işletmeler.
 *   2) Habere etiket üzerinden (mevcut tags/business_tags tablolarıyla,
 *      metin eşleşmesiyle DEĞİL) gerçekten bağlı işletmeler.
 *   3) Kalan yer varsa: güne göre kararlı, deterministik, çeşitli bir seçim.
 * Yalnızca status=approved, is_active=true ve resmi kurum kategorisi
 * dışındaki işletmeler (mevcut public görünürlük/RLS kurallarıyla aynı).
 */
export async function getGundemSidebarBusinesses(
  postId: string,
  tagIds: string[]
): Promise<GundemSidebarBusiness[]> {
  const excludedCategoryIds = await getExcludedCategoryIds();
  const selected: GundemSidebarBusiness[] = [];
  const selectedIds = new Set<string>();

  function addAll(rows: GundemSidebarBusiness[], order?: (a: GundemSidebarBusiness, b: GundemSidebarBusiness) => number) {
    const list = order ? [...rows].sort(order) : rows;
    for (const b of list) {
      if (selected.length >= SIDEBAR_BUSINESS_COUNT) break;
      if (!selectedIds.has(b.id)) {
        selected.push(b);
        selectedIds.add(b.id);
      }
    }
  }

  // 1) Admin tarafından açıkça ilişkilendirilmiş işletmeler.
  const { data: linkRows } = await supabase
    .from("gundem_post_businesses")
    .select("business_id")
    .eq("post_id", postId);
  const linkedIds = (linkRows ?? []).map((r) => r.business_id);
  if (linkedIds.length > 0) {
    let query = supabase.from("businesses").select(SIDEBAR_SELECT).in("id", linkedIds).eq("status", "approved").eq("is_active", true);
    if (excludedCategoryIds.length > 0) query = query.not("category_id", "in", `(${excludedCategoryIds.join(",")})`);
    const { data } = await query;
    addAll((data ?? []) as unknown as GundemSidebarBusiness[]);
  }

  // 2) Ortak etiket üzerinden gerçekten ilgili işletmeler.
  if (selected.length < SIDEBAR_BUSINESS_COUNT && tagIds.length > 0) {
    const { data: tagLinks } = await supabase.from("business_tags").select("business_id").in("tag_id", tagIds);
    const candidateIds = Array.from(new Set((tagLinks ?? []).map((r) => r.business_id))).filter((id) => !selectedIds.has(id));
    if (candidateIds.length > 0) {
      let query = supabase.from("businesses").select(SIDEBAR_SELECT).in("id", candidateIds).eq("status", "approved").eq("is_active", true);
      if (excludedCategoryIds.length > 0) query = query.not("category_id", "in", `(${excludedCategoryIds.join(",")})`);
      const { data } = await query;
      addAll(
        (data ?? []) as unknown as GundemSidebarBusiness[],
        (a, b) => stableHash(postId + a.id) - stableHash(postId + b.id)
      );
    }
  }

  // 3) Kalan yer varsa: güne göre kararlı, çeşitli bir seçim.
  if (selected.length < SIDEBAR_BUSINESS_COUNT) {
    let query = supabase.from("businesses").select(SIDEBAR_SELECT).eq("status", "approved").eq("is_active", true).limit(200);
    if (excludedCategoryIds.length > 0) query = query.not("category_id", "in", `(${excludedCategoryIds.join(",")})`);
    const { data } = await query;
    // Güne göre sabit ama posta göre de değişen bir tuz kullanılır: aynı gün
    // içinde farklı haberler bu adıma düşerse hepsi aynı 3 işletmeyi değil,
    // kendi kararlı çeşitliliğini görsün (yine de aynı posta her ziyarette
    // aynı sonuç — Math.random() yok).
    const seed = todaySeed() + postId;
    addAll(
      (data ?? []) as unknown as GundemSidebarBusiness[],
      (a, b) => stableHash(seed + a.id) - stableHash(seed + b.id)
    );
  }

  return selected;
}
