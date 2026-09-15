"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Search, LocateFixed, List, Map as MapIcon, Loader2, AlertCircle } from "lucide-react";
import TaxiCard, { type TaxiListing } from "@/components/TaxiCard";
import { haversineDistanceKm, normalizeForSearch, normalizeNeighborhoodKey } from "@/lib/taxi";
import { trackTaxiEvent } from "@/lib/analytics";

const TaxiMap = dynamic(() => import("@/components/TaxiMap"), {
  ssr: false,
  loading: () => (
    <div className="card-shadow flex h-[420px] items-center justify-center rounded-2xl bg-offwhite text-sm text-ink/40">
      Harita yükleniyor...
    </div>
  ),
});

type LocationStatus = "idle" | "requesting" | "granted" | "denied" | "error" | "unsupported";

const LOCATION_ERROR_MESSAGES: Record<Exclude<LocationStatus, "idle" | "requesting" | "granted">, string> = {
  denied: "Konum izni vermeden de mahalle seçerek veya durak arayarak devam edebilirsiniz.",
  error: "Konumunuz alınamadı. Mahalle seçerek veya durak arayarak devam edebilirsiniz.",
  unsupported: "Tarayıcınız konum özelliğini desteklemiyor. Mahalle seçerek devam edebilirsiniz.",
};

