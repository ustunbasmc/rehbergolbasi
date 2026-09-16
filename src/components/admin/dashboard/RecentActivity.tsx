"use client";

import { Eye, Search, MessageCircle, Phone, Navigation, Activity, type LucideIcon } from "lucide-react";
import { classifyReferrer } from "./moduleStats";

export type ActivityKind = "visit" | "search" | "whatsapp" | "call" | "directions";

export interface RecentActivityItem {
  id: string;
  eventType: string;
  occurredAt: string;
  businessName: string | null;
  query: string | null;
  device: string | null;
  referrer: string | null;
}

interface EventDef {
  label: string;
  kind: ActivityKind;
}

/**
 * Dashboard'daki "Son İşlemler" akışında gösterilecek anlamlı event
 * tipleri — huni/form ara adımları (business_form_view, taxi_location_*,
 * business_photo_upload vb.) burada bilerek YOK: onlar "işlem" değil,
 * teknik ölçüm ayrıntısı; admin için gürültü olur. Bu liste yalnızca
 * kullanıcının sitede gerçekten yaptığı somut eylemleri kapsar.
 */
export const RECENT_ACTIVITY_EVENT_TYPES = [
  "profile_view",
  "business_list_view",
  "taxi_page_view",
  "news_list_view",
  "news_article_view",
  "eczane_page_view",
  "otobus_page_view",
  "home_search_submit",
  "taxi_search",
  "news_search",
  "phone_click",
  "whatsapp_click",
  "directions_click",
] as const;

const EVENT_DEFS: Record<string, EventDef> = {
  profile_view: { label: "İşletme profili görüntülendi", kind: "visit" },
  business_list_view: { label: "İşletme listesi görüntülendi", kind: "visit" },
  taxi_page_view: { label: "Taksi çağır sayfası görüntülendi", kind: "visit" },
  news_list_view: { label: "Gündem listesi görüntülendi", kind: "visit" },
  news_article_view: { label: "Gündem yazısı görüntülendi", kind: "visit" },
  eczane_page_view: { label: "Nöbetçi eczane sayfası görüntülendi", kind: "visit" },
  otobus_page_view: { label: "Otobüs saatleri sayfası görüntülendi", kind: "visit" },
  home_search_submit: { label: "Ana sayfadan arama yapıldı", kind: "search" },
  taxi_search: { label: "Taksi sayfasında arama yapıldı", kind: "search" },
  news_search: { label: "Gündemde arama yapıldı", kind: "search" },
  phone_click: { label: "Telefonla arandı", kind: "call" },
  whatsapp_click: { label: "WhatsApp'tan yazıldı", kind: "whatsapp" },
  directions_click: { label: "Yol tarifi istendi", kind: "directions" },
};

const KIND_META: Record<ActivityKind, { icon: LucideIcon; gradient: string }> = {
  visit: { icon: Eye, gradient: "from-navy to-navy-dark" },
  search: { icon: Search, gradient: "from-gold to-gold-dark" },
  whatsapp: { icon: MessageCircle, gradient: "from-green-500 to-green-600" },
  call: { icon: Phone, gradient: "from-bordo to-bordo-dark" },
  directions: { icon: Navigation, gradient: "from-sky-500 to-sky-600" },
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "az önce";
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} sa önce`;
  const days = Math.floor(hours / 24);
  return `${days} gün önce`;
}

function deviceLabel(device: string | null): string | null {
  if (device === "mobile") return "Mobil";
  if (device === "desktop") return "Masaüstü";
  return null;
}

export default function RecentActivity({ items }: { items: RecentActivityItem[] }) {
  return (
    <div className="card-shadow flex flex-col rounded-2xl bg-white p-4">
      <div className="mb-3 flex items-center gap-1.5">
        <Activity className="h-3.5 w-3.5 text-bordo" />
        <h3 className="font-display text-sm font-bold text-navy">Son İşlemler</h3>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-ink/40">Henüz kaydedilmiş bir işlem yok.</p>
      ) : (
        <div className="flex max-h-[420px] flex-col divide-y divide-line overflow-y-auto">
          {items.map((item) => {
            const def = EVENT_DEFS[item.eventType];
            if (!def) return null;
            const meta = KIND_META[def.kind];
            const Icon = meta.icon;
            const source = [classifyReferrer(item.referrer), deviceLabel(item.device)]
              .filter(Boolean)
              .join(" • ");
            return (
              <div key={item.id} className="flex items-center gap-2.5 py-2">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white ${meta.gradient}`}
                >
                  <Icon className="h-3 w-3" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-navy">{def.label}</p>
                  {(item.businessName || item.query) && (
                    <p className="truncate text-xs text-ink/50">
                      {item.businessName ?? `"${item.query}"`}
                    </p>
                  )}
                  <p className="truncate text-[11px] text-ink/35">Kaynak: {source}</p>
                </div>
                <span className="shrink-0 text-[11px] text-ink/40">{timeAgo(item.occurredAt)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
