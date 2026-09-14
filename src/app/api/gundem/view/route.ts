import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

const SLUG_RE = /^[a-z0-9-]{1,120}$/;

/**
 * Görüntülenme sayacını `increment_gundem_view_count` RPC'si üzerinden
 * artırır (SECURITY DEFINER — anon rolü doğrudan UPDATE yapamaz, yalnızca
 * bu fonksiyonu çağırabilir). RPC zaten yalnızca gerçekten public görünür
 * (yayında/zamanlaması geçmiş, silinmemiş) bir kayıtta sayaç artırır; taslak
 * veya henüz yayınlanmamış bir slug sessizce hiçbir şey yapmaz.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const slug = typeof body?.slug === "string" ? body.slug : "";
    if (!SLUG_RE.test(slug)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    await supabase.rpc("increment_gundem_view_count", { p_slug: slug });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
