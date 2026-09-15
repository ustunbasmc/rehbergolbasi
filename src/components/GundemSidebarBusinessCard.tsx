"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Store } from "lucide-react";
import { trackBusinessEvent, formatTelHref, isPhoneLike } from "@/lib/analytics";
import type { GundemSidebarBusiness } from "@/lib/gundemSidebar";

export default function GundemSidebarBusinessCard({ business }: { business: GundemSidebarBusiness }) {
  const hasValidPhone = isPhoneLike(business.phone);
  const subtitle = business.neighborhood ?? business.category?.name ?? null;

  return (
    <div className="card-shadow card-shadow-hover flex items-center gap-2.5 rounded-xl bg-white p-2 transition">
      <Link
        href={`/isletme/${business.slug}`}
        onClick={() => trackBusinessEvent(business.id, "profile_click", "gundem_sidebar")}
        className="group flex min-w-0 flex-1 items-center gap-2.5"
      >
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-offwhite">
          {business.cover_image_url ? (
            <Image src={business.cover_image_url} alt="" fill unoptimized sizes="48px" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Store className="h-4 w-4 text-navy/20" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-navy group-hover:text-bordo">{business.name}</p>
          {subtitle && (
            <p className="flex items-center gap-1 truncate text-xs text-ink/50">
              {business.neighborhood && <MapPin className="h-3 w-3 shrink-0" />}
              {subtitle}
            </p>
          )}
        </div>
      </Link>
      {hasValidPhone && (
        <a
          href={formatTelHref(business.phone!)}
          onClick={(e) => {
            e.stopPropagation();
            trackBusinessEvent(business.id, "phone_click", "gundem_sidebar");
          }}
          aria-label={`${business.name} — hemen ara`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bordo/10 text-bordo transition hover:bg-bordo hover:text-white"
        >
          <Phone className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}
