"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Category } from "@/lib/types";
import PendingList from "@/components/admin/PendingList";
import ApprovedList from "@/components/admin/ApprovedList";
import RejectedList from "@/components/admin/RejectedList";
import CategoryManager from "@/components/admin/CategoryManager";
import ReportsList from "@/components/admin/ReportsList";
import FeatureManager from "@/components/admin/FeatureManager";
import ContactRequestsList from "@/components/admin/ContactRequestsList";
import TagManager from "@/components/admin/TagManager";
import ExpiryAlertsList from "@/components/admin/ExpiryAlertsList";
import PaymentsList from "@/components/admin/PaymentsList";
import ProspectsList from "@/components/admin/ProspectsList";
import Overview from "@/components/admin/Overview";
import BusinessAnalytics from "@/components/admin/BusinessAnalytics";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  LayoutGrid,
  LogOut,
  ListChecks,
  LayoutDashboard,
  Flag,
  Tags as TagsIcon,
  PhoneCall,
  Hash,
  AlertTriangle,
  Wallet,
  UserPlus,
  BarChart2,
} from "lucide-react";

type Tab =
  | "overview"
  | "pending"
  | "approved"
  | "rejected"
  | "categories"
  | "reports"
  | "features"
  | "requests"
  | "tags"
  | "expiry"
  | "payments"
  | "prospects"
  | "analytics";

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  reports: number;
  requests: number;
  expiryAlerts: number;
}

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    reports: 0,
    requests: 0,
    expiryAlerts: 0,
  });

  const loadCategories = useCallback(async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true });
    setCategories(data ?? []);
  }, []);

  const loadStats = useCallback(async () => {
    const [total, pending, approved, rejected, reports, requests, expiryAlerts] = await Promise.all([
      supabase.from("businesses").select("id", { count: "exact", head: true }),
      supabase.from("businesses").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("businesses").select("id", { count: "exact", head: true }).eq("status", "approved"),
      supabase.from("businesses").select("id", { count: "exact", head: true }).eq("status", "rejected"),
      supabase.from("listing_reports").select("id", { count: "exact", head: true }),
      supabase.from("contact_requests").select("id", { count: "exact", head: true }),
      supabase.from("expiry_alerts").select("id", { count: "exact", head: true }),
    ]);
    setStats({
      total: total.count ?? 0,
      pending: pending.count ?? 0,
      approved: approved.count ?? 0,
      rejected: rejected.count ?? 0,
      reports: reports.count ?? 0,
      requests: requests.count ?? 0,
      expiryAlerts: expiryAlerts.count ?? 0,
    });
  }, []);

  useEffect(() => {
    loadCategories();
    loadStats();
  }, [loadCategories, loadStats]);

  useEffect(() => {
    loadStats();
  }, [tab, loadStats]);

  async function handleLogout() {
    await supabase.auth.signOut();
    onLogout();
  }

  type NavItem = { key: Tab; label: string; icon: React.ElementType; badge?: number };
  type NavSection = { title: string; items: NavItem[] };

  const navSections: NavSection[] = [
    {
      title: "",
      items: [{ key: "overview", label: "Genel Bakış", icon: LayoutDashboard }],
    },
    {
      title: "Başvurular",
      items: [
        { key: "pending", label: "Bekleyenler", icon: Clock, badge: stats.pending },
        { key: "approved", label: "Onaylılar", icon: CheckCircle2 },
        { key: "rejected", label: "Reddedilenler", icon: XCircle },
      ],
    },
    {
      title: "Yönetim",
      items: [
        { key: "expiry", label: "Süre Uyarıları", icon: AlertTriangle, badge: stats.expiryAlerts },
        { key: "payments", label: "Ödemeler", icon: Wallet },
        { key: "prospects", label: "Potansiyel İşletmeler", icon: UserPlus },
        { key: "categories", label: "Kategoriler", icon: LayoutGrid },
        { key: "tags", label: "Etiketler", icon: Hash },
        { key: "features", label: "Özellikler", icon: TagsIcon },
        { key: "requests", label: "Talepler", icon: PhoneCall, badge: stats.requests },
        { key: "reports", label: "Bildirimler", icon: Flag, badge: stats.reports },
        { key: "analytics", label: "Raporlar", icon: BarChart2 },
      ],
    },
  ];

  const statCards = [
    { label: "Toplam İşletme", value: stats.total, icon: Building2 },
    { label: "Bekleyen", value: stats.pending, icon: Clock },
    { label: "Onaylı", value: stats.approved, icon: CheckCircle2 },
    { label: "Reddedilen", value: stats.rejected, icon: XCircle },
  ];

  const currentLabel = navSections.flatMap((s) => s.items).find((n) => n.key === tab)?.label;

  return (
    <div className="flex min-h-screen w-full max-w-full flex-col overflow-x-hidden bg-offwhite sm:flex-row">
      <aside className="flex w-full shrink-0 flex-col gap-2 bg-navy px-4 py-3 sm:min-h-screen sm:w-56 sm:px-4 sm:py-6">
        <div className="flex items-center justify-between sm:mb-8 sm:justify-start">
          <div className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-gold" />
            <span className="font-display text-sm font-bold text-white">RehberGölbaşı</span>
          </div>
          <button onClick={handleLogout} className="text-xs font-semibold text-white/60 sm:hidden">
            Çıkış
          </button>
        </div>

        <nav className="-mx-4 flex flex-row gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-col sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0">
          {navSections.map((section) => (
            <div key={section.title || "root"} className="flex shrink-0 flex-row gap-1 sm:flex-col">
              {section.title && (
                <p className="hidden px-3 text-[10px] font-bold uppercase tracking-wider text-white/30 sm:block">
                  {section.title}
                </p>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = tab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setTab(item.key)}
                    className={`relative flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                      active
                        ? "bg-white/10 text-white"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="hidden sm:inline">{item.label}</span>
                    {!!item.badge && (
                      <span className="absolute -right-0.5 -top-0.5 rounded-full bg-gold px-1.5 py-0.5 text-[9px] font-bold text-gold-dark sm:static sm:ml-auto sm:px-2 sm:text-[10px]">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white/60 hover:bg-white/5 hover:text-white sm:mt-auto sm:flex"
        >
          <LogOut className="h-4 w-4" /> Çıkış yap
        </button>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="card-shadow flex items-center justify-between border-b border-line bg-white px-5 py-4 sm:px-8">
          <div>
            <h1 className="font-display text-xl font-bold text-navy">{currentLabel}</h1>
            <p className="text-xs text-ink/50">RehberGölbaşı yönetim paneli</p>
          </div>
        </header>

        <main className="min-w-0 px-4 py-6 sm:px-8 sm:py-8">
          {tab === "overview" && (
            <>
              <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                {statCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={card.label}
                      className="card-shadow rounded-2xl border border-line bg-white p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-semibold text-ink/50">{card.label}</span>
                        <Icon className="h-4 w-4 text-bordo" />
                      </div>
                      <span className="font-display text-2xl font-bold text-navy">
                        {card.value}
                      </span>
                    </div>
                  );
                })}
              </div>
              <Overview />
            </>
          )}

          {tab === "pending" && <PendingList />}
          {tab === "approved" && <ApprovedList categories={categories} />}
          {tab === "rejected" && <RejectedList />}
          {tab === "expiry" && <ExpiryAlertsList />}
          {tab === "payments" && <PaymentsList />}
          {tab === "prospects" && <ProspectsList />}
          {tab === "categories" && <CategoryManager />}
          {tab === "tags" && <TagManager />}
          {tab === "features" && <FeatureManager />}
          {tab === "requests" && <ContactRequestsList />}
          {tab === "reports" && <ReportsList />}
          {tab === "analytics" && <BusinessAnalytics />}
        </main>
      </div>
    </div>
  );
}