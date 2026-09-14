import Link from "next/link";
import Image from "next/image";
import { MapPin, Zap, Megaphone, Newspaper } from "lucide-react";
import type { GundemCategory } from "@/lib/types";

export interface GundemCardData {
  slug: string;
  title: string;
  summary: string;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  published_at: string | null;
  corrected_at: string | null;
  neighborhoods: string[];
  is_sponsored: boolean;
  is_breaking: boolean;
  breaking_until: string | null;
  category: GundemCategory | null;
}

const CATEGORY_COLOR_CLASSES: Record<string, string> = {
  navy: "bg-navy/10 text-navy",
  bordo: "bg-bordo/10 text-bordo",
  gold: "bg-gold/15 text-gold-dark",
};

function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

function isBreakingActive(post: Pick<GundemCardData, "is_breaking" | "breaking_until">): boolean {
  if (!post.is_breaking) return false;
  if (!post.breaking_until) return true;
  return new Date(post.breaking_until).getTime() > Date.now();
}

export default function GundemCard({
  post,
  variant = "normal",
}: {
  post: GundemCardData;
  variant?: "hero" | "normal" | "compact";
}) {
  const categoryColor = post.category?.color ? CATEGORY_COLOR_CLASSES[post.category.color] ?? CATEGORY_COLOR_CLASSES.navy : CATEGORY_COLOR_CLASSES.navy;
  // `corrected_at` yalnızca admin bilinçli olarak "önemli düzeltme" işaretlediğinde
  // dolar — otomatik taslak kaydı (autosave) her düzenlemede `updated_at`'i
  // değiştirdiği için ham updated_at/published_at farkı kullanılmaz (madde 5:
  // yazım hatası düzeltmesi "güncellendi" bildirimi oluşturmamalı).
  const wasUpdated = Boolean(post.corrected_at);
  const isHero = variant === "hero";

  return (
    <Link
      href={`/gundem/${post.slug}`}
      className="card-shadow-hover group flex flex-col overflow-hidden rounded-2xl border border-line bg-white"
    >
      <div className={`relative w-full overflow-hidden bg-offwhite ${isHero ? "aspect-[16/9]" : "aspect-[16/10]"}`}>
        {post.cover_image_url ? (
          <Image
            src={post.cover_image_url}
            alt={post.cover_image_alt ?? post.title}
            fill
            unoptimized
            sizes={isHero ? "(max-width: 768px) 100vw, 800px" : "(max-width: 768px) 50vw, 320px"}
            className="object-cover transition group-hover:scale-[1.02]"
            priority={isHero}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Newspaper className="h-8 w-8 text-navy/15" />
          </div>
        )}
        {isBreakingActive(post) && (
          <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-bordo px-2.5 py-1 text-[10px] font-bold text-white">
            <Zap className="h-3 w-3 fill-white" /> SON DAKİKA
          </span>
        )}
      </div>

      <div className={`flex flex-1 flex-col gap-1.5 ${isHero ? "p-5" : "p-3.5"}`}>
        <div className="flex flex-wrap items-center gap-1.5">
          {post.category && (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${categoryColor}`}>
              {post.category.name}
            </span>
          )}
          {post.is_sponsored && (
            <span className="flex items-center gap-1 rounded-full bg-ink/10 px-2 py-0.5 text-[10px] font-bold text-ink/60">
              <Megaphone className="h-2.5 w-2.5" /> Sponsorlu
            </span>
          )}
        </div>

        <h3 className={`font-display font-bold leading-snug text-navy ${isHero ? "text-xl sm:text-2xl" : "text-sm"}`}>
          {post.title}
        </h3>

        {isHero && <p className="line-clamp-2 text-sm leading-relaxed text-ink/60">{post.summary}</p>}

        <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-1.5 text-[11px] text-ink/40">
          {post.published_at && <time dateTime={post.published_at}>{formatPostDate(post.published_at)}</time>}
          {wasUpdated && <span>· güncellendi</span>}
          {post.neighborhoods.length > 0 && (
            <span className="flex items-center gap-0.5">
              <MapPin className="h-3 w-3" /> {post.neighborhoods[0]}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
