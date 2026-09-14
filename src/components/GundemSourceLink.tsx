"use client";

import { ExternalLink } from "lucide-react";
import { trackGundemEvent } from "@/lib/analytics";

export default function GundemSourceLink({ url, label, postSlug }: { url: string; label: string; postSlug: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      onClick={() => trackGundemEvent("news_source_click", { postSlug })}
      className="inline-flex items-center gap-1 font-semibold text-bordo hover:underline"
    >
      {label} <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}
