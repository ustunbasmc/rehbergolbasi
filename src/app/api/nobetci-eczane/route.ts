import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      "https://eczaneapi.com/api/v1/pharmacies/on-duty?city=ankara&district=golbasi",
      {
        headers: {
          "X-API-Key": process.env.ECZANE_API_KEY!,
        },
        next: { revalidate: 3600 }, // 1 saatte bir güncelle
      }
    );

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ success: false, error: "Veri alınamadı" }, { status: 500 });
  }
}