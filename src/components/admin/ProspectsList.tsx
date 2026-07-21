"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  Plus,
  Send,
  Trash2,
  Clock,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Phone,
} from "lucide-react";

interface Prospect {
  id: string;
  name: string;
  keyword: string | null;
  phone: string;
  status: "bekliyor" | "iletildi" | "kabul_etti" | "reddetti";
  created_at: string;
  contacted_at: string | null;
}

function buildMessage(name: string, keyword: string | null) {
  const kw = keyword?.trim() || "işletme";
  return `Merhaba! 👋

Gölbaşı'da "${kw}" diye arama yapan yüzlerce kişi var — bu aramalarda ${name}'nın da çıkmasını ister misiniz?

RehberGölbaşı, Gölbaşı'na özel yeni nesil bir işletme rehberi. Sizi eklediğimizde:
✅ Google'da "Gölbaşı ${kw}" gibi aramalarda görünme şansınız artar
✅ Müşteriler sizi doğrudan arayabilir/WhatsApp'tan yazabilir — komisyon yok, aracı yok
✅ Fotoğraflarınız, çalışma saatleriniz, adresiniz tek bir sayfada, düzenli şekilde görünür

İlk ay tamamen ücretsiz. Sonraki aylarda günlük sadece 12 TL (aylık 360 TL) — istediğiniz zaman bırakabilirsiniz, hiçbir taahhüt yok.

Sizden tek isteğimiz birkaç fotoğraf ve onayınız — formu ve tüm süreci ben hallederim. 2 dakikanızı alır. İlgilenir misiniz?`;
}

const STATUS_META: Record<
  Prospect["status"],
  { label: string; color: string; icon: typeof Clock }
> = {
  bekliyor: { label: "Bekliyor", color: "bg-navy/5 text-navy", icon: Clock },
  iletildi: { label: "Mesaj İletildi", color: "bg-gold/10 text-gold-dark", icon: MessageCircle },
  kabul_etti: { label: "Kabul Etti", color: "bg-green-100 text-green-700", icon: ThumbsUp },
  reddetti: { label: "Reddetti", color: "bg-bordo/10 text-bordo", icon: ThumbsDown },
};

