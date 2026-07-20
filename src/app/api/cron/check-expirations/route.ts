import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

function daysBetween(a: Date, b: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcB - utcA) / msPerDay);
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
  }

  const today = new Date();

  const { data: businesses, error } = await supabaseAdmin
    .from("businesses")
    .select("id, name, slug, free_until, paid_until, is_active")
    .eq("status", "approved")
    .eq("is_active", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results = { warned10: 0, warned3: 0, warned0: 0, deactivated: 0 };

  for (const b of businesses ?? []) {
    const expiry = b.paid_until ?? b.free_until;
    if (!expiry) continue;

    const daysLeft = daysBetween(today, new Date(expiry));

    if (daysLeft === 10) {
      const { error: insertError } = await supabaseAdmin
        .from("expiry_alerts")
        .insert({ business_id: b.id, alert_type: "10_gun" });
      if (!insertError) results.warned10++;
    } else if (daysLeft === 3) {
      const { error: insertError } = await supabaseAdmin
        .from("expiry_alerts")
        .insert({ business_id: b.id, alert_type: "3_gun" });
      if (!insertError) results.warned3++;
    } else if (daysLeft === 0) {
      const { error: insertError } = await supabaseAdmin
        .from("expiry_alerts")
        .insert({ business_id: b.id, alert_type: "son_gun" });
      if (!insertError) results.warned0++;
    } else if (daysLeft === -7) {
      await supabaseAdmin.from("businesses").update({ is_active: false }).eq("id", b.id);
      await supabaseAdmin
        .from("expiry_alerts")
        .insert({ business_id: b.id, alert_type: "pasife_alindi" });
      results.deactivated++;
    }
  }

  return NextResponse.json({ ok: true, checked: businesses?.length ?? 0, ...results });
}