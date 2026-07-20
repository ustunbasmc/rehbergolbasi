import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import {
  MapPin,
  Phone,
  AtSign,
  Award,
  Navigation,
  Link2,
  Sparkles,
  CheckCircle2,
  QrCode,
  Star,
  Hash,
} from "lucide-react";
import PhotoGallery from "@/components/PhotoGallery";
import QuickActions from "@/components/QuickActions";
import BusinessCard from "@/components/BusinessCard";
import ViewCounter from "@/components/ViewCounter";
import WorkingHoursCard from "@/components/WorkingHoursCard";
import ReportButton from "@/components/ReportButton";
import ClaimButton from "@/components/ClaimButton";
import CopyButton from "@/components/CopyButton";
import MenuSection from "@/components/MenuSection";
import FaqAccordion from "@/components/FaqAccordion";
import type { OpeningHours } from "@/lib/types";

export const revalidate = 60;

const SCHEMA_DAY_MAP: Record<keyof OpeningHours, string> = {
  pzt: "Monday",
  sal: "Tuesday",
  car: "Wednesday",
  per: "Thursday",
  cum: "Friday",
  cmt: "Saturday",
  paz: "Sunday",
};

async function getBusinessBasic(slug: string) {
  const { data: business } = await supabase
    .from("businesses")
    .select("*, category:categories(id, name, slug)")
    .eq("slug", slug)
    .eq("status", "approved")
    .single();
  return business;
}

async function getData(slug: string) {
  const business = await getBusinessBasic(slug);
  if (!business) return null;

  const { data: photos } = await supabase
    .from("business_photos")
    .select("*")
    .eq("business_id", business.id)
    .order("display_order", { ascending: true });

  const { data: featureRows } = await supabase
    .from("business_features")
    .select("feature:features(id, name)")
    .eq("business_id", business.id);

  const features = (featureRows ?? [])
    .map((r) => r.feature as unknown as { id: string; name: string } | null)
    .filter((f): f is { id: string; name: string } => !!f);

  const { data: tagRows } = await supabase
    .from("business_tags")
    .select("tag:tags(id, name, slug)")
    .eq("business_id", business.id);

  const tags = (tagRows ?? [])
    .map((r) => r.tag as unknown as { id: string; name: string; slug: string } | null)
    .filter((t): t is { id: string; name: string; slug: string } => !!t);

  const { data: menuItems } = await supabase
    .from("business_menu_items")
    .select("*")
    .eq("business_id", business.id)
    .order("display_order", { ascending: true });

  const { data: faqs } = await supabase
    .from("business_faqs")
    .select("*")
    .eq("business_id", business.id)
    .order("display_order", { ascending: true });

  let similar: typeof business extends infer T ? T[] : never = [];
  if (business.tier !== "premium") {
    const { data: similarData } = await supabase
      .from("businesses")
      .select("*")
      .eq("status", "approved")
      .eq("is_active", true)
      .eq("category_id", business.category_id)
      .neq("id", business.id)
      .order("tier", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(3);
    similar = similarData ?? [];
  }

  return {
    business,
    photos: photos ?? [],
    similar,
    features,
    tags,
    menuItems: menuItems ?? [],
    faqs: faqs ?? [],
  };
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const business = await getBusinessBasic(slug);

  if (!business) {
    return { title: "İşletme Bulunamadı" };
  }

  const title = business.name;
  const description =
    business.description ??
    `${business.name} — Gölbaşı'nda ${business.category?.name ?? "hizmet"}. İletişim bilgileri ve detaylar RehberGölbaşı'nda.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://rehbergolbasi.com/isletme/${slug}`,
    },
    openGraph: {
      title,
      description,
      images: business.cover_image_url ? [business.cover_image_url] : undefined,
    },
    twitter: {
      title,
      description,
      images: business.cover_image_url ? [business.cover_image_url] : undefined,
    },
  };
}

