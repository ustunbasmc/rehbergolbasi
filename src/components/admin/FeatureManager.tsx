"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Feature } from "@/lib/types";
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

export default function FeatureManager() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFeatures = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("features")
      .select("*")
      .order("display_order", { ascending: true });
    setFeatures(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  async function handleAdd() {
    if (!newName.trim()) return;
    setAdding(true);
    setError(null);

    const nextOrder =
      features.length > 0 ? Math.max(...features.map((f) => f.display_order)) + 1 : 1;

    const { error: insertError } = await supabase.from("features").insert({
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
    loadFeatures();
  }

  function startEdit(feature: Feature) {
    setEditingId(feature.id);
    setEditName(feature.name);
  }

  async function handleSaveEdit(id: string) {
    setError(null);
    const { error: updateError } = await supabase
      .from("features")
      .update({ name: editName.trim() })
      .eq("id", id);

    if (updateError) {
      setError("Güncellenemedi: " + updateError.message);
      return;
    }

    setEditingId(null);
    loadFeatures();
  }

  async function handleDelete(id: string, name: string) {
    const confirmed = window.confirm(
      `"${name}" özelliğini silmek istediğine emin misin? Bu özelliği kullanan işletmelerden de kaldırılacak.`
    );
    if (!confirmed) return;

    await supabase.from("features").delete().eq("id", id);
    loadFeatures();
  }

  return (
    <div>
      <div className="card-shadow mb-5 rounded-2xl border border-line bg-white p-5">
        <h3 className="mb-3 font-display text-base font-bold text-navy">Yeni Özellik Ekle</h3>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Özellik adı (örn. Ücretsiz Wi-Fi)"
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

      {loading ? (
        <p className="text-ink/50">Yükleniyor...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="card-shadow flex items-center justify-between rounded-xl border border-line bg-white px-4 py-3"
            >
              {editingId === feature.id ? (
                <div className="flex flex-1 items-center gap-2">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 rounded-lg border border-line px-3 py-1.5 text-sm outline-none focus:border-bordo"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(feature.id)}
                      className="rounded-lg bg-navy p-1.5 text-white hover:bg-navy-dark"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded-lg border border-line p-1.5 text-ink/50 hover:bg-offwhite"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="font-semibold text-navy">{feature.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(feature)}
                      className="rounded-lg border border-line p-1.5 text-ink/50 hover:bg-offwhite"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(feature.id, feature.name)}
                      className="rounded-lg border border-line p-1.5 text-bordo hover:bg-bordo/5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}