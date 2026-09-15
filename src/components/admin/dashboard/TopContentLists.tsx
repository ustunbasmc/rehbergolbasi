"use client";

import Link from "next/link";
import { Newspaper, Search } from "lucide-react";

export interface TopGundemPost {
  slug: string;
  title: string;
  view_count: number;
}

export interface TopSearchTerm {
  term: string;
  count: number;
}

export default function TopContentLists({
  posts,
  terms,
}: {
  posts: TopGundemPost[];
  terms: TopSearchTerm[];
}) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <div className="card-shadow rounded-2xl bg-white p-5">
        <div className="mb-3 flex items-center gap-1.5">
          <Newspaper className="h-4 w-4 text-bordo" />
          <h3 className="font-display text-base font-bold text-navy">En Çok Okunan Gündem Yazıları</h3>
        </div>
        {posts.length === 0 ? (
          <p className="text-sm text-ink/40">Henüz veri yok.</p>
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {posts.map((p, i) => (
              <div key={p.slug} className="flex items-center justify-between gap-2 py-2.5">
                <Link
                  href={`/gundem/${p.slug}`}
                  target="_blank"
                  className="min-w-0 truncate text-sm font-semibold text-navy hover:text-bordo"
                >
                  {i + 1}. {p.title}
                </Link>
                <span className="shrink-0 text-xs font-semibold text-ink/50">{p.view_count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card-shadow rounded-2xl bg-white p-5">
        <div className="mb-3 flex items-center gap-1.5">
          <Search className="h-4 w-4 text-bordo" />
          <h3 className="font-display text-base font-bold text-navy">En Çok Aranan Terimler</h3>
        </div>
        {terms.length === 0 ? (
          <p className="text-sm text-ink/40">Henüz veri yok.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {terms.map((t) => (
              <span key={t.term} className="rounded-full bg-offwhite px-3 py-1.5 text-xs font-semibold text-navy">
                {t.term} <span className="text-ink/40">· {t.count}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
