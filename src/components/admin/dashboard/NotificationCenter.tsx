"use client";

import { Inbox, Clock, Flag, Newspaper, PhoneCall, AlertTriangle, type LucideIcon } from "lucide-react";
import type { Tab } from "@/components/AdminDashboard";

export type NotificationType = "submission" | "pending" | "report" | "gundem_report" | "contact" | "expiry";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  subtitle: string;
  createdAt: string;
  tab: Tab;
}

const TYPE_META: Record<NotificationType, { icon: LucideIcon; gradient: string; label: string }> = {
  submission: { icon: Inbox, gradient: "from-navy to-navy-dark", label: "Yeni Başvuru" },
  pending: { icon: Clock, gradient: "from-gold to-gold-dark", label: "Onay Bekliyor" },
  report: { icon: Flag, gradient: "from-bordo to-bordo-dark", label: "İşletme Bildirimi" },
  gundem_report: { icon: Newspaper, gradient: "from-green-500 to-green-600", label: "Gündem Bildirimi" },
  contact: { icon: PhoneCall, gradient: "from-sky-500 to-sky-600", label: "İletişim Talebi" },
  expiry: { icon: AlertTriangle, gradient: "from-violet-500 to-violet-600", label: "Süre Uyarısı" },
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

/**
 * Dashboard'daki tek, birleşik bildirim merkezi — sidebar'daki dağınık
 * rozet sayılarının (Başvurular/Bekleyenler/Bildirimler/Talepler/Gündem
 * Bildirimleri/Süre Uyarıları) hepsini tek bir listede, en yeniden en
 * eskiye, tıklanabilir şekilde toplar. Bir öğeye tıklamak ilgili sekmeye
 * geçer (bkz. AdminDashboard'daki `onNavigate`/`setTab`).
 */
export default function NotificationCenter({
  items,
  onNavigate,
}: {
  items: NotificationItem[];
  onNavigate: (tab: Tab) => void;
}) {
  return (
    <div className="card-shadow rounded-2xl bg-white p-5">
      <div className="mb-4 flex items-center gap-1.5">
        <Flag className="h-4 w-4 text-bordo" />
        <h3 className="font-display text-base font-bold text-navy">Bildirimler</h3>
        {items.length > 0 && (
          <span className="rounded-full bg-bordo px-2 py-0.5 text-[10px] font-bold text-white">
            {items.length}
          </span>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-ink/40">Şu an dikkat gerektiren bir şey yok — hepsi güncel.</p>
      ) : (
        <div className="flex flex-col divide-y divide-line">
          {items.map((item) => {
            const meta = TYPE_META[item.type];
            const Icon = meta.icon;
            return (
              <button
                key={`${item.type}-${item.id}`}
                onClick={() => onNavigate(item.tab)}
                className="flex w-full items-center gap-3 py-2.5 text-left transition hover:bg-offwhite"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white ${meta.gradient}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-navy">{item.title}</p>
                  <p className="truncate text-xs text-ink/50">
                    {meta.label} · {item.subtitle}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] text-ink/40">{timeAgo(item.createdAt)}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
