"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function ViewCounter({ businessId }: { businessId: string }) {
  useEffect(() => {
    supabase.rpc("increment_view_count", { business_id: businessId }).then(({ error }) => {
      if (error) console.error("View count could not be updated:", error);
    });
  }, [businessId]);

  return null;
}