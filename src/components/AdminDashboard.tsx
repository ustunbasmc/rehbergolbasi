"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Category } from "@/lib/types";
import PendingList from "@/components/admin/PendingList";
import SubmissionsList from "@/components/admin/SubmissionsList";
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
import WorkOrdersList from "@/components/admin/WorkOrdersList";
import BusinessAnalytics from "@/components/admin/BusinessAnalytics";
import GuidesList from "@/components/admin/GuidesList";
import NewBusinessForm from "@/components/admin/NewBusinessForm";
import GlobalSearch from "@/components/admin/GlobalSearch";
import EditBusinessModal from "@/components/admin/EditBusinessModal";
import type { Business } from "@/lib/types";
import MessageTemplates from "@/components/admin/MessageTemplates";
import AnnouncementsManager from "@/components/admin/AnnouncementsManager";
import GundemList from "@/components/admin/GundemList";
import GundemReportsList from "@/components/admin/GundemReportsList";
import AdSlotsManager from "@/components/admin/AdSlotsManager";
import {
  Clock,
  MessageSquareText,
  CheckCircle2,
  Briefcase,
  XCircle,
  LayoutGrid,
  LogOut,
  ListChecks,
  LayoutDashboard,
  Flag,
  Tags as TagsIcon,
  PhoneCall,
  Hash,
  AlertTriangle,
  BookOpen,
  Wallet,
  UserPlus,
  PlusCircle,
  BarChart2,
  Megaphone,
  Inbox,
  Newspaper,
  BadgePercent,
} from "lucide-react";

export type Tab =
  | "overview"
  | "submissions"
  | "pending"
  | "approved"
  | "rejected"
  | "categories"
  | "reports"
  | "features"
  | "requests"
  | "work-orders"
  | "tags"
  | "expiry"
  | "payments"
  | "prospects"
  | "guides"
  | "analytics"
  | "templates"
  | "new-business"
  | "announcements"
  | "gundem"
  | "gundem-reports"
  | "ads";

