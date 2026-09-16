"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Bus,
  ChevronDown,
  Circle,
  Clock,
  GraduationCap,
  Landmark,
  MapPinned,
  Route,
  Search,
  TreePine,
} from "lucide-react";
import { KATEGORILER, OTOBUS_HATLARI, type HatKategori, type OtobusHatti } from "@/data/otobus-hatlari";

type Gun = "haftaici" | "cumartesi" | "pazar";

const GUN_LABEL: Record<Gun, string> = {
  haftaici: "Hafta içi",
  cumartesi: "Cumartesi",
  pazar: "Pazar",
};

const KATEGORI_STIL: Record<HatKategori, { icon: typeof Landmark; renk: string; bg: string; bgSoft: string }> = {
  "sehir-merkezi": { icon: Landmark, renk: "text-bordo", bg: "bg-bordo", bgSoft: "bg-bordo/10" },
  "akkopru-asti": { icon: Building2, renk: "text-navy", bg: "bg-navy", bgSoft: "bg-navy/10" },
  "incek-cankaya": { icon: GraduationCap, renk: "text-navy", bg: "bg-navy", bgSoft: "bg-navy/10" },
  kirsal: { icon: TreePine, renk: "text-green-700", bg: "bg-green-700", bgSoft: "bg-green-700/10" },
  "golbasi-ici": { icon: MapPinned, renk: "text-gold-dark", bg: "bg-gold", bgSoft: "bg-gold/10" },
};

function bugununGunu(): Gun {
  const g = new Date().getDay(); // 0 Pazar, 6 Cumartesi
  if (g === 0) return "pazar";
  if (g === 6) return "cumartesi";
  return "haftaici";
}

/** Türkiye saatine göre "şu andan sonraki ilk sefer" — sunucunun saat dilimi ne olursa olsun doğru sonuç verir. */
function suankiIstanbulDakikasi(): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(new Date());
  const map: Record<string, string> = {};
  parts.forEach((p) => (map[p.type] = p.value));
  let hour = parseInt(map.hour, 10);
  if (hour === 24) hour = 0;
  return hour * 60 + parseInt(map.minute, 10);
}

function saatToDakika(saat: string): number {
  const [h, m] = saat.split(":").map(Number);
  return h * 60 + m;
}

/** Bugünün seferleri arasından şu andan sonraki ilk seferi bulur. Bugünün son seferi geçtiyse `null` döner. */
function siradakiSeferiBul(saatler: string[], suankiDakika: number): { saat: string; kalanDk: number } | null {
  for (const s of saatler) {
    const dk = saatToDakika(s);
    if (dk >= suankiDakika) return { saat: s, kalanDk: dk - suankiDakika };
  }
  return null;
}