export default function TaxiFinder({
  initialTaxis,
  neighborhoods,
}: {
  initialTaxis: TaxiListing[];
  neighborhoods: string[];
}) {
  const [search, setSearch] = useState("");
  const [neighborhoodFilter, setNeighborhoodFilter] = useState<string>("all");
  const [onlyTwentyFourSeven, setOnlyTwentyFourSeven] = useState(false);
  const [nearestMode, setNearestMode] = useState(false);
  const [view, setView] = useState<"liste" | "harita">("liste");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [liveMessage, setLiveMessage] = useState("");
  const viewedTracked = useRef(false);
  const searchTracked = useRef(false);

  useEffect(() => {
    if (!viewedTracked.current) {
      viewedTracked.current = true;
      trackTaxiEvent("taxi_page_view");
    }
  }, []);

  function requestLocation() {
    trackTaxiEvent("taxi_location_requested");
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationStatus("unsupported");
      trackTaxiEvent("taxi_location_error", { errorCategory: "unsupported" });
      return;
    }
    if (typeof window !== "undefined" && !window.isSecureContext) {
      setLocationStatus("error");
      trackTaxiEvent("taxi_location_error", { errorCategory: "insecure_context" });
      return;
    }

    setLocationStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus("granted");
        setNearestMode(true);
        setLiveMessage("Yakındaki taksi durakları mesafeye göre sıralandı.");
        trackTaxiEvent("taxi_location_granted");
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setLocationStatus("denied");
          trackTaxiEvent("taxi_location_denied");
        } else {
          setLocationStatus("error");
          trackTaxiEvent("taxi_location_error", {
            errorCategory: err.code === err.TIMEOUT ? "timeout" : "position_unavailable",
          });
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    if (!searchTracked.current && value.trim().length > 1) {
      searchTracked.current = true;
      trackTaxiEvent("taxi_search");
    }
  }

  function handleNeighborhoodChange(value: string) {
    setNeighborhoodFilter(value);
    if (value !== "all") trackTaxiEvent("taxi_neighborhood_selected", { neighborhood: value });
  }

  function handleViewChange(next: "liste" | "harita") {
    setView(next);
    if (next === "harita") trackTaxiEvent("taxi_map_open");
  }

  const { result, usingFallback } = useMemo(() => {
    const q = normalizeForSearch(search.trim());
    const neighborhoodKey = neighborhoodFilter !== "all" ? normalizeNeighborhoodKey(neighborhoodFilter) : null;

    // 7/24 filtresi gerçek bir veri filtresi olduğu için her zaman uygulanır.
    const availableTaxis = initialTaxis.filter((t) => !onlyTwentyFourSeven || t.taxi_service_24_7);

    function matchesLocation(t: TaxiListing): boolean {
      if (!neighborhoodKey) return true;
      const ownMatch = t.neighborhood && normalizeNeighborhoodKey(t.neighborhood) === neighborhoodKey;
      const areaMatch = t.serviceAreas.some((a) => normalizeNeighborhoodKey(a) === neighborhoodKey);
      return Boolean(ownMatch || areaMatch);
    }

    function matchesSearch(t: TaxiListing): boolean {
      if (!q) return true;
      const haystack = normalizeForSearch([t.name, t.neighborhood ?? "", ...t.serviceAreas].join(" "));
      return haystack.includes(q);
    }

    const narrowed = availableTaxis.filter((t) => matchesLocation(t) && matchesSearch(t));

    // Bir mahalle/durak adına özel kayıtlı hizmet alanı olmayabilir, ama
    // Gölbaşı'ndaki taksi durakları genellikle ilçenin genelinde hizmet
    // verebilir. Bu yüzden özel eşleşme bulunamazsa listeyi tamamen boş
    // göstermek yerine tüm durakları (fallback olduğunu belirterek) gösteriyoruz.
    const hasActiveLocationOrSearchFilter = Boolean(neighborhoodKey) || q.length > 0;
    const usingFallback = hasActiveLocationOrSearchFilter && narrowed.length === 0 && availableTaxis.length > 0;
    const list = usingFallback ? availableTaxis : narrowed;

    const withDistance = list.map((t) => ({
      taxi: t,
      distanceKm:
        userLocation && t.lat != null && t.lng != null
          ? haversineDistanceKm(userLocation.lat, userLocation.lng, t.lat, t.lng)
          : null,
      ownNeighborhoodMatch:
        neighborhoodKey && t.neighborhood ? normalizeNeighborhoodKey(t.neighborhood) === neighborhoodKey : false,
    }));

    if (userLocation && nearestMode) {
      withDistance.sort((a, b) => {
        if (a.distanceKm != null && b.distanceKm != null) return a.distanceKm - b.distanceKm;
        if (a.distanceKm != null) return -1;
        if (b.distanceKm != null) return 1;
        return a.taxi.name.localeCompare(b.taxi.name, "tr");
      });
    } else if (neighborhoodKey && !usingFallback) {
      withDistance.sort((a, b) => {
        if (a.ownNeighborhoodMatch !== b.ownNeighborhoodMatch) return a.ownNeighborhoodMatch ? -1 : 1;
        return a.taxi.name.localeCompare(b.taxi.name, "tr");
      });
    } else {
      withDistance.sort((a, b) => a.taxi.name.localeCompare(b.taxi.name, "tr"));
    }

    return { result: withDistance, usingFallback };
  }, [initialTaxis, search, neighborhoodFilter, onlyTwentyFourSeven, userLocation, nearestMode]);

  const locationError =
    locationStatus === "denied" || locationStatus === "error" || locationStatus === "unsupported"
      ? LOCATION_ERROR_MESSAGES[locationStatus]
      : null;

  return (
    <div>
      {/* Konum + arama */}
      <div className="mb-4 flex flex-col gap-2.5">
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={requestLocation}
            disabled={locationStatus === "requesting"}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-navy px-5 text-sm font-bold text-white transition hover:bg-navy-dark disabled:opacity-70 sm:shrink-0"
          >
            {locationStatus === "requesting" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LocateFixed className="h-4 w-4" />
            )}
            {locationStatus === "granted" ? "Konum kullanılıyor" : "Konumumu Kullan"}
          </button>

          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
            <input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Mahalle veya taksi durağı ara"
              className="min-h-12 w-full rounded-xl border border-line pl-10 pr-3 text-base outline-none focus:border-bordo"
            />
          </div>
        </div>

        {locationError && (
          <p role="status" className="flex items-start gap-1.5 text-xs text-ink/50">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {locationError}
          </p>
        )}

        {/* Filtreler */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setNearestMode(false)}
            className={`flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold transition ${
              !nearestMode ? "border-bordo bg-bordo/10 text-bordo" : "border-line text-ink/60 hover:border-bordo/40"
            }`}
          >
            Tümü
          </button>
          <button
            type="button"
            onClick={() => (userLocation ? setNearestMode(true) : requestLocation())}
            className={`flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold transition ${
              nearestMode && userLocation
                ? "border-bordo bg-bordo/10 text-bordo"
                : "border-line text-ink/60 hover:border-bordo/40"
            }`}
          >
            En Yakın
          </button>
          <button
            type="button"
            onClick={() => setOnlyTwentyFourSeven((v) => !v)}
            className={`flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold transition ${
              onlyTwentyFourSeven
                ? "border-bordo bg-bordo/10 text-bordo"
                : "border-line text-ink/60 hover:border-bordo/40"
            }`}
          >
            7/24
          </button>
          {neighborhoods.length > 0 && (
            <select
              value={neighborhoodFilter}
              onChange={(e) => handleNeighborhoodChange(e.target.value)}
              aria-label="Mahalleye göre filtrele"
              className="min-h-11 rounded-full border border-line px-4 text-sm font-semibold text-navy outline-none focus:border-bordo"
            >
              <option value="all">Tüm mahalleler</option>
              {neighborhoods.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          )}

          <div className="ml-auto flex items-center gap-1 rounded-full border border-line p-0.5">
            <button
              type="button"
              onClick={() => handleViewChange("liste")}
              aria-pressed={view === "liste"}
              className={`flex min-h-10 items-center gap-1.5 rounded-full px-3.5 text-xs font-bold transition ${
                view === "liste" ? "bg-navy text-white" : "text-ink/50"
              }`}
            >
              <List className="h-3.5 w-3.5" /> Liste
            </button>
            <button
              type="button"
              onClick={() => handleViewChange("harita")}
              aria-pressed={view === "harita"}
              className={`flex min-h-10 items-center gap-1.5 rounded-full px-3.5 text-xs font-bold transition ${
                view === "harita" ? "bg-navy text-white" : "text-ink/50"
              }`}
            >
              <MapIcon className="h-3.5 w-3.5" /> Harita
            </button>
          </div>
        </div>
      </div>

      <p aria-live="polite" className="sr-only">{liveMessage}</p>

      {usingFallback && (
        <p className="mb-3 flex items-start gap-1.5 rounded-xl border border-gold/30 bg-gold/5 px-4 py-3 text-sm leading-relaxed text-ink/70">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
          <span>
            {search.trim()
              ? `"${search.trim()}"`
              : neighborhoodFilter}{" "}
            için özel olarak kayıtlı bir taksi durağı bulunamadı. Gölbaşı&apos;ndaki taksi
            durakları genellikle ilçenin genelinde hizmet verebilir; aşağıdaki duraklardan
            birini arayarak bu bölgeye gelip gelemeyeceklerini sorabilirsiniz.
          </span>
        </p>
      )}

      <p className="mb-3 text-sm text-ink/50">
        {usingFallback
          ? `${result.length} taksi durağının tümü listeleniyor.`
          : `${result.length} taksi durağı bulundu.`}
      </p>

      {result.length === 0 ? (
        <div className="card-shadow rounded-2xl bg-offwhite p-8 text-center">
          <p className="text-sm text-ink/60">
            Bu filtrelere uygun taksi durağı bulunamadı. Farklı bir filtre deneyebilir veya tüm durakları görüntüleyebilirsiniz.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setNeighborhoodFilter("all");
              setOnlyTwentyFourSeven(false);
            }}
            className="mt-3 text-sm font-bold text-bordo hover:underline"
          >
            Tüm durakları göster
          </button>
        </div>
      ) : view === "harita" ? (
        <TaxiMap taxis={result.map((r) => r.taxi)} userLocation={userLocation} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {result.map(({ taxi, distanceKm }) => (
            <TaxiCard key={taxi.id} taxi={taxi} distanceKm={distanceKm} />
          ))}
        </div>
      )}
    </div>
  );
}
