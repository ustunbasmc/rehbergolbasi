"use client";

import { useEffect } from "react";
import { trackPageView, type PageViewEventType } from "@/lib/analytics";

export default function PageViewTracker({
  eventType,
  query,
  resultCount,
}: {
  eventType: PageViewEventType;
  query?: string;
  resultCount?: number;
}) {
  useEffect(() => {
    trackPageView(eventType, { query, resultCount });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
