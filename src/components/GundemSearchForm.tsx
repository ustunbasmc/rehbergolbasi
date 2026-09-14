"use client";

import { Search } from "lucide-react";
import { trackGundemEvent } from "@/lib/analytics";

export default function GundemSearchForm({ defaultValue }: { defaultValue: string }) {
  return (
    <form
      action="/gundem"
      method="get"
      onSubmit={() => trackGundemEvent("news_search")}
      className="mt-6 flex flex-col gap-2.5 sm:flex-row"
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
        <input
          type="text"
          name="q"
          defaultValue={defaultValue}
          placeholder="Gündemde ara..."
          className="min-h-12 w-full rounded-xl border border-line pl-10 pr-3 text-base outline-none focus:border-bordo"
        />
      </div>
      <button type="submit" className="min-h-12 rounded-xl bg-navy px-6 text-sm font-bold text-white hover:bg-navy-dark">
        Ara
      </button>
    </form>
  );
}
