"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Star, Zap, Megaphone, Copy, ExternalLink, Archive, Flag,
} from "lucide-react";
import GundemEditor from "@/components/admin/GundemEditor";
import { effectiveGundemStatusLabel, isGundemPostPublic } from "@/lib/gundem";
import type { GundemCategory, GundemPost, GundemPostStatus } from "@/lib/types";

type PostRow = GundemPost & { category: GundemCategory | null };

const BASE_URL = "https://rehbergolbasi.com";

export default function GundemList() {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [categories, setCategories] = useState<GundemCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<GundemPostStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [editingPost, setEditingPost] = useState<PostRow | undefined>(undefined);
  const [editingTagIds, setEditingTagIds] = useState<string[]>([]);
  const [editingBusinesses, setEditingBusinesses] = useState<{ id: string; name: string }[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    const { data } = await supabase.from("gundem_categories").select("*").order("display_order");
    setCategories(data ?? []);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("gundem_posts")
      .select("*, category:gundem_categories(*)")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    if (categoryFilter !== "all") query = query.eq("category_id", categoryFilter);
    if (search.trim()) {
      const q = search.trim();
      query = query.or(`title.ilike.%${q}%,summary.ilike.%${q}%,slug.ilike.%${q}%,source_name.ilike.%${q}%`);
    }

    const { data } = await query.limit(100);
    setPosts((data ?? []) as PostRow[]);
    setLoading(false);
  }, [statusFilter, categoryFilter, search]);

  useEffect(() => { loadCategories(); }, [loadCategories]);
  useEffect(() => {
    const timeout = setTimeout(load, 200);
    return () => clearTimeout(timeout);
  }, [load]);

  async function loadRelationsForEdit(post: PostRow) {
    const [{ data: tagRows }, { data: bizRows }] = await Promise.all([
      supabase.from("gundem_post_tags").select("tag_id").eq("post_id", post.id),
      supabase.from("gundem_post_businesses").select("business:businesses(id, name)").eq("post_id", post.id),
    ]);
    setEditingTagIds((tagRows ?? []).map((r) => r.tag_id));
    setEditingBusinesses(
      (bizRows ?? [])
        .map((r) => r.business as unknown as { id: string; name: string } | null)
        .filter((b): b is { id: string; name: string } => !!b)
    );
  }

  function handleNew() {
    setEditingPost(undefined);
    setEditingTagIds([]);
    setEditingBusinesses([]);
    setShowEditor(true);
  }

  async function handleEdit(post: PostRow) {
    await loadRelationsForEdit(post);
    setEditingPost(post);
    setShowEditor(true);
  }

  async function handleQuickStatus(post: PostRow, newStatus: GundemPostStatus) {
    const patch: Record<string, unknown> = { status: newStatus };
    if (newStatus === "published" && !post.published_at) patch.published_at = new Date().toISOString();
    await supabase.from("gundem_posts").update(patch).eq("id", post.id);
    load();
  }

  async function handleDuplicate(post: PostRow) {
    const newTitle = `${post.title} (Kopya)`;
    const newSlug = `${post.slug}-kopya-${Date.now().toString(36)}`;
    const { data } = await supabase
      .from("gundem_posts")
      .insert({
        title: newTitle,
        slug: newSlug,
        summary: post.summary,
        content_markdown: post.content_markdown,
        content_html: post.content_html,
        cover_image_url: post.cover_image_url,
        cover_image_alt: post.cover_image_alt,
        cover_image_caption: post.cover_image_caption,
        image_source: post.image_source,
        category_id: post.category_id,
        neighborhoods: post.neighborhoods,
        source_type: post.source_type,
        source_name: post.source_name,
        source_url: post.source_url,
        author: post.author,
        status: "draft",
        search_text: post.search_text,
      })
      .select("id")
      .single();
    if (data) {
      const [{ data: tagRows }] = await Promise.all([
        supabase.from("gundem_post_tags").select("tag_id").eq("post_id", post.id),
      ]);
      if (tagRows && tagRows.length > 0) {
        await supabase.from("gundem_post_tags").insert(tagRows.map((r) => ({ post_id: data.id, tag_id: r.tag_id })));
      }
    }
    load();
  }

  async function handleSoftDelete(post: PostRow) {
    const confirmed = window.confirm(`"${post.title}" içeriğini silmek istediğine emin misin? (Geri alınabilir — arşiv/çöp kutusuna taşınır)`);
    if (!confirmed) return;
    await supabase.from("gundem_posts").update({ deleted_at: new Date().toISOString() }).eq("id", post.id);
    load();
  }

  async function handleCopySocialText(post: PostRow) {
    const url = `${BASE_URL}/gundem/${post.slug}`;
    const text = `${post.title}\n\n${post.summary}\n\n${url}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(post.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Panoya erişim izni yoksa sessizce yut.
    }
  }

  const filterCounts = useMemo(() => ({ total: posts.length }), [posts]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-navy">Gölbaşı Gündem</h2>
          <p className="text-xs text-ink/50">{filterCounts.total} içerik (silinmemiş)</p>
        </div>
        <button onClick={handleNew} className="flex items-center gap-2 rounded-lg bg-bordo px-4 py-2 text-sm font-bold text-white hover:bg-bordo-dark">
          <Plus className="h-4 w-4" /> Yeni İçerik
        </button>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Başlık, özet, slug veya kaynak adına göre ara..."
          className="flex-1 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as GundemPostStatus | "all")} className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo">
          <option value="all">Tüm durumlar</option>
          <option value="draft">Taslak</option>
          <option value="scheduled">Zamanlanmış</option>
          <option value="published">Yayında</option>
          <option value="archived">Arşivlendi</option>
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo">
          <option value="all">Tüm kategoriler</option>
          {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-ink/40">Yükleniyor...</p>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line p-10 text-center">
          <p className="text-sm text-ink/50">Bu filtrelere uygun içerik yok.</p>
          <button onClick={handleNew} className="mt-3 text-sm font-semibold text-bordo hover:underline">İlk içeriği oluştur →</button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => {
            const publiclyVisible = isGundemPostPublic(post);
            return (
              <div key={post.id} className="card-shadow flex flex-col gap-3 rounded-2xl bg-white p-4 sm:flex-row sm:items-center">
                {post.cover_image_url ? (
                  <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-offwhite">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={post.cover_image_url} alt="" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg bg-offwhite text-[10px] text-ink/30">Görsel yok</div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="truncate font-semibold text-navy">{post.title}</p>
                    {post.is_featured && <Star className="h-3.5 w-3.5 shrink-0 fill-gold text-gold" />}
                    {post.is_breaking && <Zap className="h-3.5 w-3.5 shrink-0 fill-bordo text-bordo" />}
                    {post.is_sponsored && <Megaphone className="h-3.5 w-3.5 shrink-0 text-navy/60" />}
                  </div>
                  <p className="text-xs text-ink/50">
                    /gundem/{post.slug} · {post.category?.name ?? "Kategorisiz"} · {post.author}
                  </p>
                  <p className="mt-0.5 text-xs text-ink/40">
                    {post.neighborhoods.length > 0 ? post.neighborhoods.join(", ") : "Mahalle yok"} · {post.view_count} görüntülenme
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                    publiclyVisible ? "bg-green-50 text-green-700" : post.status === "draft" ? "bg-offwhite text-ink/50" : "bg-gold/15 text-gold-dark"
                  }`}>
                    {effectiveGundemStatusLabel(post)}
                  </span>

                  {publiclyVisible ? (
                    <button onClick={() => handleQuickStatus(post, "draft")} title="Yayından kaldır" className="rounded-lg p-2 text-ink/40 hover:bg-offwhite hover:text-ink"><EyeOff className="h-4 w-4" /></button>
                  ) : (
                    <button onClick={() => handleQuickStatus(post, "published")} title="Hemen yayınla" className="rounded-lg p-2 text-ink/40 hover:bg-offwhite hover:text-green-700"><Eye className="h-4 w-4" /></button>
                  )}
                  <button onClick={() => handleQuickStatus(post, "archived")} title="Arşivle" className="rounded-lg p-2 text-ink/40 hover:bg-offwhite hover:text-ink"><Archive className="h-4 w-4" /></button>
                  <button onClick={() => handleEdit(post)} title="Düzenle" className="rounded-lg p-2 text-ink/40 hover:bg-offwhite hover:text-navy"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDuplicate(post)} title="Çoğalt" className="rounded-lg p-2 text-ink/40 hover:bg-offwhite hover:text-navy"><Copy className="h-4 w-4" /></button>
                  <button onClick={() => handleCopySocialText(post)} title="Sosyal medya metnini kopyala" className="rounded-lg p-2 text-ink/40 hover:bg-offwhite hover:text-navy">
                    {copiedId === post.id ? <span className="text-[10px] font-bold text-green-700">✓</span> : <Flag className="h-4 w-4" />}
                  </button>
                  {publiclyVisible && (
                    <a href={`/gundem/${post.slug}`} target="_blank" rel="noopener noreferrer" title="Public sayfayı aç" className="rounded-lg p-2 text-ink/40 hover:bg-offwhite hover:text-navy">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  <button onClick={() => handleSoftDelete(post)} title="Sil" className="rounded-lg p-2 text-ink/40 hover:bg-offwhite hover:text-bordo"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showEditor && (
        <GundemEditor
          post={editingPost}
          initialTagIds={editingTagIds}
          initialBusinessIds={editingBusinesses}
          onClose={() => setShowEditor(false)}
          onSaved={() => { setShowEditor(false); load(); }}
        />
      )}
    </div>
  );
}
