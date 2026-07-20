import Link from "next/link";
import Image from "next/image";
import { MapPin, Star } from "lucide-react";

interface Business {
  id: string;
  name: string;
  slug: string;
  neighborhood: string | null;
  description: string | null;
  cover_image_url: string | null;
  tier: "basic" | "premium";
}

export default function BusinessCard({ business }: { business: Business }) {
  const isPremium = business.tier === "premium";

  return (
    <Link
      href={`/isletme/${business.slug}`}
      className={`card-shadow-hover group flex flex-col overflow-hidden rounded-2xl bg-white transition ${
        isPremium
          ? "border-2 border-gold shadow-[0_4px_18px_rgba(201,162,75,0.25)]"
          : "card-shadow border border-line"
      }`}
    >
      <div className="relative h-40 w-full bg-offwhite">
        {business.cover_image_url ? (
          <Image
            src={business.cover_image_url}
            alt={business.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-2xl font-bold text-navy/20">
            {business.name.charAt(0)}
          </div>
        )}
        {isPremium && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-gold px-2.5 py-1 text-xs font-bold text-gold-dark shadow-sm">
            <Star className="h-3 w-3 fill-gold-dark" /> Öne Çıkan
          </span>
        )}
      </div>
      <div
        className={`flex flex-1 flex-col gap-1 p-4 ${isPremium ? "bg-gold/5" : ""}`}
      >
        <h3 className="font-display text-lg font-bold text-navy">{business.name}</h3>
        {business.neighborhood && (
          <p className="flex items-center gap-1 font-mono text-xs text-ink/50">
            <MapPin className="h-3 w-3" /> {business.neighborhood}
          </p>
        )}
        {business.description && (
          <p className="mt-1 line-clamp-2 text-sm text-ink/70">{business.description}</p>
        )}
      </div>
    </Link>
  );
}