export default async function BusinessPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getData(slug);
  if (!data) notFound();
  const { business, photos, similar, features, tags, menuItems, faqs } = data;

  if (business.is_active === false) {
    redirect(business.category ? `/isletmeler/${business.category.slug}` : "/isletmeler");
  }

  const isPremium = business.tier === "premium";
  const mapsUrl =
    business.lat && business.lng
      ? `https://www.google.com/maps/dir/?api=1&destination=${business.lat},${business.lng}`
      : null;
  const pageUrl = `https://rehbergolbasi.com/isletme/${business.slug}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(pageUrl)}`;
  const isNew =
    new Date(business.created_at).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000;

  const openingHoursSpecification = business.opening_hours
    ? (Object.keys(business.opening_hours) as (keyof OpeningHours)[])
        .filter((day) => !business.opening_hours![day].closed)
        .map((day) => ({
          "@type": "OpeningHoursSpecification",
          dayOfWeek: `https://schema.org/${SCHEMA_DAY_MAP[day]}`,
          opens: business.opening_hours![day].open,
          closes: business.opening_hours![day].close,
        }))
    : undefined;

  const sameAs = [business.instagram_url, business.facebook_url, business.tiktok_url].filter(
    (url): url is string => !!url
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    description: business.description ?? undefined,
    image: business.cover_image_url ?? undefined,
    url: pageUrl,
    telephone: business.phone ?? undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address ?? undefined,
      addressLocality: "Gölbaşı",
      addressRegion: "Ankara",
      addressCountry: "TR",
    },
    geo:
      business.lat && business.lng
        ? { "@type": "GeoCoordinates", latitude: business.lat, longitude: business.lng }
        : undefined,
    openingHoursSpecification,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ViewCounter businessId={business.id} />

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10">
        <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm text-ink/50">
          <Link href="/" className="font-semibold transition-colors hover:text-bordo">
            Anasayfa
          </Link>
          <span>/</span>
          <Link
            href={business.category ? `/isletmeler/${business.category.slug}` : "/isletmeler"}
            className="font-semibold transition-colors hover:text-bordo"
          >
            {business.category ? business.category.name : "Tüm işletmeler"}
          </Link>
          <span>/</span>
          <span className="font-semibold text-navy">{business.name}</span>
        </nav>

        <PhotoGallery
          coverUrl={business.cover_image_url}
          photos={photos}
          businessName={business.name}
          viewCount={business.view_count ?? 0}
          titleSlot={
            <div className="pointer-events-none">
              <div className="mb-2 flex flex-wrap items-center gap-1.5">
                {business.category && (
                  <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                    {business.category.name}
                  </span>
                )}
                {business.neighborhood && (
                  <span className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                    <MapPin className="h-3 w-3" /> {business.neighborhood}
                  </span>
                )}
                {isPremium && (
                  <span className="flex items-center gap-1 rounded-full bg-gold px-2.5 py-1 text-[11px] font-bold text-gold-dark">
                    <Star className="h-3 w-3 fill-gold-dark" /> Öne Çıkan
                  </span>
                )}
                {business.is_founding_member && (
                  <span className="flex items-center gap-1 rounded-full bg-gold px-2.5 py-1 text-[11px] font-bold text-gold-dark">
                    <Award className="h-3 w-3" /> Kurucu Üye
                  </span>
                )}
                {isNew && (
                  <span className="flex items-center gap-1 rounded-full bg-bordo px-2.5 py-1 text-[11px] font-bold text-white">
                    <Sparkles className="h-3 w-3" /> Yeni
                  </span>
                )}
              </div>
              <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                {business.name}
              </h1>
            </div>
          }
        />

        <QuickActions
          phone={business.phone}
          whatsapp={business.whatsapp}
          mapsUrl={mapsUrl}
          businessName={business.name}
        />

        <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-start">
          <div className="flex flex-col gap-5 lg:flex-1">
            <div className="card-shadow rounded-2xl border border-line bg-white p-6">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-ink/40">
                Hakkında
              </h2>
              {business.description ? (
                <p className="whitespace-pre-line leading-relaxed text-ink/80">
                  {business.description}
                </p>
              ) : (
                <p className="text-sm text-ink/40">Henüz açıklama eklenmedi.</p>
              )}

              {features.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {features.map((f) => (
                    <span
                      key={f.id}
                      className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-navy"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-bordo" /> {f.name}
                    </span>
                  ))}
                </div>
              )}

              {tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                  {tags.map((t) => (
                    <Link
                      key={t.id}
                      href={`/etiket/${t.slug}`}
                      className="flex items-center gap-1 rounded-full bg-navy/5 px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:bg-navy/10"
                    >
                      <Hash className="h-3 w-3" /> {t.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <MenuSection items={menuItems} />
            <FaqAccordion faqs={faqs} />
          </div>

          <div className="flex flex-col gap-5 lg:w-96">
            <WorkingHoursCard hours={business.opening_hours} />

            <div className="card-shadow flex flex-col gap-2 rounded-2xl border border-line bg-white p-6">
              <h2 className="mb-1 text-xs font-bold uppercase tracking-wide text-ink/40">
                İletişim
              </h2>
              {business.phone && (
                <div className="flex items-center gap-2.5 rounded-lg border border-line px-3 py-2.5 text-sm font-semibold text-navy transition-colors hover:border-navy">
                  <a href={`tel:${business.phone}`} className="flex flex-1 items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy/5">
                      <Phone className="h-3.5 w-3.5" />
                    </span>
                    {business.phone}
                  </a>
                  <CopyButton text={business.phone} />
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {business.instagram_url && (
                  <a
                    href={business.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs font-semibold text-navy transition-colors hover:border-navy"
                  >
                    <AtSign className="h-3.5 w-3.5" /> Instagram
                  </a>
                )}
                {business.facebook_url && (
                  <a
                    href={business.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs font-semibold text-navy transition-colors hover:border-navy"
                  >
                    <Link2 className="h-3.5 w-3.5" /> Facebook
                  </a>
                )}
                {business.tiktok_url && (
                  <a
                    href={business.tiktok_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs font-semibold text-navy transition-colors hover:border-navy"
                  >
                    <Link2 className="h-3.5 w-3.5" /> TikTok
                  </a>
                )}
              </div>
              {business.address && (
                <div className="flex items-start gap-2 border-t border-line pt-3 text-xs leading-relaxed text-ink/60">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span className="flex-1">{business.address}</span>
                  <CopyButton text={business.address} />
                </div>
              )}
              {business.lat && business.lng && (
                <div className="overflow-hidden rounded-lg border border-line">
                  <iframe
                    title={`${business.name} konumu`}
                    width="100%"
                    height="160"
                    loading="lazy"
                    style={{ border: 0, display: "block" }}
                    src={`https://www.google.com/maps?q=${business.lat},${business.lng}&output=embed`}
                  />
                  {mapsUrl && (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 border-t border-line bg-offwhite py-1.5 text-xs font-semibold text-navy hover:text-bordo"
                    >
                      <Navigation className="h-3.5 w-3.5" /> Yol tarifi al
                    </a>
                  )}
                </div>
              )}
              <div className="flex flex-col gap-1.5 border-t border-line pt-2.5">
                <ReportButton businessId={business.id} />
                <ClaimButton businessId={business.id} />
              </div>
            </div>

            <div className="card-shadow flex flex-col items-center gap-2 rounded-2xl border border-line bg-white p-6">
              <h2 className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink/40">
                <QrCode className="h-3.5 w-3.5" /> QR Kod
              </h2>
              <div className="relative h-32 w-32 overflow-hidden rounded-lg border border-line">
                <Image src={qrUrl} alt={`${business.name} QR kod`} fill sizes="128px" unoptimized />
              </div>
              <a
                href={qrUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 text-xs font-semibold text-bordo hover:underline"
              >
                Büyük görüntüle / indir
              </a>
            </div>
          </div>
        </div>

        {similar.length > 0 && (
          <div className="mt-10 border-t border-line pt-8">
            <h2 className="mb-4 font-display text-xl font-bold text-navy">Benzer İşletmeler</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {similar.map((b) => (
                <BusinessCard key={b.id} business={b} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}