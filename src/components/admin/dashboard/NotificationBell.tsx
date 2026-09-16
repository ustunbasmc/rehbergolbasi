"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import type { Tab } from "@/components/AdminDashboard";
import { useAdminNotifications, NOTIFICATION_TYPE_META } from "./useAdminNotifications";

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

export default function NotificationBell({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const { items, refresh } = useAdminNotifications();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function toggle() {
    setOpen((prev) => {
      if (!prev) refresh();
      return !prev;
    });
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={toggle}
        aria-label="Bildirimler"
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-line text-ink/60 transition hover:border-navy hover:text-navy"
      >
        <Bell className="h-4 w-4" />
        {items.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-bordo px-1 text-[10px] font-bold text-white">
            {items.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[340px] max-w-[85vw] overflow-hidden rounded-2xl border border-line bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h3 className="font-display text-sm font-bold text-navy">Bildirimler</h3>
            {items.length > 0 && (
              <span className="rounded-full bg-bordo px-2 py-0.5 text-[10px] font-bold text-white">
                {items.length}
              </span>
            )}
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-ink/40">
                Şu an dikkat gerektiren bir şey yok — hepsi güncel.
              </p>
            ) : (
              <div className="flex flex-col divide-y divide-line">
                {items.map((item) => {
                  const meta = NOTIFICATION_TYPE_META[item.type];
                  const Icon = meta.icon;
                  return (
                    <button
                      key={`${item.type}-${item.id}`}
                      onClick={() => {
                        onNavigate(item.tab);
                        setOpen(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-offwhite"
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
        </div>
      )}
    </div>
  );
}
