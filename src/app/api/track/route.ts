import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { business_id, event_type, referrer, device } = await req.json();

    await supabase.from("business_events").insert({
      business_id,
      event_type,
      referrer: referrer || null,
      device: device || "unknown",
    });

    // Profil görüntülemesi ise eski view_count kolonunu da artır
    if (event_type === "profile_view") {
      await supabase.rpc("increment_view_count", { business_id });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}