"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Tag } from "@/lib/types";

export default function TagsSelector({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("tags")
      .select("*")
      .order("display_order", { ascending: true })
      .then(({ data }) => {
        setTags(data ?? []);
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
  if (tags.length === 0) return <p className="text-xs text-ink/40">Henüz etiket eklenmedi.</p>;

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const active = value.includes(tag.id);
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggle(tag.id)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              active
                ? "border-navy bg-navy/10 text-navy"
                : "border-line text-ink/60 hover:border-navy/40"
            }`}
          >
            {tag.name}
          </button>
        );
      })}
    </div>
  );
}