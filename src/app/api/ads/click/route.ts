import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Reklam linkleri doğrudan bu route'a gider (`<a href="/api/ads/click?id=...">`)
 * — böylece tıklama sayımı client JS gerektirmeden, sağlam şekilde çalışır.
 * Tıklama sayılır, sonra reklamın gerçek `link_url`'ine yönlendirilir.
 * Geçersiz/bulunamayan id'de veya reklam pasif/süresi geçmişse ana sayfaya
 * düşer — kırık link yerine güvenli bir varsayılan.
 */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") ?? "";
  if (!UUID_RE.test(id)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const { data: ad } = await supabase
    .from("ad_slots")
    .select("link_url")
    .eq("id", id)
    .maybeSingle();

  if (!ad?.link_url) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  await supabase.rpc("increment_ad_click", { p_ad_id: id }).then(() => {});

  const destination = /^https?:\/\//i.test(ad.link_url)
    ? ad.link_url
    : new URL(ad.link_url, req.url);
  return NextResponse.redirect(destination);
}
