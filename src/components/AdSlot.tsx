import Image from "next/image";
import { supabase } from "@/lib/supabase";

export type AdPlacement =
  | "gundem_list"
  | "gundem_detail"
  | "business_detail"
  | "taksi"
  | "nobetci_eczane"
  | "otobus_saatleri";

interface Ad {
  id: string;
  title: string;
  image_url: string | null;
  link_url: string;
}

async function getActiveAd(placement: AdPlacement): Promise<Ad | null> {
  try {
    const nowIso = new Date().toISOString();
    const { data } = await supabase
      .from("ad_slots")
      .select("id, title, image_url, link_url")
      .eq("placement", placement)
      .eq("is_active", true)
      .lte("starts_at", nowIso)
      .gte("ends_at", nowIso)
      .order("display_order", { ascending: true })
      .limit(1)
      .maybeSingle();
    return data ?? null;
  } catch {
    return null;
  }
}

/**
 * Belirli bir sayfa yerleşimindeki (placement) aktif kiralık reklamı gösterir.
 * Reklam yoksa (kiralanmamış/süresi geçmiş/pasif) HİÇBİR ŞEY render etmez —
 * asla sahte/placeholder reklam alanı göstermez (bu oturumun "veri doğruluğu"
 * ilkesiyle tutarlı). Gösterim sayacı burada, server render anında artırılır
 * — ayrı bir client tracker gerekmez; bu, bot/crawler isteklerini de
 * sayabileceği anlamına gelir (basit ama kabul edilebilir bir sınırlama).
 */
export default async function AdSlot({ placement }: { placement: AdPlacement }) {
  const ad = await getActiveAd(placement);
  if (!ad) return null;

  supabase.rpc("increment_ad_impression", { p_ad_id: ad.id }).then(() => {});

  return (
    <a
      href={`/api/ads/click?id=${ad.id}`}
      className="card-shadow block overflow-hidden rounded-2xl bg-white"
    >
      <div className="flex items-center justify-between px-4 pt-3">
        <span className="rounded-full bg-ink/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink/50">
          Sponsorlu
        </span>
      </div>
      {ad.image_url && (
        <div className="relative mt-2 aspect-[16/9] w-full bg-offwhite">
          <Image src={ad.image_url} alt={ad.title} fill unoptimized className="object-cover" />
        </div>
      )}
      <p className="p-4 text-sm font-semibold text-navy">{ad.title}</p>
    </a>
  );
}
