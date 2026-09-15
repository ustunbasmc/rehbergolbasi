import Link from "next/link";
import { Phone, ChevronRight } from "lucide-react";
import { formatTelHref } from "@/lib/analytics";

export interface MiniPharmacy {
  id: string;
  name: string;
  phone: string | null;
}

/**
 * Ana sayfadaki "Gölbaşı'nda Bugün" akışına gömülen kompakt nöbetçi eczane
 * kartı. Kaynak API şu an TÜM kayıtlarda doğrulanamayan/bozuk bir adres
 * döndürdüğü için (bkz. teslim raporu) burada adres HİÇ gösterilmiyor —
 * yalnızca isim + ara butonu + tam listeye bağlantı. Ayrıntılı adres/yol
 * tarifi için /nobetci-eczane sayfası (PharmacyCard, doğrulama bayrağını
 * kullanarak) sorumlu.
 */
export default function NobetciEczaneMiniCard({ pharmacies }: { pharmacies: MiniPharmacy[] }) {
  if (pharmacies.length === 0) return null;

  return (
    <div className="card-shadow flex h-full flex-col gap-3 rounded-2xl bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-bordo/10 text-sm">💊</span>
          <span className="text-xs font-bold uppercase tracking-wide text-bordo">Nöbetçi Eczane</span>
        </div>
        <Link href="/nobetci-eczane" className="flex items-center gap-0.5 text-xs font-bold text-bordo hover:underline">
          Tümü <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {pharmacies.slice(0, 2).map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-2">
            <span className="min-w-0 truncate text-sm font-semibold text-navy">{p.name}</span>
            {p.phone && (
              <a
                href={formatTelHref(p.phone)}
                aria-label={`${p.name} eczanesini ara`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bordo text-white transition hover:bg-bordo-dark"
              >
                <Phone className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        ))}
      </div>
      <p className="mt-auto border-t border-line pt-2.5 text-[11px] text-ink/40">
        Akşamdan sabaha nöbetçi eczaneler
      </p>
    </div>
  );
}
