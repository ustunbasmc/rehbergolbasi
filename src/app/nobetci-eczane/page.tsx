import type { Metadata } from "next";
import { Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import PharmacyCard from "@/components/PharmacyCard";

export const metadata: Metadata = {
  title: "Gölbaşı Nöbetçi Eczane — Bugün Açık Eczaneler",
  description: "Gölbaşı'nda bugün nöbetçi olan eczanelerin adresi, telefonu ve konumu.",
  alternates: {
    canonical: "https://rehbergolbasi.com/nobetci-eczane",
  },
};

export const revalidate = 3600;

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  phone2: string | null;
  location: { latitude: number; longitude: number } | null;
}

async function getPharmacies(): Promise<Pharmacy[]> {
  try {
    const res = await fetch(
      "https://eczaneapi.com/api/v1/pharmacies/on-duty?city=ankara&district=golbasi",
      {
        headers: { "X-API-Key": process.env.ECZANE_API_KEY! },
        next: { revalidate: 3600 },
      }
    );
    const data = await res.json();

    const today = new Date().toISOString().slice(0, 10);
    const todayGroup = (data?.data ?? []).find(
      (g: { date: string; pharmacies: Pharmacy[] }) => g.date === today
    );
    return todayGroup?.pharmacies ?? [];
  } catch {
    return [];
  }
}

export default async function NobetciEczanePage() {
  const pharmacies = await getPharmacies();
  const today = new Date().toLocaleDateString("tr-TR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 sm:px-6 sm:py-12">
      <div className="mb-8">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink/50 hover:text-bordo"
        >
          ← Anasayfa
        </Link>
        <h1 className="font-display text-3xl font-bold text-navy">
          Nöbetçi Eczane
        </h1>
        <div className="mt-2 flex items-center gap-2 text-sm text-ink/60">
          <Clock className="h-4 w-4" />
          <span>{today}</span>
        </div>
      </div>

      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-gold/30 bg-gold/5 p-4">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
        <p className="text-sm text-ink/70">
          Eczaneye gitmeden önce telefonla açık olduğunu teyit etmeniz önerilir. Bilgiler her gece 00:00'da güncellenir.
        </p>
      </div>

      {pharmacies.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white p-8 text-center">
          <p className="text-sm text-ink/50">
            Bugün için nöbetçi eczane bilgisi bulunamadı.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold text-ink/50">
            {pharmacies.length} nöbetçi eczane bulundu
          </p>
          {pharmacies.map((pharmacy) => (
            <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} />
          ))}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-ink/30">
        Veri kaynağı: EczaneAPI — Ankara Eczacılar Odası verileri
      </p>
    </div>
  );
}