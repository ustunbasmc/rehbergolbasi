"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, GripVertical, Save } from "lucide-react";
import type { BusinessFaq } from "@/lib/types";

export default function FaqManager({ businessId }: { businessId: string }) {
  const [faqs, setFaqs] = useState<BusinessFaq[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, [businessId]);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("business_faqs")
      .select("*")
      .eq("business_id", businessId)
      .order("display_order", { ascending: true });
    setFaqs(data ?? []);
    setLoading(false);
  }

  async function handleAdd() {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      setError("Soru ve cevap boş bırakılamaz.");
      return;
    }
    setAdding(true);
    setError(null);
    const maxOrder = faqs.length > 0 ? Math.max(...faqs.map((f) => f.display_order)) : 0;
    const { data, error: insertError } = await supabase
      .from("business_faqs")
      .insert({
        business_id: businessId,
        question: newQuestion.trim(),
        answer: newAnswer.trim(),
        display_order: maxOrder + 1,
      })
      .select()
      .single();
    if (insertError) {
      setError("Eklenemedi: " + insertError.message);
    } else if (data) {
      setFaqs((prev) => [...prev, data]);
      setNewQuestion("");
      setNewAnswer("");
    }
    setAdding(false);
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Bu soruyu silmek istediğine emin misin?");
    if (!confirmed) return;
    await supabase.from("business_faqs").delete().eq("id", id);
    setFaqs((prev) => prev.filter((f) => f.id !== id));
  }

  async function handleUpdate(id: string, field: "question" | "answer", value: string) {
    setFaqs((prev) => prev.map((f) => f.id === id ? { ...f, [field]: value } : f));
  }

  async function handleSave(faq: BusinessFaq) {
    setSaving(true);
    await supabase
      .from("business_faqs")
      .update({ question: faq.question, answer: faq.answer })
      .eq("id", faq.id);
    setSaving(false);
  }

  async function handleMoveUp(index: number) {
    if (index === 0) return;
    const updated = [...faqs];
    const temp = updated[index - 1];
    updated[index - 1] = { ...updated[index], display_order: temp.display_order };
    updated[index] = { ...temp, display_order: updated[index].display_order };
    setFaqs(updated);
    await Promise.all([
      supabase.from("business_faqs").update({ display_order: updated[index - 1].display_order }).eq("id", updated[index - 1].id),
      supabase.from("business_faqs").update({ display_order: updated[index].display_order }).eq("id", updated[index].id),
    ]);
  }

  if (loading) return <p className="text-xs text-ink/40">SSS yükleniyor...</p>;

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-semibold text-navy">
        Sıkça Sorulan Sorular
      </label>

      {error && <p className="text-xs text-bordo">{error}</p>}

      {/* Mevcut SSS listesi */}
      {faqs.length === 0 ? (
        <p className="text-xs text-ink/40">Henüz soru eklenmedi.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {faqs.map((faq, index) => (
            <div key={faq.id} className="rounded-lg border border-line bg-offwhite p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="text-ink/30 hover:text-ink disabled:opacity-20"
                    title="Yukarı taşı"
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-bold text-ink/40">#{index + 1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSave(faq)}
                    disabled={saving}
                    className="flex items-center gap-1 rounded-lg bg-navy px-2.5 py-1 text-xs font-bold text-white hover:bg-navy-dark disabled:opacity-60"
                  >
                    <Save className="h-3 w-3" />
                    Kaydet
                  </button>
                  <button
                    onClick={() => handleDelete(faq.id)}
                    className="text-bordo hover:text-bordo-dark"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <input
                value={faq.question}
                onChange={(e) => handleUpdate(faq.id, "question", e.target.value)}
                placeholder="Soru"
                className="mb-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-bordo"
              />
              <textarea
                value={faq.answer}
                onChange={(e) => handleUpdate(faq.id, "answer", e.target.value)}
                placeholder="Cevap"
                rows={2}
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-bordo"
              />
            </div>
          ))}
        </div>
      )}

      {/* Yeni SSS ekleme */}
      <div className="rounded-lg border border-dashed border-line p-3">
        <p className="mb-2 text-xs font-semibold text-ink/50">Yeni Soru Ekle</p>
        <input
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Soru"
          className="mb-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-bordo"
        />
        <textarea
          value={newAnswer}
          onChange={(e) => setNewAnswer(e.target.value)}
          placeholder="Cevap"
          rows={2}
          className="mb-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-bordo"
        />
        <button
          onClick={handleAdd}
          disabled={adding}
          className="flex items-center gap-1.5 rounded-lg bg-bordo px-3 py-2 text-xs font-bold text-white hover:bg-bordo-dark disabled:opacity-60"
        >
          <Plus className="h-3.5 w-3.5" />
          {adding ? "Ekleniyor..." : "Ekle"}
        </button>
      </div>
    </div>
  );
}