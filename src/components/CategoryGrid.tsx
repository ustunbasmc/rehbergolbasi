import Link from "next/link";
import { Phone, ArrowRight, Star } from "lucide-react";
import { getCategoryIcon } from "@/lib/categoryIcons";
import type { Category } from "@/lib/types";

interface MiniBusiness {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  tier: "basic" | "premium";
}

export interface CategoryWithBusinesses extends Category {
  businesses: MiniBusiness[];
  count: number;
}

export default function CategoryGrid({
  categories,
}: {
  categories: CategoryWithBusinesses[];
}) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((cat) => {
        const Icon = getCategoryIcon(cat.icon);
        return (
          <div
            key={cat.id}
            className="card-shadow flex flex-col rounded-2xl border border-line bg-white p-5"
          >
            <Link href={`/isletmeler/${cat.slug}`} className="mb-3 flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-bordo/10 text-bordo">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-base font-bold text-navy">{cat.name}</p>
                <p className="text-xs text-ink/50">{cat.count} işletme</p>
              </div>
            </Link>

            {cat.businesses.length > 0 ? (
              <div className="flex flex-col gap-1.5 border-t border-line pt-3">
                {cat.businesses.map((b) => (
                  <div key={b.id} className="flex items-center justify-between gap-2">
                    <Link
                      href={`/isletme/${b.slug}`}
                      className="flex min-w-0 items-center gap-1 truncate text-sm font-semibold text-ink/80 hover:text-bordo"
                    >
                      {b.tier === "premium" && (
                        <Star className="h-3 w-3 shrink-0 fill-gold text-gold" />
                      )}
                      <span className="truncate">{b.name}</span>
                    </Link>
                    {b.phone && (
                      <a
                        href={`tel:${b.phone}`}
                        aria-label={`${b.name} işletmesini ara`}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy/5 text-navy transition-colors hover:bg-bordo hover:text-white"
                      >
                        <Phone className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="border-t border-line pt-3 text-xs text-ink/40">
                Bu kategoride henüz işletme yok.
              </p>
            )}

            <Link
              href={`/isletmeler/${cat.slug}`}
              className="mt-3 flex items-center gap-1 text-xs font-semibold text-bordo hover:underline"
            >
              Tümünü gör <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        );
      })}
    </div>
  );
}