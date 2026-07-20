import { createClient } from "@supabase/supabase-js";

// UYARI: Bu dosya sadece sunucu tarafı kodda (API route/cron) kullanılmalı.
// İstemci bileşenlerinde ASLA import edilmemeli — service role anahtarı
// tüm RLS kurallarını atlar.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);