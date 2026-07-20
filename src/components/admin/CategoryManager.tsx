"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import type { Category } from "@/lib/types";
import { Pencil, Trash2, Plus, Check, X, CornerDownRight, Search } from "lucide-react";

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

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSeoIntro, setEditSeoIntro] = useState("");
  const [editParentId, setEditParentId] = useState<string>("");
  const [newName, setNewName] = useState("");
  const [newParentId, setNewParentId] = useState<string>("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true });
    setCategories(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const topLevel = categories.filter((c) => !c.parent_id);
  const childrenOf = useCallback(
    (parentId: string) => categories.filter((c) => c.parent_id === parentId),
    [categories]
  );

  const searchLower = search.trim().toLowerCase();

  const searchResults = useMemo(() => {
    if (!searchLower) return [];
    return categories.filter((c) => c.name.toLowerCase().includes(searchLower));
  }, [categories, searchLower]);

  function categoryLabel(cat: Category): string {
    if (!cat.parent_id) return cat.name;
    const parent = categories.find((c) => c.id === cat.parent_id);
    return parent ? `${parent.name} > ${cat.name}` : cat.name;
  }

  async function handleAdd() {
    if (!newName.trim()) return;
    setAdding(true);
    setError(null);

    const nextOrder = categories.length > 0
      ? Math.max(...categories.map((c) => c.display_order)) + 1
      : 1;

    const { error: insertError } = await supabase.from("categories").insert({
      name: newName.trim(),
      slug: slugify(newName.trim()),
      display_order: nextOrder,
      parent_id: newParentId || null,
    });

    setAdding(false);

    if (insertError) {
      setError("Eklenemedi: " + insertError.message);
      return;
    }

    setNewName("");
    setNewParentId("");
    loadCategories();
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditSeoIntro(cat.seo_intro ?? "");
    setEditParentId(cat.parent_id ?? "");
  }

  async function handleSaveEdit(id: string) {
    setError(null);
    const { error: updateError } = await supabase
      .from("categories")
      .update({
        name: editName.trim(),
        seo_intro: editSeoIntro.trim() || null,
        parent_id: editParentId || null,
      })
      .eq("id", id);

    if (updateError) {
      setError("Güncellenemedi: " + updateError.message);
      return;
    }

    setEditingId(null);
    loadCategories();
  }

  async function handleDelete(id: string, name: string) {
    const { count } = await supabase
      .from("businesses")
      .select("id", { count: "exact", head: true })
      .eq("category_id", id);

    const { count: subCount } = await supabase
      .from("categories")
      .select("id", { count: "exact", head: true })
      .eq("parent_id", id);

    if (count && count > 0) {
      window.alert(
        `"${name}" kategorisinde ${count} işletme var. Önce bu işletmeleri başka bir kategoriye taşımadan silemezsin.`
      );
      return;
    }
    if (subCount && subCount > 0) {
      window.alert(
        `"${name}" kategorisinin ${subCount} alt kategorisi var. Önce onları silmen veya taşıman gerekiyor.`
      );
      return;
    }

    const confirmed = window.confirm(`"${name}" kategorisini silmek istediğine emin misin?`);
    if (!confirmed) return;

    await supabase.from("categories").delete().eq("id", id);
    loadCategories();
  }

  function renderEditForm(cat: Category) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-line bg-white px-4 py-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-ink/50">Kategori adı</label>
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full rounded-lg border border-line px-3 py-1.5 text-sm outline-none focus:border-bordo"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-ink/50">Üst kategori</label>
          <select
            value={editParentId}
            onChange={(e) => setEditParentId(e.target.value)}
            className="w-full rounded-lg border border-line px-3 py-1.5 text-sm outline-none focus:border-bordo"
          >
            <option value="">Ana kategori (üst kategori yok)</option>
            {topLevel
              .filter((c) => c.id !== cat.id)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-ink/50">
            SEO açıklama metni
          </label>
          <textarea
            value={editSeoIntro}
            onChange={(e) => setEditSeoIntro(e.target.value)}
            rows={3}
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
            onClick={() => handleSaveEdit(cat.id)}
            className="flex items-center gap-1 rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-dark"
          >
            <Check className="h-3.5 w-3.5" /> Kaydet
          </button>
        </div>
      </div>
    );
  }

  function renderRow(cat: Category, indented: boolean) {
    return (
      <div
        key={cat.id}
        className={`card-shadow flex items-center justify-between rounded-xl border border-line bg-white px-4 py-3 ${
          indented ? "ml-6 border-dashed" : ""
        }`}
      >
        <div>
          <span className="flex items-center gap-1.5 font-semibold text-navy">
            {indented && <CornerDownRight className="h-3.5 w-3.5 text-ink/30" />}
            {cat.name}
          </span>
          <span className="font-mono text-xs text-ink/40">/{cat.slug}</span>
          {cat.seo_intro && (
            <p className="mt-1 line-clamp-1 max-w-md text-xs text-ink/50">{cat.seo_intro}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => startEdit(cat)}
            className="rounded-lg border border-line p-1.5 text-ink/50 hover:bg-offwhite"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => handleDelete(cat.id, cat.name)}
            className="rounded-lg border border-line p-1.5 text-bordo hover:bg-bordo/5"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="card-shadow mb-5 rounded-2xl border border-line bg-white p-5">
        <h3 className="mb-3 font-display text-base font-bold text-navy">Yeni Kategori Ekle</h3>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Kategori adı (örn. Pastaneler)"
            className="flex-1 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
          />
          <select
            value={newParentId}
            onChange={(e) => setNewParentId(e.target.value)}
            className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo sm:w-56"
          >
            <option value="">Ana kategori (üst kategori yok)</option>
            {topLevel.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} altına ekle
              </option>
            ))}
          </select>
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

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Kategori ara..."
          className="w-full rounded-lg border border-line py-2 pl-9 pr-3 text-sm outline-none focus:border-bordo"
        />
      </div>

      {loading ? (
        <p className="text-ink/50">Yükleniyor...</p>
      ) : searchLower ? (
        <div className="flex flex-col gap-2">
          {searchResults.length === 0 ? (
            <p className="text-sm text-ink/50">Eşleşen kategori bulunamadı.</p>
          ) : (
            searchResults.map((cat) =>
              editingId === cat.id ? (
                <div key={cat.id}>{renderEditForm(cat)}</div>
              ) : (
                <div
                  key={cat.id}
                  className="card-shadow flex items-center justify-between rounded-xl border border-line bg-white px-4 py-3"
                >
                  <div>
                    <span className="font-semibold text-navy">{categoryLabel(cat)}</span>
                    <span className="ml-2 font-mono text-xs text-ink/40">/{cat.slug}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(cat)}
                      className="rounded-lg border border-line p-1.5 text-ink/50 hover:bg-offwhite"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="rounded-lg border border-line p-1.5 text-bordo hover:bg-bordo/5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )
            )
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {topLevel.map((cat) => (
            <div key={cat.id} className="flex flex-col gap-2">
              {editingId === cat.id ? renderEditForm(cat) : renderRow(cat, false)}
              {childrenOf(cat.id).map((sub) =>
                editingId === sub.id ? (
                  <div key={sub.id} className="ml-6">
                    {renderEditForm(sub)}
                  </div>
                ) : (
                  renderRow(sub, true)
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}