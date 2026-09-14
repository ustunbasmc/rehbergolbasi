"use client";

import { useEffect } from "react";
import { trackGundemEvent } from "@/lib/analytics";

export default function GundemListViewTracker({ resultCount }: { resultCount: number }) {
  useEffect(() => {
    trackGundemEvent("news_list_view", { resultCount });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
