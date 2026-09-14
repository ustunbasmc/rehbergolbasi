"use client";

import type { ReactNode } from "react";
import { trackGundemEvent, type GundemEventType } from "@/lib/analytics";

/**
 * Server Component içindeki bir alt ağacın (ör. BusinessCard) tıklamasını
 * olay olarak kaydetmek için genel amaçlı ince sarmalayıcı. Asıl linkin
 * varsayılan davranışına (navigasyon) müdahale etmez, yalnızca event fırlatır.
 */
export default function GundemClickTrack({
  eventType,
  meta,
  children,
}: {
  eventType: GundemEventType;
  meta?: { postSlug?: string };
  children: ReactNode;
}) {
  return <div onClick={() => trackGundemEvent(eventType, meta)}>{children}</div>;
}
