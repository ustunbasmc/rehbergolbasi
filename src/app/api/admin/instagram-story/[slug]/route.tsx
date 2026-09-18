import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";
import sharp from "sharp";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

const NAVY = "#14213D";
const NAVY_DARK = "#0B1526";
const BORDO = "#7A1F2E";
const GOLD = "#C9A24B";

const WIDTH = 1080;
const HEIGHT = 1920;

/**
 * Satori (next/og'nin render motoru) sistem fontlarını kullanamıyor, font
 * verisini kendimiz sağlamamız gerekiyor. `text` parametresi Google Fonts'un
 * yalnızca gerçekten kullanılan karakterleri (Türkçe İ/ı/ş/ğ/ö/ü dahil)
 * içeren bir alt küme döndürmesini sağlar.
 */
async function loadGoogleFont(fontFamily: string, weight: number, text: string) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(cssUrl)).text();
  const match = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/);
  if (match) {
    const res = await fetch(match[1]);
    if (res.ok) return await res.arrayBuffer();
  }
  throw new Error(`${fontFamily} fontu yüklenemedi`);
}

function publicFileAsDataUri(fileName: string): string {
  const buf = readFileSync(join(process.cwd(), "public", fileName));
  return `data:image/png;base64,${buf.toString("base64")}`;
}

/**
 * İşletme kapak fotoğrafları orijinal boyutuyla (bazen birkaç MB) doğrudan
 * Satori'ye verilirse, base64 olarak ara SVG'ye gömüldüğünde resvg'nin XML
 * ayrıştırıcı arabellek limitini aşıp "Buffer size limit exceeded" hatası
 * veriyor. Önce hikaye boyutuna küçültüp JPEG'e sıkıştırarak gömüyoruz.
 */
async function coverImageAsDataUri(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const original = Buffer.from(await res.arrayBuffer());
    const resized = await sharp(original)
      .resize(WIDTH, HEIGHT, { fit: "cover" })
      .jpeg({ quality: 78 })
      .toBuffer();
    return `data:image/jpeg;base64,${resized.toString("base64")}`;
  } catch {
    return null;
  }
}

/**
 * Yeni onaylanan bir işletme için 1080x1920 (Instagram Hikaye oranı) tanıtım
 * görseli üretir — admin panelinden indirilip Instagram hikayesine ELLE
 * yüklenmesi içindir (otomatik paylaşım değil, bkz. WhatsAppNotifier'daki
 * "kopyala-yapıştır" mantığının görsel karşılığı). İşletme fotoğrafı yoksa
 * markalı bir gradyan arka plana düşer.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { data: business } = await supabase
    .from("businesses")
    .select("name, neighborhood, cover_image_url, category:categories(name)")
    .eq("slug", slug)
    .eq("status", "approved")
    .maybeSingle();

  if (!business) {
    return new Response("İşletme bulunamadı", { status: 404 });
  }

  const categoryName = (business.category as unknown as { name: string } | null)?.name ?? "";
  const allText = `${business.name} ${business.neighborhood ?? ""} ${categoryName} YENİ İŞLETME rehbergolbasi.com`;

  const [bitterBold, workSans, coverDataUri] = await Promise.all([
    loadGoogleFont("Bitter", 800, allText),
    loadGoogleFont("Work Sans", 600, allText),
    business.cover_image_url ? coverImageAsDataUri(business.cover_image_url) : Promise.resolve(null),
  ]);

  const logoDataUri = publicFileAsDataUri("logo.png");

  return new ImageResponse(
    (
      <div
        style={{
          width: WIDTH,
          height: HEIGHT,
          display: "flex",
          position: "relative",
          backgroundColor: NAVY,
        }}
      >
        {coverDataUri ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverDataUri}
            alt=""
            width={WIDTH}
            height={HEIGHT}
            style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              background: `linear-gradient(135deg, ${NAVY} 0%, ${BORDO} 100%)`,
            }}
          />
        )}

        {/* Alt kısımdaki yazıların her fotoğrafın üzerinde okunaklı kalması için karartma */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background: `linear-gradient(to top, ${NAVY_DARK} 0%, rgba(11,21,38,0.75) 32%, rgba(11,21,38,0.05) 62%, rgba(11,21,38,0.4) 100%)`,
          }}
        />

        {/* Logo rozeti */}
        <div
          style={{
            position: "absolute",
            top: 72,
            left: 64,
            display: "flex",
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.96)",
            borderRadius: 999,
            padding: "20px 32px",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoDataUri} alt="" width={320} height={66} />
        </div>

        {/* Yeni işletme rozeti */}
        <div
          style={{
            position: "absolute",
            top: 78,
            right: 64,
            display: "flex",
            backgroundColor: GOLD,
            borderRadius: 999,
            padding: "18px 34px",
          }}
        >
          <span
            style={{
              fontFamily: "Bitter",
              fontSize: 30,
              fontWeight: 800,
              color: NAVY_DARK,
              letterSpacing: 1,
            }}
          >
            YENİ İŞLETME
          </span>
        </div>

        {/* Alt bilgi bloğu */}
        <div
          style={{
            position: "absolute",
            left: 64,
            right: 64,
            bottom: 150,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {categoryName && (
            <span
              style={{
                fontFamily: "Work Sans",
                fontSize: 34,
                fontWeight: 600,
                color: GOLD,
                textTransform: "uppercase",
                letterSpacing: 3,
              }}
            >
              {categoryName}
            </span>
          )}
          <span
            style={{
              fontFamily: "Bitter",
              fontSize: 82,
              fontWeight: 800,
              color: "#FFFFFF",
              lineHeight: 1.08,
            }}
          >
            {business.name}
          </span>
          {business.neighborhood && (
            <span
              style={{
                fontFamily: "Work Sans",
                fontSize: 38,
                fontWeight: 500,
                color: "rgba(255,255,255,0.85)",
              }}
            >
              {business.neighborhood}
            </span>
          )}
        </div>

        {/* Alt CTA şeridi */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: NAVY_DARK,
          }}
        >
          <span
            style={{
              fontFamily: "Work Sans",
              fontSize: 32,
              fontWeight: 600,
              color: GOLD,
              letterSpacing: 1,
            }}
          >
            rehbergolbasi.com
          </span>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        { name: "Bitter", data: bitterBold, weight: 800, style: "normal" },
        { name: "Work Sans", data: workSans, weight: 600, style: "normal" },
      ],
    }
  );
}
