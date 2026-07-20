"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Feature } from "@/lib/types";

export default function FeaturesSelector({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("features")
      .select("*")
      .order("display_order", { ascending: true })
      .then(({ data }) => {
        setFeatures(data ?? []);
        setLoading(false);
      });
  }, []);

  function toggle(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  }

  if (loading) return <p className="text-xs text-ink/40">Yükleniyor...</p>;
  if (features.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {features.map((feature) => {
        const active = value.includes(feature.id);
        return (
          <button
            key={feature.id}
            type="button"
            onClick={() => toggle(feature.id)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              active
                ? "border-bordo bg-bordo/10 text-bordo"
                : "border-line text-ink/60 hover:border-bordo/40"
            }`}
          >
            {feature.name}
          </button>
        );
      })}
    </div>
  );
}