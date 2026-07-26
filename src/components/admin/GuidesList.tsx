"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Pencil, Trash2, Eye, EyeOff, Star } from "lucide-react";
import GuideEditor from "@/components/admin/GuideEditor";

interface Guide {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  read_time: number;
  seo_title: string | null;
  seo_description: string | null;
  published: boolean;
  featured: boolean;
  created_at: string;
}

export default function GuidesList() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGuide, setEditingGuide] = useState<Guide | undefined>(undefined);
  const [showEditor, setShowEditor] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("guides")
      .select("*")
      .order("created_at", { ascending: false });
    setGuides(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleTogglePublish(guide: Guide) {
    await supabase
      .from("guides")
      .update({ published: !guide.published, updated_at: new Date().toISOString() })
      .eq("id", guide.id);
    load();
  }

  async function handleToggleFeatured(guide: Guide) {
    await supabase
      .from("guides")
      .update({ featured: !guide.featured, updated_at: new Date().toISOString() })
      .eq("id", guide.id);
    load();
  }

  async function handleDelete(guide: Guide) {
    const confirmed = window.confirm(`"${guide.title}" rehberini silmek istediğine emin misin?`);
    if (!confirmed) return;
    await supabase.from("guides").delete().eq("id", guide.id);
    load();
  }

  function handleNew() {
    setEditingGuide(undefined);
    setShowEditor(true);
  }

  function handleEdit(guide: Guide) {
    setEditingGuide(guide);
    setShowEditor(true);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-navy">Rehberler</h2>
          <p className="text-xs text-ink/50">{guides.length} rehber yazısı</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 rounded-lg bg-bordo px-4 py-2 text-sm font-bold text-white hover:bg-bordo-dark"
        >
          <Plus className="h-4 w-4" /> Yeni Rehber
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-ink/40">Yükleniyor...</p>
      ) : guides.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line p-10 text-center">
          <p className="text-sm text-ink/50">Henüz rehber yazısı yok.</p>
          <button
            onClick={handleNew}
            className="mt-3 text-sm font-semibold text-bordo hover:underline"
          >
            İlk rehberi oluştur →
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {guides.map((guide) => (
            <div
              key={guide.id}
              className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4"
            >
              {guide.cover_image_url && (
                <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-offwhite">
                  <img
                    src={guide.cover_image_url}
                    alt={guide.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold text-navy">{guide.title}</p>
                  {guide.featured && (
                    <Star className="h-3.5 w-3.5 shrink-0 fill-gold text-gold" />
                  )}
                </div>
                <p className="text-xs text-ink/50">
                  /rehberler/{guide.slug} · {guide.read_time} dk okuma
                </p>
                {guide.excerpt && (
                  <p className="mt-1 truncate text-xs text-ink/60">{guide.excerpt}</p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                    guide.published
                      ? "bg-green-50 text-green-700"
                      : "bg-offwhite text-ink/50"
                  }`}
                >
                  {guide.published ? "Yayında" : "Taslak"}
                </span>

                <button
                  onClick={() => handleTogglePublish(guide)}
                  title={guide.published ? "Yayından kaldır" : "Yayınla"}
                  className="rounded-lg p-2 text-ink/40 hover:bg-offwhite hover:text-ink"
                >
                  {guide.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>

                <button
                  onClick={() => handleToggleFeatured(guide)}
                  title={guide.featured ? "Öne çıkarmayı kaldır" : "Öne çıkar"}
                  className="rounded-lg p-2 text-ink/40 hover:bg-offwhite hover:text-ink"
                >
                  <Star className={`h-4 w-4 ${guide.featured ? "fill-gold text-gold" : ""}`} />
                </button>

                <button
                  onClick={() => handleEdit(guide)}
                  className="rounded-lg p-2 text-ink/40 hover:bg-offwhite hover:text-navy"
                >
                  <Pencil className="h-4 w-4" />
                </button>

                <button
                  onClick={() => handleDelete(guide)}
                  className="rounded-lg p-2 text-ink/40 hover:bg-offwhite hover:text-bordo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showEditor && (
        <GuideEditor
          guide={editingGuide}
          onClose={() => setShowEditor(false)}
          onSaved={() => { setShowEditor(false); load(); }}
        />
      )}
    </div>
  );
}