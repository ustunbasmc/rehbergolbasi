"use client";

import { useCallback, useEffect, useState } from "react";
import { Inbox, Clock, Flag, Newspaper, PhoneCall, AlertTriangle, type LucideIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
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

export const NOTIFICATION_TYPE_META: Record<NotificationType, { icon: LucideIcon; gradient: string; label: string }> = {
  submission: { icon: Inbox, gradient: "from-navy to-navy-dark", label: "Yeni Başvuru" },
  pending: { icon: Clock, gradient: "from-gold to-gold-dark", label: "Onay Bekliyor" },
  report: { icon: Flag, gradient: "from-bordo to-bordo-dark", label: "İşletme Bildirimi" },
  gundem_report: { icon: Newspaper, gradient: "from-green-500 to-green-600", label: "Gündem Bildirimi" },
  contact: { icon: PhoneCall, gradient: "from-sky-500 to-sky-600", label: "İletişim Talebi" },
  expiry: { icon: AlertTriangle, gradient: "from-violet-500 to-violet-600", label: "Süre Uyarısı" },
};

/**
 * Sidebar'daki dağınık rozet sayılarının (Başvurular/Bekleyenler/Bildirimler/
 * Talepler/Gündem Bildirimleri/Süre Uyarıları) hepsini tek bir listede toplar.
 * Header'daki zil ikonu bunu kullanır — Overview sayfasındaki eski büyük
 * "Bildirimler" kartının yerini alır.
 */
export function useAdminNotifications() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [
      { data: newSubmissions },
      { data: pendingBusinesses },
      { data: listingReports },
      { data: gundemReportsData },
      { data: contactRequests },
      { data: expiryAlertRows },
    ] = await Promise.all([
      supabase
        .from("business_submissions")
        .select("id, business_name, created_at")
        .eq("status", "new")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("businesses")
        .select("id, name, created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("listing_reports")
        .select("id, reason, type, created_at, business:businesses(name)")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("gundem_reports")
        .select("id, reason, created_at, post:gundem_posts(title)")
        .eq("status", "yeni")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("contact_requests")
        .select("id, name, created_at, business:businesses(name)")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("expiry_alerts")
        .select("id, alert_type, created_at, business:businesses(name)")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const notificationItems: NotificationItem[] = [
      ...(newSubmissions ?? []).map((s) => ({
        id: s.id,
        type: "submission" as const,
        title: s.business_name,
        subtitle: "Yeni işletme başvurusu",
        createdAt: s.created_at,
        tab: "submissions" as Tab,
      })),
      ...(pendingBusinesses ?? []).map((b) => ({
        id: b.id,
        type: "pending" as const,
        title: b.name,
        subtitle: "Onay bekliyor",
        createdAt: b.created_at,
        tab: "pending" as Tab,
      })),
      ...(listingReports ?? []).map((r) => ({
        id: r.id,
        type: "report" as const,
        title: (r.business as unknown as { name?: string } | null)?.name ?? "İşletme",
        subtitle: r.type === "claim" ? "Sahiplenme talebi" : r.type === "taxi_info" ? "Taksi bilgisi" : r.reason,
        createdAt: r.created_at,
        tab: "reports" as Tab,
      })),
      ...(gundemReportsData ?? []).map((r) => ({
        id: r.id,
        type: "gundem_report" as const,
        title: (r.post as unknown as { title?: string } | null)?.title ?? "Gündem yazısı",
        subtitle: r.reason,
        createdAt: r.created_at,
        tab: "gundem-reports" as Tab,
      })),
      ...(contactRequests ?? []).map((c) => ({
        id: c.id,
        type: "contact" as const,
        title: (c.business as unknown as { name?: string } | null)?.name ?? c.name,
        subtitle: `İletişim talebi — ${c.name}`,
        createdAt: c.created_at,
        tab: "requests" as Tab,
      })),
      ...(expiryAlertRows ?? []).map((a) => ({
        id: a.id,
        type: "expiry" as const,
        title: (a.business as unknown as { name?: string } | null)?.name ?? "İşletme",
        subtitle:
          a.alert_type === "son_gun"
            ? "Son gün"
            : a.alert_type === "3_gun"
            ? "3 gün kaldı"
            : a.alert_type === "10_gun"
            ? "10 gün kaldı"
            : "Plus süresi doldu",
        createdAt: a.created_at,
        tab: "expiry" as Tab,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    setItems(notificationItems);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    // Sekme açık kalsa bile rozet sayısı güncel kalsın diye 2 dakikada
    // bir otomatik yeniliyor — sekmeyi kapatıp açmaya gerek kalmıyor.
    const interval = setInterval(refresh, 120_000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { items, loading, refresh };
}
