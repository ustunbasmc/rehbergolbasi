"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Tag } from "@/lib/types";
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";

function slugify(text: string) {
  const trMap: Record<string, string> = {
    ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i",
    ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u"
  };
  return text
    .split("")
    .map((ch) => trMap[ch] ?? ch)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function TagManager() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSeoIntro, setEditSeoIntro] = useState("");
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTags = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("tags")
      .select("*")
      .order("display_order", { ascending: true });
    setTags(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  const filtered = search.trim()
    ? tags.filter((t) => t.name.toLowerCase().includes(search.trim().toLowerCase()))
    : tags;

  async function handleAdd() {
    if (!newName.trim()) return;
    setAdding(true);
    setError(null);

    const nextOrder = tags.length > 0 ? Math.max(...tags.map((t) => t.display_order)) + 1 : 1;

    const { error: insertError } = await supabase.from("tags").insert({
      name: newName.trim(),
      slug: slugify(newName.trim()),
      display_order: nextOrder,
    });

    setAdding(false);

    if (insertError) {
      setError("Eklenemedi: " + insertError.message);
      return;
    }

    setNewName("");
    loadTags();
  }

  function startEdit(tag: Tag) {
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditSeoIntro(tag.seo_intro ?? "");
  }

  async function handleSaveEdit(id: string) {
    setError(null);
    const { error: updateError } = await supabase
      .from("tags")
      .update({ name: editName.trim(), seo_intro: editSeoIntro.trim() || null })
      .eq("id", id);

    if (updateError) {
      setError("Güncellenemedi: " + updateError.message);
      return;
    }

    setEditingId(null);
    loadTags();
  }

  async function handleDelete(id: string, name: string) {
    const confirmed = window.confirm(
      `"${name}" etiketini silmek istediğine emin misin? Bu etiketi kullanan işletmelerden de kaldırılacak.`
    );
    if (!confirmed) return;

    await supabase.from("tags").delete().eq("id", id);
    loadTags();
  }

  return (
    <div>
      <div className="card-shadow mb-5 rounded-2xl border border-line bg-white p-5">
        <h3 className="mb-3 font-display text-base font-bold text-navy">Yeni Etiket Ekle</h3>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Etiket adı (örn. Doğum Günü Pastası)"
            className="flex-1 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
          />
          <button
            onClick={handleAdd}
            disabled={adding || !newName.trim()}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-bordo px-4 py-2 text-sm font-bold text-white hover:bg-bordo-dark disabled:opacity-60"
          >
            <Plus className="h-4 w-4" /> Ekle
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-bordo">{error}</p>}
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Etiket ara..."
        className="mb-4 w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
      />

      {loading ? (
        <p className="text-ink/50">Yükleniyor...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((tag) => (
            <div
              key={tag.id}
              className="card-shadow rounded-xl border border-line bg-white px-4 py-3"
            >
              {editingId === tag.id ? (
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-ink/50">
                      Etiket adı
                    </label>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full rounded-lg border border-line px-3 py-1.5 text-sm outline-none focus:border-bordo"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-ink/50">
                      SEO açıklama metni (etiketin kendi sayfasında görünür)
                    </label>
                    <textarea
                      value={editSeoIntro}
                      onChange={(e) => setEditSeoIntro(e.target.value)}
                      rows={3}
                      placeholder="Örn. Gölbaşı'da doğum günü pastası yapan pastane ve kafeler..."
                      className="w-full rounded-lg border border-line px-3 py-1.5 text-sm outline-none focus:border-bordo"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink/50 hover:bg-offwhite"
                    >
                      <X className="h-3.5 w-3.5" /> Vazgeç
                    </button>
                    <button
                      onClick={() => handleSaveEdit(tag.id)}
                      className="flex items-center gap-1 rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-dark"
                    >
                      <Check className="h-3.5 w-3.5" /> Kaydet
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-navy">{tag.name}</span>
                    <span className="ml-2 font-mono text-xs text-ink/40">/{tag.slug}</span>
                    {tag.seo_intro && (
                      <p className="mt-1 line-clamp-1 max-w-md text-xs text-ink/50">
                        {tag.seo_intro}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(tag)}
                      className="rounded-lg border border-line p-1.5 text-ink/50 hover:bg-offwhite"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id, tag.name)}
                      className="rounded-lg border border-line p-1.5 text-bordo hover:bg-bordo/5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}