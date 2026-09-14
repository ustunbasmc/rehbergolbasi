"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { trackGundemEvent, type GundemEventType } from "@/lib/analytics";

/**
 * Server Component sayfalarından (haber detay/liste) tıklama olayı
 * kaydetmek için ince bir istemci sarmalayıcı — Server Component'ler
 * doğrudan istemci fonksiyonu (onClick) prop'u geçemez.
 */
export default function GundemTrackedLink({
  href,
  eventType,
  meta,
  className,
  children,
}: {
  href: string;
  eventType: GundemEventType;
  meta?: { category?: string; postSlug?: string };
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} onClick={() => trackGundemEvent(eventType, meta)} className={className}>
      {children}
    </Link>
  );
}
