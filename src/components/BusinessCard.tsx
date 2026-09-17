import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Sparkles } from "lucide-react";
import CardQuickActions from "@/components/CardQuickActions";
import { getCardDescription } from "@/lib/businessDescription";
import { getCategoryIcon } from "@/lib/categoryIcons";

interface Business {
  id: string;
  name: string;
  slug: string;
  neighborhood: string | null;
  description: string | null;
  short_description?: string | null;
  cover_image_url: string | null;
  tier: "basic" | "premium";
  is_featured?: boolean;
  phone?: string | null;
  whatsapp?: string | null;
  lat?: number | null;
  lng?: number | null;
  category?: { name: string; icon: string | null } | null;
}

export default function BusinessCard({
  business,
  source,
  isNew,
}: {
  business: Business;
  source?: string;
  isNew?: boolean;
}) {
  const isFeatured = business.is_featured ?? false;
  const cardDescription = getCardDescription(business);
  const CategoryIcon = getCategoryIcon(business.category?.icon ?? null);

  return (
    <div
      className={`card-shadow-hover group flex h-full flex-col overflow-hidden rounded-2xl bg-white transition ${
        isFeatured
          ? "ring-1 ring-gold/40 shadow-[0_4px_20px_rgba(201,162,75,0.28)]"
          : "card-shadow"
      }`}
    >
      <Link href={`/isletme/${business.slug}`} className="flex flex-1 flex-col">
        <div className="relative h-40 w-full bg-offwhite">
          {business.cover_image_url ? (
            <Image
              src={business.cover_image_url}
              alt={business.name}
              fill
              unoptimized
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-navy/5 to-bordo/10">
              <CategoryIcon className="h-7 w-7 text-navy/25" aria-hidden="true" />
              <span className="text-[11px] font-semibold text-navy/35">
                {business.category?.name ?? "Görsel yakında"}
              </span>
            </div>
          )}
          {isFeatured && (
            <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-gold px-2.5 py-1 text-xs font-bold text-gold-dark shadow-sm">
              <Star className="h-3 w-3 fill-gold-dark" /> Öne Çıkan
            </span>
          )}
          {isNew && (
            <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-bordo px-2.5 py-1 text-xs font-bold text-white shadow-sm">
              <Sparkles className="h-3 w-3" /> Yeni
            </span>
          )}
        </div>
        <div
          className={`flex flex-1 flex-col gap-1 p-4 ${isFeatured ? "bg-gold/5" : ""}`}
        >
          <h3 className="font-display text-lg font-bold text-navy">{business.name}</h3>
          {business.neighborhood && (
            <p className="flex items-center gap-1 font-mono text-xs text-ink/50">
              <MapPin className="h-3 w-3" /> {business.neighborhood}
            </p>
          )}
          {cardDescription && (
            <p className="mt-1 line-clamp-2 text-sm text-ink/70">{cardDescription}</p>
          )}
        </div>
      </Link>
      <CardQuickActions
        businessId={business.id}
        phone={business.phone ?? null}
        whatsapp={business.whatsapp ?? null}
        lat={business.lat ?? null}
        lng={business.lng ?? null}
        source={source}
      />
    </div>
  );
}
