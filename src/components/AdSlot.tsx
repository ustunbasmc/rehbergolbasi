import Image from "next/image";
import Link from "next/link";
import { Megaphone, ArrowRight } from "lucide-react";
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
  | "rehberler_list"
  | "mahalle_detail";

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
 * Reklam yoksa (kiralanmamış/süresi geçmiş/pasif) asla sahte/placeholder
 * reklam GÖRÜNTÜSÜ göstermez — bunun yerine bu boş alanın kendisini
 * tanıtan, /reklam-ver'e yönlendiren bir "kendi reklamımız" kartı gösterir
 * (satılmamış envanteri boşa harcamamak için). Gösterim sayacı server
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
  className?: string;
}) {
  const ad = await getActiveAd(placement);

  if (!ad) {
    return (
      <Link
        href="/reklam-ver"
        className={`card-shadow card-shadow-hover block overflow-hidden rounded-2xl bg-white transition ${className}`}
      >
        <div
          className={`flex w-full items-center justify-center bg-gradient-to-br from-navy/5 to-bordo/10 ${ASPECT_BY_VARIANT[variant]}`}
        >
          <Megaphone className="h-8 w-8 text-navy/20" aria-hidden="true" />
        </div>
        <div className="flex items-center justify-end gap-1.5 border-t border-line px-3 py-2">
          <span className="text-xs font-semibold text-ink/60">Bu alana reklam verebilirsiniz</span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-bordo" />
        </div>
      </Link>
    );
  }

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
