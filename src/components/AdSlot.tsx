import Image from "next/image";
import { supabase } from "@/lib/supabase";

export type AdPlacement =
  | "home"
  | "isletmeler_list"
  | "business_detail_square"
  | "business_detail_horizontal"
  | "taksi"
  | "gundem_list"
  | "gundem_detail"
  | "nobetci_eczane"
  | "otobus_saatleri"
  | "rehberler_list";

export type AdVariant = "horizontal" | "square" | "card";

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

const ASPECT_BY_VARIANT: Record<AdVariant, string> = {
  horizontal: "aspect-[21/6] sm:aspect-[21/5]",
  square: "aspect-square",
  card: "aspect-[4/3]",
};

/**
 * Belirli bir sayfa yerleşimindeki (placement) aktif kiralık reklamı gösterir.
 * `variant`, sayfadaki komşu içerikle görsel uyum için şekli belirler:
 * "horizontal" (geniş banner — ör. Taksi Çağır, Ana Sayfa, Gündem listesi),
 * "square" (kare — ör. işletme detayında Çalışma Saatleri altı, kenar
 * çubukları), "card" (işletme/rehber kartlarıyla aynı boy — listelerde
 * doğal akışa karışır ama her zaman "Sponsorlu" etiketiyle işaretlenir).
 * Reklam yoksa (kiralanmamış/süresi geçmiş/pasif) HİÇBİR ŞEY render etmez —
 * asla sahte/placeholder reklam alanı göstermez. Gösterim sayacı server
 * render anında artırılır (bot/crawler isteklerini de sayabilir — basit
 * ama kabul edilebilir bir sınırlama).
 */
export default async function AdSlot({
  placement,
  variant = "horizontal",
  className = "",
}: {
  placement: AdPlacement;
  variant?: AdVariant;
  /** Yalnızca reklam gerçekten render edildiğinde uygulanır — reklam yoksa
   * hiçbir DOM düğümü oluşmadığı için dıştan sarmalayan bir div'e margin
   * koymak "hayalet boşluk" yaratır; bunun yerine margin buradan verilir. */
  className?: string;
}) {
  const ad = await getActiveAd(placement);
  if (!ad) return null;

  supabase.rpc("increment_ad_impression", { p_ad_id: ad.id }).then(() => {});

  return (
    <a
      href={`/api/ads/click?id=${ad.id}`}
      className={`card-shadow card-shadow-hover block overflow-hidden rounded-2xl bg-white transition ${className}`}
    >
      <div className="relative w-full bg-offwhite">
        {ad.image_url ? (
          <div className={`relative w-full ${ASPECT_BY_VARIANT[variant]}`}>
            <Image
              src={ad.image_url}
              alt={ad.title}
              fill
              unoptimized
              sizes={variant === "card" ? "(max-width: 640px) 100vw, 33vw" : "100vw"}
              className="object-cover"
            />
          </div>
        ) : (
          <div className={`flex w-full items-center justify-center ${ASPECT_BY_VARIANT[variant]}`}>
            <span className="text-sm font-semibold text-ink/30">{ad.title}</span>
          </div>
        )}
        <span className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink/60 backdrop-blur-sm">
          Sponsorlu
        </span>
      </div>
      {variant === "card" && (
        <p className="truncate p-3 text-sm font-bold text-navy">{ad.title}</p>
      )}
    </a>
  );
}