function HatKarti({ hat }: { hat: OtobusHatti }) {
  const [gun, setGun] = useState<Gun>("haftaici");
  const [bugunGun, setBugunGun] = useState<Gun | null>(null);
  const [suankiDakika, setSuankiDakika] = useState<number | null>(null);
  const [duraklarAcildi, setDuraklarAcildi] = useState(false);
  const stil = KATEGORI_STIL[hat.kategori];
  const Icon = stil.icon;

  useEffect(() => {
    const bugun = bugununGunu();
    setGun(bugun);
    setBugunGun(bugun);
    setSuankiDakika(suankiIstanbulDakikasi());
    const interval = setInterval(() => setSuankiDakika(suankiIstanbulDakikasi()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Yalnızca BUGÜNÜN gününde ve gerçek saat bilgisiyle "sıradaki sefer" gösterilir —
  // kullanıcı farklı bir gün sekmesine bakarken yanıltıcı bir countdown göstermeyelim.
  const siradakiSefer =
    bugunGun !== null && gun === bugunGun && suankiDakika !== null
      ? siradakiSeferiBul(hat.saatler[bugunGun], suankiDakika)
      : null;

  return (
    <article id={`hat-${hat.no}`} className="card-shadow card-shadow-hover scroll-mt-24 rounded-2xl bg-white p-4 transition sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`shrink-0 rounded-lg ${stil.bg} px-2.5 py-1.5 text-sm font-bold text-white`}>
            {hat.no}
          </div>
          <div>
            <h3 className="text-[15px] font-semibold leading-snug text-navy">{hat.ad}</h3>
            <p className="mt-1 flex items-center gap-1 text-[13px] text-ink/45">
              Güzergâh {hat.mesafeKm} km · ~{hat.sureDk} dk
            </p>
          </div>
        </div>
        <Icon className={`h-4 w-4 shrink-0 ${stil.renk}`} />
      </div>

      {/* Görsel güzergah çubuğu — kalkış/varış tek bakışta anlaşılsın diye. */}
      <div className="mt-3 flex items-center gap-2">
        <span className="min-w-0 truncate text-[12.5px] font-medium text-ink/70">{hat.kalkis}</span>
        <div className="flex flex-1 items-center gap-1">
          <Circle className={`h-2 w-2 shrink-0 fill-current ${stil.renk}`} />
          <div className={`h-0.5 flex-1 rounded-full ${stil.bgSoft}`} />
          <Bus className={`h-3.5 w-3.5 shrink-0 ${stil.renk}`} />
          <div className={`h-0.5 flex-1 rounded-full ${stil.bgSoft}`} />
          <Circle className={`h-2 w-2 shrink-0 fill-current ${stil.renk}`} />
        </div>
        <span className="min-w-0 truncate text-[12.5px] font-medium text-ink/70">{hat.varis}</span>
      </div>

      {siradakiSefer && (
        <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-[12.5px] font-semibold text-green-700">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          Sıradaki sefer {siradakiSefer.saat}
          {" "}
          ({siradakiSefer.kalanDk === 0 ? "şimdi" : `${siradakiSefer.kalanDk} dk sonra`})
        </div>
      )}
      {bugunGun !== null && gun === bugunGun && suankiDakika !== null && !siradakiSefer && (
        <div className="mt-3 rounded-lg bg-offwhite px-3 py-1.5 text-[12.5px] font-medium text-ink/50">
          Bugünün son seferi geçti — yarınki saatler için tabloya bakın.
        </div>
      )}

      {hat.notlar && (
        <p className="mt-3 rounded-lg bg-gold/10 px-3 py-1.5 text-[12.5px] text-navy/80">{hat.notlar}</p>
      )}

      <div className="mt-4 flex gap-1 border-b border-line">
        {(Object.keys(GUN_LABEL) as Gun[]).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGun(g)}
            className={`-mb-px border-b-2 px-2 py-1.5 text-[12.5px] font-medium transition ${
              gun === g ? "border-bordo text-bordo" : "border-transparent text-ink/45 hover:text-ink/70"
            }`}
          >
            {GUN_LABEL[g]}
            {bugunGun === g && <span className="ml-1 text-[10px] text-gold-dark">• bugün</span>}
          </button>
        ))}
      </div>

      {/* Üç günün de saatleri her zaman DOM'da — arama motorları tüm sefer saatlerini görür,
          sadece görsel olarak seçili gün gösterilir. */}
      {(Object.keys(GUN_LABEL) as Gun[]).map((g) => {
        const saatler = hat.saatler[g];
        return (
          <div key={g} className={gun === g ? "mt-3" : "hidden"}>
            {saatler.length === 0 ? (
              <p className="text-[13px] text-ink/45">{GUN_LABEL[g]} için sefer bulunmuyor.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {saatler.map((s, i) => {
                  const gecti =
                    bugunGun !== null && g === bugunGun && suankiDakika !== null && saatToDakika(s) < suankiDakika;
                  return (
                    <span
                      key={i}
                      className={`rounded-md px-2 py-1 text-[12.5px] font-medium ${
                        gecti ? "bg-offwhite text-ink/35 line-through decoration-ink/20" : "bg-navy/5 text-navy"
                      }`}
                    >
                      {s}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <details
        className="group mt-4 border-t border-line pt-3"
        onToggle={(e) => setDuraklarAcildi(e.currentTarget.open)}
      >
        <summary className="flex cursor-pointer list-none items-center justify-between text-[13px] font-medium text-bordo">
          <span className="flex items-center gap-1.5">
            <Route className="h-3.5 w-3.5" />
            Tüm durakları gör ({hat.duraklar.length} durak)
          </span>
          <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
        </summary>
        {/* Duraklar yalnızca açıldığında DOM'a basılır — kapalıyken sayfa
            ağırlığını gereksiz büyütmesin diye. */}
        {duraklarAcildi && (
          <ol className="mt-3 max-h-56 space-y-1.5 overflow-y-auto pr-1">
            {hat.duraklar.map((durak, i) => (
              <li key={i} className="flex gap-2.5 text-[13px] text-ink/70">
                <span className="w-5 shrink-0 text-ink/35">{i + 1}</span>
                {durak}
              </li>
            ))}
          </ol>
        )}
      </details>
    </article>
  );
}

export default function OtobusHatlariList() {
  const [kategori, setKategori] = useState<HatKategori | "tumu">("tumu");
  const [arama, setArama] = useState("");

  const kategoriSayilari = useMemo(() => {
    const map = new Map<HatKategori, number>();
    OTOBUS_HATLARI.forEach((h) => map.set(h.kategori, (map.get(h.kategori) ?? 0) + 1));
    return map;
  }, []);

  const filtreliHatlar = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase("tr");
    return OTOBUS_HATLARI.filter((hat) => {
      const kategoriUyuyor = kategori === "tumu" || hat.kategori === kategori;
      if (!kategoriUyuyor) return false;
      if (!q) return true;
      return (
        hat.no.toLocaleLowerCase("tr").includes(q) ||
        hat.ad.toLocaleLowerCase("tr").includes(q) ||
        hat.duraklar.some((d) => d.toLocaleLowerCase("tr").includes(q))
      );
    });
  }, [kategori, arama]);

  return (
    <div>
      {/* Görsel kategori kartları — hattı hemen bulmak isteyen için tek tıkla filtre. */}
      <div className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        <button
          type="button"
          onClick={() => setKategori("tumu")}
          className={`card-shadow flex flex-col items-start gap-2 rounded-2xl p-3.5 text-left transition ${
            kategori === "tumu" ? "bg-navy text-white" : "bg-white hover:bg-offwhite"
          }`}
        >
          <Bus className={`h-5 w-5 ${kategori === "tumu" ? "text-gold" : "text-navy"}`} />
          <div>
            <p className={`text-[13px] font-bold ${kategori === "tumu" ? "text-white" : "text-navy"}`}>Tüm hatlar</p>
            <p className={`text-[11px] ${kategori === "tumu" ? "text-white/60" : "text-ink/45"}`}>
              {OTOBUS_HATLARI.length} hat
            </p>
          </div>
        </button>
        {KATEGORILER.map((k) => {
          const stil = KATEGORI_STIL[k.key];
          const Icon = stil.icon;
          const aktif = kategori === k.key;
          return (
            <button
              key={k.key}
              type="button"
              onClick={() => setKategori(k.key)}
              className={`card-shadow flex flex-col items-start gap-2 rounded-2xl p-3.5 text-left transition ${
                aktif ? `${stil.bg} text-white` : "bg-white hover:bg-offwhite"
              }`}
            >
              <Icon className={`h-5 w-5 ${aktif ? "text-white" : stil.renk}`} />
              <div>
                <p className={`text-[13px] font-bold ${aktif ? "text-white" : "text-navy"}`}>{k.label}</p>
                <p className={`text-[11px] ${aktif ? "text-white/70" : "text-ink/45"}`}>
                  {kategoriSayilari.get(k.key) ?? 0} hat · {k.aciklama}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="sticky top-0 z-10 bg-white/95 py-2 backdrop-blur-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
          <input
            type="text"
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            placeholder="Hat no veya mahalle ara (örn: 105, İncek, Ballıkpınar)"
            className="w-full rounded-xl border border-line bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-bordo"
          />
        </div>
      </div>

      {filtreliHatlar.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink/45">Aramanızla eşleşen bir hat bulunamadı.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {filtreliHatlar.map((hat) => (
            <HatKarti key={hat.no} hat={hat} />
          ))}
        </div>
      )}
    </div>
  );
}
