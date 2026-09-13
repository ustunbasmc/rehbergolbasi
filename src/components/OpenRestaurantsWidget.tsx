"use client";

import Image from "next/image";
import Link from "next/link";
import { Phone, MessageCircle, Star, UtensilsCrossed } from "lucide-react";
import { trackBusinessEvent, formatTelHref, formatWhatsappUrl } from "@/lib/analytics";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  tier: string;
  is_featured: boolean;
  cover_image_url: string | null;
  neighborhood: string | null;
  phone: string | null;
  whatsapp: string | null;
}

export default function OpenRestaurantsWidget({
  restaurants,
}: {
  restaurants: Restaurant[];
}) {
  return (
    <section className="overflow-hidden rounded-3xl bg-navy px-6 py-10 sm:px-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            <span className="text-xs font-bold uppercase tracking-wide text-green-300">
              Şu an açık
            </span>
          </div>
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-white">
            <UtensilsCrossed className="h-5 w-5 text-gold" /> Karnın mı Acıktı?
          </h2>
          <p className="text-sm text-white/60">
            Şu an açık olan restoranlar — tek tuşla ara, paketini söyle.
          </p>
        </div>
      </div>

      {restaurants.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {restaurants.map((b) => (
            <div
              key={b.id}
              className={`flex items-center gap-3 rounded-2xl bg-white p-3 ${
                b.is_featured ? "ring-2 ring-gold" : ""
              }`}
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-offwhite">
                {b.cover_image_url ? (
                  <Image
                    src={b.cover_image_url}
                    alt={b.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center font-display text-lg font-bold text-navy/20">
                    {b.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/isletme/${b.slug}`}
                  className="flex items-center gap-1 truncate text-sm font-bold text-navy hover:text-bordo"
                >
                  {b.is_featured && (
                    <Star className="h-3 w-3 shrink-0 fill-gold text-gold" />
                  )}
                  <span className="truncate">{b.name}</span>
                </Link>
                {b.neighborhood && (
                  <p className="truncate text-xs text-ink/50">{b.neighborhood}</p>
                )}
              </div>
              <div className="flex shrink-0 gap-1.5">
                {b.phone && (
                  <a
                    href={formatTelHref(b.phone)}
                    onClick={() => trackBusinessEvent(b.id, "phone_click")}
                    aria-label={`${b.name} işletmesini ara`}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-bordo text-white transition-colors hover:bg-bordo-dark"
                  >
                    <Phone className="h-4 w-4" />
                  </a>
                )}
                {b.whatsapp && (
                  <a
                    href={formatWhatsappUrl(b.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackBusinessEvent(b.id, "whatsapp_click")}
                    aria-label={`${b.name} işletmesine WhatsApp'tan yaz`}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-navy/10 text-navy transition-colors hover:bg-navy hover:text-white"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-white/10 p-6 text-center">
          <p className="text-sm text-white/70">
            Şu an açık olan restoran bulunmuyor. Yakında yeni işletmeler açılınca burada listelenecek! 🍽️
          </p>
        </div>
      )}
    </section>
  );
}