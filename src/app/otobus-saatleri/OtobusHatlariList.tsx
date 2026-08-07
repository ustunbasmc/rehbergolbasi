"use client";

import { useMemo, useState } from "react";
import { ChevronDown, MapPin, Route, Search } from "lucide-react";
import { KATEGORILER, OTOBUS_HATLARI, type HatKategori, type OtobusHatti } from "@/data/otobus-hatlari";

type Gun = "haftaici" | "cumartesi" | "pazar";

const GUN_LABEL: Record<Gun, string> = {
  haftaici: "Hafta içi",
  cumartesi: "Cumartesi",
  pazar: "Pazar",
};

function HatKarti({ hat }: { hat: OtobusHatti }) {
  const [gun, setGun] = useState<Gun>("haftaici");
  const [duraklarAcik, setDuraklarAcik] = useState(false);
  const [tumSaatler, setTumSaatler] = useState(false);

  const saatler = hat.saatler[gun];
  const gosterilecekSaatler = tumSaatler ? saatler : saatler.slice(0, 6);
  const kalanSaat = saatler.length - gosterilecekSaatler.length;

  return (
    <div className="rounded-2xl border border-line bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="shrink-0 rounded-lg bg-bordo px-2.5 py-1.5 text-sm font-bold text-white">
            {hat.no}
          </div>
          <div>
            <p className="text-[15px] font-semibold leading-snug text-navy">{hat.ad}</p>
            <p className="mt-1 flex items-center gap-1 text-[13px] text-ink/60">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {hat.kalkis} → {hat.varis}
            </p>
          </div>
        </div>
        <p className="shrink-0 whitespace-nowrap text-right text-[13px] text-ink/50">
          {hat.mesafeKm} km · {hat.sureDk} dk
        </p>
      </div>

      {hat.notlar && (
        <p className="mt-3 rounded-lg bg-gold/10 px-3 py-1.5 text-[12.5px] text-navy/80">{hat.notlar}</p>
      )}

      <div className="mt-4 flex gap-1 border-b border-line">
        {(Object.keys(GUN_LABEL) as Gun[]).map((g) => (
          <button
            key={g}
            onClick={() => {
              setGun(g);
              setTumSaatler(false);
            }}
            className={`-mb-px border-b-2 px-2 py-1.5 text-[12.5px] font-medium transition ${
              gun === g
                ? "border-bordo text-bordo"
                : "border-transparent text-ink/45 hover:text-ink/70"
            }`}
          >
            {GUN_LABEL[g]}
          </button>
        ))}
      </div>

      <div className="mt-3">
        {saatler.length === 0 ? (
          <p className="text-[13px] text-ink/45">Bu gün için sefer bulunmuyor.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {gosterilecekSaatler.map((s, i) => (
              <span key={i} className="rounded-md bg-navy/5 px-2 py-1 text-[12.5px] font-medium text-navy">
                {s}
              </span>
            ))}
            {kalanSaat > 0 && (
              <button
                onClick={() => setTumSaatler(true)}
                className="rounded-md px-2 py-1 text-[12.5px] font-medium text-bordo hover:underline"
              >
                +{kalanSaat} daha
              </button>
            )}
          </div>
        )}
      </div>

      <button
        onClick={() => setDuraklarAcik((v) => !v)}
        className="mt-4 flex w-full items-center justify-between border-t border-line pt-3 text-[13px] font-medium text-bordo"
      >
        <span className="flex items-center gap-1.5">
          <Route className="h-3.5 w-3.5" />
          Tüm durakları gör ({hat.duraklar.length} durak)
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${duraklarAcik ? "rotate-180" : ""}`} />
      </button>

      {duraklarAcik && (
        <ol className="mt-3 max-h-56 space-y-1.5 overflow-y-auto pr-1">
          {hat.duraklar.map((durak, i) => (
            <li key={i} className="flex gap-2.5 text-[13px] text-ink/70">
              <span className="w-5 shrink-0 text-ink/35">{i + 1}</span>
              {durak}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default function OtobusHatlariList() {
  const [kategori, setKategori] = useState<HatKategori | "tumu">("tumu");
  const [arama, setArama] = useState("");

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
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
        <input
          type="text"
          value={arama}
          onChange={(e) => setArama(e.target.value)}
          placeholder="Hat no veya mahalle ara (örn: 105, İncek)"
          className="w-full rounded-xl border border-line bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-bordo"
        />
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setKategori("tumu")}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
            kategori === "tumu" ? "bg-bordo text-white" : "border border-line text-ink/60"
          }`}
        >
          Tümü
        </button>
        {KATEGORILER.map((k) => (
          <button
            key={k.key}
            onClick={() => setKategori(k.key)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
              kategori === k.key ? "bg-bordo text-white" : "border border-line text-ink/60"
            }`}
          >
            {k.label}
          </button>
        ))}
      </div>

      {filtreliHatlar.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink/45">
          Aramanızla eşleşen bir hat bulunamadı.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtreliHatlar.map((hat) => (
            <HatKarti key={hat.no} hat={hat} />
          ))}
        </div>
      )}
    </div>
  );
}