export default function ProspectsList() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [keyword, setKeyword] = useState("");
  const [phone, setPhone] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"hepsi" | Prospect["status"]>("hepsi");

  const loadProspects = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("prospects")
      .select("*")
      .order("created_at", { ascending: false });
    setProspects((data as Prospect[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProspects();
  }, [loadProspects]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setAdding(true);
    setError(null);

    const { error: insertError } = await supabase.from("prospects").insert({
      name: name.trim(),
      keyword: keyword.trim() || null,
      phone: phone.trim(),
    });

    setAdding(false);

    if (insertError) {
      setError("Eklenemedi: " + insertError.message);
      return;
    }

    setName("");
    setKeyword("");
    setPhone("");
    loadProspects();
  }

  async function markContacted(p: Prospect) {
    if (p.status === "bekliyor") {
      await supabase
        .from("prospects")
        .update({ status: "iletildi", contacted_at: new Date().toISOString() })
        .eq("id", p.id);
      loadProspects();
    }
  }

  async function setStatus(id: string, status: Prospect["status"]) {
    await supabase.from("prospects").update({ status }).eq("id", id);
    loadProspects();
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Bu kaydı silmek istediğine emin misin?");
    if (!confirmed) return;
    await supabase.from("prospects").delete().eq("id", id);
    loadProspects();
  }

  const filtered = filter === "hepsi" ? prospects : prospects.filter((p) => p.status === filter);

  const counts = {
    hepsi: prospects.length,
    bekliyor: prospects.filter((p) => p.status === "bekliyor").length,
    iletildi: prospects.filter((p) => p.status === "iletildi").length,
    kabul_etti: prospects.filter((p) => p.status === "kabul_etti").length,
    reddetti: prospects.filter((p) => p.status === "reddetti").length,
  };

  return (
    <div>
      {/* Hızlı ekleme formu */}
      <form
        onSubmit={handleAdd}
        className="card-shadow mb-6 flex flex-col gap-3 rounded-2xl border border-line bg-white p-5"
      >
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-navy">
          <Plus className="h-3.5 w-3.5" /> Hızlı Ekle
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="İşletme adı *"
            required
            className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
          />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Anahtar kelime (örn. gelin saçı)"
            className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Telefon (05xx...) *"
            required
            className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
          />
        </div>
        {error && <p className="text-sm text-bordo">{error}</p>}
        <button
          type="submit"
          disabled={adding}
          className="self-start rounded-lg bg-bordo px-4 py-2 text-sm font-bold text-white hover:bg-bordo-dark disabled:opacity-60"
        >
          {adding ? "Ekleniyor..." : "Listeye Ekle"}
        </button>
      </form>

      {/* Filtre sekmeleri */}
      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ["hepsi", "Hepsi"],
            ["bekliyor", "Bekleyenler"],
            ["iletildi", "Mesaj İletilenler"],
            ["kabul_etti", "Kabul Edenler"],
            ["reddetti", "Reddedenler"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
              filter === key
                ? "bg-navy text-white"
                : "border border-line bg-white text-ink/60 hover:border-navy"
            }`}
          >
            {label} ({counts[key]})
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-ink/50">Yükleniyor...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-line bg-offwhite p-10 text-center text-ink/60">
          {filter === "hepsi"
            ? "Henüz potansiyel işletme eklemedin. Yukarıdaki formla hızlıca ekleyebilirsin."
            : "Bu durumda kayıt yok."}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((p) => {
            const meta = STATUS_META[p.status];
            const StatusIcon = meta.icon;
            const waLink = `https://wa.me/${p.phone.replace(/\D/g, "").replace(/^0/, "90")}?text=${encodeURIComponent(buildMessage(p.name, p.keyword))}`;
            return (
              <div
                key={p.id}
                className="card-shadow flex flex-col gap-3 rounded-xl border border-line bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-sm font-bold text-navy">{p.name}</p>
                    <span
                      className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.color}`}
                    >
                      <StatusIcon className="h-3 w-3" /> {meta.label}
                    </span>
                  </div>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink/50">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {p.phone}
                    </span>
                    {p.keyword && <span>Anahtar: {p.keyword}</span>}
                    {p.contacted_at && (
                      <span>
                        İletildi:{" "}
                        {new Date(p.contacted_at).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => markContacted(p)}
                    className="flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-2 text-xs font-bold text-white hover:opacity-90"
                  >
                    <Send className="h-3.5 w-3.5" /> WhatsApp Gönder
                  </a>
                  {(p.status === "iletildi" || p.status === "bekliyor") && (
                    <>
                      <button
                        onClick={() => setStatus(p.id, "kabul_etti")}
                        className="flex items-center gap-1 rounded-lg border border-line px-2.5 py-2 text-xs font-bold text-green-700 hover:bg-green-50"
                        title="Kabul etti olarak işaretle"
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setStatus(p.id, "reddetti")}
                        className="flex items-center gap-1 rounded-lg border border-line px-2.5 py-2 text-xs font-bold text-bordo hover:bg-bordo/5"
                        title="Reddetti olarak işaretle"
                      >
                        <ThumbsDown className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                  {p.status !== "bekliyor" && (
                    <button
                      onClick={() => setStatus(p.id, "bekliyor")}
                      className="rounded-lg border border-line px-2.5 py-2 text-xs font-semibold text-ink/50 hover:bg-offwhite"
                      title="Bekliyor durumuna geri al"
                    >
                      <Clock className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="rounded-lg px-2 py-2 text-ink/40 hover:text-bordo"
                    aria-label="Sil"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}