interface Stats {
  pending: number;
  reports: number;
  requests: number;
  expiryAlerts: number;
  newSubmissions: number;
  gundemReportsPending: number;
}

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [searchSelectedBusiness, setSearchSelectedBusiness] = useState<Business | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<Stats>({
    pending: 0,
    reports: 0,
    requests: 0,
    expiryAlerts: 0,
    newSubmissions: 0,
    gundemReportsPending: 0,
  });

  const loadCategories = useCallback(async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true });
    setCategories(data ?? []);
  }, []);

  const loadStats = useCallback(async () => {
    const [pending, reports, requests, expiryAlerts, newSubmissions, gundemReportsPending] =
      await Promise.all([
        supabase.from("businesses").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("listing_reports").select("id", { count: "exact", head: true }),
        supabase.from("contact_requests").select("id", { count: "exact", head: true }),
        supabase.from("expiry_alerts").select("id", { count: "exact", head: true }),
        supabase.from("business_submissions").select("id", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("gundem_reports").select("id", { count: "exact", head: true }).eq("status", "yeni"),
      ]);
    setStats({
      pending: pending.count ?? 0,
      reports: reports.count ?? 0,
      requests: requests.count ?? 0,
      expiryAlerts: expiryAlerts.count ?? 0,
      newSubmissions: newSubmissions.count ?? 0,
      gundemReportsPending: gundemReportsPending.count ?? 0,
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
  async function handleSearchSelect(businessId: string) {
  const { data } = await supabase
    .from("businesses")
    .select("*, category:categories(id, name, slug)")
    .eq("id", businessId)
    .single();
  if (data) setSearchSelectedBusiness(data);
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
        { key: "submissions", label: "İşletme Başvuruları", icon: Inbox, badge: stats.newSubmissions },
        { key: "new-business", label: "Yeni İşletme Ekle", icon: PlusCircle },
        { key: "pending", label: "Bekleyenler", icon: Clock, badge: stats.pending },
        { key: "approved", label: "Onaylılar", icon: CheckCircle2 },
        { key: "rejected", label: "Reddedilenler", icon: XCircle },
      ],
    },
    {
      title: "Yönetim",
      items: [
        { key: "work-orders", label: "İş Emirleri", icon: Briefcase },
        { key: "expiry", label: "Süre Uyarıları", icon: AlertTriangle, badge: stats.expiryAlerts },
        { key: "payments", label: "Ödemeler", icon: Wallet },
        { key: "prospects", label: "Potansiyel İşletmeler", icon: UserPlus },
        { key: "categories", label: "Kategoriler", icon: LayoutGrid },
        { key: "tags", label: "Etiketler", icon: Hash },
        { key: "features", label: "Özellikler", icon: TagsIcon },
        { key: "guides", label: "Rehberler", icon: BookOpen },
        { key: "announcements", label: "Duyurular", icon: Megaphone },
        { key: "ads", label: "Reklamlar", icon: BadgePercent },
        { key: "gundem", label: "Gölbaşı Gündem", icon: Newspaper },
        { key: "gundem-reports", label: "Gündem Bildirimleri", icon: Flag, badge: stats.gundemReportsPending },
        { key: "templates", label: "Mesaj Şablonları", icon: MessageSquareText },
        { key: "requests", label: "Talepler", icon: PhoneCall, badge: stats.requests },
        { key: "reports", label: "Bildirimler", icon: Flag, badge: stats.reports },
        { key: "analytics", label: "Raporlar", icon: BarChart2 },
      ],
    },
  ];

  const currentLabel = navSections.flatMap((s) => s.items).find((n) => n.key === tab)?.label;

  return (
    <div className="flex min-h-screen w-full max-w-full flex-col overflow-x-hidden bg-offwhite sm:flex-row">
      <aside className="relative flex w-full shrink-0 flex-col gap-2 overflow-hidden bg-gradient-to-br from-navy via-navy to-navy-dark px-4 py-3 sm:min-h-screen sm:w-60 sm:px-4 sm:py-6">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-bordo/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-gold/10 blur-3xl" />

        <div className="relative flex items-center justify-between sm:mb-8 sm:justify-start">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-gold-dark shadow-sm">
              <ListChecks className="h-4 w-4 text-navy" />
            </span>
            <span className="font-display text-sm font-bold text-white">RehberGölbaşı</span>
          </div>
          <button onClick={handleLogout} className="text-xs font-semibold text-white/60 sm:hidden">
            Çıkış
          </button>
        </div>

        <nav className="relative -mx-4 flex flex-row gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-col sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0">
          {navSections.map((section) => (
            <div key={section.title || "root"} className="flex shrink-0 flex-row gap-1 sm:flex-col sm:gap-1">
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
                    className={`relative flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                      active
                        ? "bg-white/10 text-white shadow-inner"
                        : "text-white/55 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {active && <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-gold" />}
                    <Icon className={`h-4 w-4 shrink-0 ${active ? "text-gold" : ""}`} />
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
          className="relative hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white/55 hover:bg-white/5 hover:text-white sm:mt-auto sm:flex"
        >
          <LogOut className="h-4 w-4" /> Çıkış yap
        </button>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="card-shadow flex flex-col gap-3 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
  <div>
    <h1 className="font-display text-xl font-bold text-navy">{currentLabel}</h1>
    <p className="text-xs text-ink/50">RehberGölbaşı yönetim paneli</p>
  </div>
  <GlobalSearch onSelect={handleSearchSelect} />
</header>

        <main className="min-w-0 px-4 py-6 sm:px-8 sm:py-8">
          {tab === "overview" && <Overview onNavigate={setTab} />}
          {tab === "templates" && <MessageTemplates />}
          {tab === "submissions" && <SubmissionsList />}
          {tab === "new-business" && <NewBusinessForm />}
          {tab === "pending" && <PendingList />}
          {tab === "approved" && <ApprovedList categories={categories} />}
          {tab === "rejected" && <RejectedList />}
          {tab === "expiry" && <ExpiryAlertsList />}
          {tab === "payments" && <PaymentsList />}
          {tab === "prospects" && <ProspectsList />}
          {tab === "categories" && <CategoryManager />}
          {tab === "tags" && <TagManager />}
          {tab === "features" && <FeatureManager />}
          {tab === "guides" && <GuidesList />}
          {tab === "announcements" && <AnnouncementsManager />}
          {tab === "ads" && <AdSlotsManager />}
          {tab === "gundem" && <GundemList />}
          {tab === "gundem-reports" && <GundemReportsList />}
          {tab === "requests" && <ContactRequestsList />}
          {tab === "reports" && <ReportsList />}
          {tab === "analytics" && <BusinessAnalytics />}
          {tab === "work-orders" && <WorkOrdersList />}
        </main>
      </div>

      {searchSelectedBusiness && (
        <EditBusinessModal
          business={searchSelectedBusiness}
          categories={categories}
          onClose={() => setSearchSelectedBusiness(null)}
          onSaved={() => { setSearchSelectedBusiness(null); loadStats(); }}
          onDeleted={() => { setSearchSelectedBusiness(null); loadStats(); }}
        />
      )}
    </div>
  );
}