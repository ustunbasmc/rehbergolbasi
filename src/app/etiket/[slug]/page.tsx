import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import CategoryResults from "@/components/CategoryResults";
import { Hash } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 60;

async function getData(slug: string) {
  const { data: tag } = await supabase
    .from("tags")
    .select("*")
    .eq("slug", slug)
    .single();
  if (!tag) return null;

  const { data: businessTags } = await supabase
    .from("business_tags")
    .select("business_id")
    .eq("tag_id", tag.id);

  const businessIds = (businessTags ?? []).map((bt) => bt.business_id);

  if (businessIds.length === 0) {
    return { tag, businesses: [] };
  }

  const { data: businesses } = await supabase
    .from("businesses")
    .select("*")
    .eq("status", "approved")
    .in("id", businessIds)
    .order("tier", { ascending: false })
    .order("created_at", { ascending: false });

  return { tag, businesses: businesses ?? [] };
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getData(slug);
  if (!data) {
    return { title: "Etiket Bulunamadı" };
  }
  const { tag, businesses } = data;
  const title = tag.name;
  const description =
    tag.seo_intro ??
    `Gölbaşı'nda "${tag.name.toLowerCase()}" etiketine sahip ${businesses.length} işletme. RehberGölbaşı'nda keşfet.`;
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description },
  };
}

export default async function TagPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getData(slug);
  if (!data) notFound();
  const { tag, businesses } = data;

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10">
      <div className="relative overflow-hidden rounded-3xl bg-navy px-6 py-10 sm:px-10 sm:py-12">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 90% 15%, rgba(201,162,75,0.18), transparent 55%)",
          }}
        />
        <div className="relative">
          <Link
            href="/isletmeler"
            className="mb-4 inline-block text-xs font-semibold text-white/60 transition-colors hover:text-white"
          >
            ← Tüm işletmeler
          </Link>
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-gold backdrop-blur-sm">
              <Hash className="h-7 w-7" />
            </span>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {tag.name}
              </h1>
              <p className="text-sm text-white/60">{businesses.length} işletme</p>
            </div>
          </div>
          {tag.seo_intro && (
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
              {tag.seo_intro}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <CategoryResults businesses={businesses} />
      </div>
    </div>
  );
}