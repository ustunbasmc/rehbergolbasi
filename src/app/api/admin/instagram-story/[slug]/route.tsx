import type { ReactNode } from "react";
import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";
import sharp from "sharp";
import { supabase } from "@/lib/supabase";
import { getCardDescription } from "@/lib/businessDescription";

export const runtime = "nodejs";

const NAVY = "#14213D";
const BORDO = "#7A1F2E";
const OFFWHITE = "#F7F7FA";
const INK_GRAY = "#5B6472";

const WIDTH = 1080;
const HEIGHT = 1920;
const PHONE_WIDTH = 860;
const PHOTO_HEIGHT = 560;

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
 * Satori (next/og) çok satırlı metinlerde `textAlign: "center"`'ı satır
 * bazında uygulamıyor (tüm blok sola yaslı kalıyor) — bu yüzden metni elle
 * satırlara bölüp her satırı ayrı, tek satırlık bir kutu olarak (bu
 * kutularda ortalama sorunsuz çalışıyor) render ediyoruz.
 */
function wrapLines(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function CenteredLine({
  text,
  style,
}: {
  text: string;
  style: Record<string, string | number>;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
      <span style={{ display: "flex", ...style }}>{text}</span>
    </div>
  );
}

/**
 * İşletme kapak fotoğrafları orijinal boyutuyla (bazen birkaç MB) doğrudan
 * Satori'ye verilirse, base64 olarak ara SVG'ye gömüldüğünde resvg'nin XML
 * ayrıştırıcı arabellek limitini aşıp "Buffer size limit exceeded" hatası
 * veriyor. Önce hedef boyuta küçültüp JPEG'e sıkıştırarak gömüyoruz.
 */
async function coverImageAsDataUri(url: string, width: number, height: number): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const original = Buffer.from(await res.arrayBuffer());
    const resized = await sharp(original)
      .resize(width, height, { fit: "cover" })
      .jpeg({ quality: 80 })
      .toBuffer();
    return `data:image/jpeg;base64,${resized.toString("base64")}`;
  } catch {
    return null;
  }
}

function PhoneSideButtons() {
  return (
    <>
      <div style={{ position: "absolute", left: -6, top: 190, width: 6, height: 60, borderRadius: 3, backgroundColor: "#1c1c22", display: "flex" }} />
      <div style={{ position: "absolute", left: -6, top: 270, width: 6, height: 100, borderRadius: 3, backgroundColor: "#1c1c22", display: "flex" }} />
      <div style={{ position: "absolute", left: -6, top: 390, width: 6, height: 100, borderRadius: 3, backgroundColor: "#1c1c22", display: "flex" }} />
      <div style={{ position: "absolute", right: -6, top: 280, width: 6, height: 140, borderRadius: 3, backgroundColor: "#1c1c22", display: "flex" }} />
    </>
  );
}

function ActionButton({
  label,
  bg,
  color,
  border,
  icon,
}: {
  label: string;
  bg: string;
  color: string;
  border?: string;
  icon: ReactNode;
}) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        backgroundColor: bg,
        border: border ?? "none",
        borderRadius: 18,
        padding: "18px 4px",
      }}
    >
      {icon}
      <span style={{ fontFamily: "Work Sans", fontSize: 20, fontWeight: 600, color }}>{label}</span>
    </div>
  );
}

function Icon({ color, children }: { color: string; children: ReactNode }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

/**
 * Yeni onaylanan bir işletme için 1080x1920 (Instagram Hikaye oranı) tanıtım
 * görseli üretir — admin panelinden indirilip Instagram hikayesine ELLE
 * yüklenmesi içindir (otomatik paylaşım değil, bkz. WhatsAppNotifier'daki
 * "kopyala-yapıştır" mantığının görsel karşılığı). Telefon çerçevesi içinde
 * işletme profilinin bir maketini gösterir; ekrandaki hakkında metni kasıtlı
 * olarak tuvalin altından taşar ("devamı var" hissi).
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { data: business } = await supabase
    .from("businesses")
    .select("name, neighborhood, cover_image_url, description, short_description, category:categories(name)")
    .eq("slug", slug)
    .eq("status", "approved")
    .maybeSingle();

  if (!business) {
    return new Response("İşletme bulunamadı", { status: 404 });
  }

  const categoryName = (business.category as unknown as { name: string } | null)?.name ?? "";
  const cardDescription = getCardDescription(business) ?? "";
  // Sabit metinlerin tam karakter kümesini elle takip etmek kırılgan —
  // özellikle büyük/küçük harf uyuşmazlığında (ör. "Hakkında" vs "HAKKINDA")
  // eksik glif nedeniyle bazı harfler yedek fonta düşüp tutarsız görünüyordu.
  // Türkçe dahil tüm Latin harflerini + rakamları garanti altına alıyoruz.
  const ALPHABET =
    "ABCÇDEFGĞHIİJKLMNOÖPQRSŞTUÜVWXYZabcçdefgğhıijklmnoöpqrstuüvwxyz0123456789";
  const allText = `${business.name} ${business.neighborhood ?? ""} ${categoryName} ${cardDescription} İşletme profiliyle sitemizde yayında! Gölbaşı'nın alanında en iyi işletmeleri aynı yerde buluşuyor. Profili İncele Yeni Ara WhatsApp Yol Tarifi Paylaş HAKKINDA rehbergolbasi.com ${ALPHABET}`;

  const [bitterBold, workSansBold, workSansMedium, coverDataUri] = await Promise.all([
    loadGoogleFont("Bitter", 800, allText),
    loadGoogleFont("Work Sans", 800, allText),
    loadGoogleFont("Work Sans", 600, allText),
    business.cover_image_url ? coverImageAsDataUri(business.cover_image_url, PHONE_WIDTH, PHOTO_HEIGHT) : Promise.resolve(null),
  ]);

  const logoDataUri = publicFileAsDataUri("logo.png");

  return new ImageResponse(
    (
      <div
        style={{
          width: WIDTH,
          height: HEIGHT,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          backgroundColor: OFFWHITE,
          paddingTop: 70,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoDataUri} alt="" width={560} height={115} />

        <div style={{ display: "flex", flexDirection: "column", marginTop: 40 }}>
          {wrapLines(business.name, 20).map((line, i) => (
            <CenteredLine
              key={i}
              text={line}
              style={{ fontFamily: "Work Sans", fontWeight: 800, fontSize: 64, color: NAVY, lineHeight: 1.15 }}
            />
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: 24, gap: 4 }}>
          <CenteredLine
            text="İşletme profiliyle sitemizde yayında! Gölbaşı'nın"
            style={{ fontFamily: "Work Sans", fontWeight: 500, fontSize: 32, color: INK_GRAY }}
          />
          <CenteredLine
            text="alanında en iyi işletmeleri aynı yerde buluşuyor."
            style={{ fontFamily: "Work Sans", fontWeight: 500, fontSize: 32, color: INK_GRAY }}
          />
        </div>

        <svg
          style={{ marginTop: 32 }}
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke={NAVY}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9L12 15L18 9" />
        </svg>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 32,
            backgroundColor: "#FFFFFF",
            borderRadius: 999,
            padding: "26px 56px",
            boxShadow: "0 10px 30px rgba(20,33,61,0.12)",
          }}
        >
          <span style={{ fontFamily: "Work Sans", fontWeight: 800, fontSize: 30, color: NAVY }}>
            Profili İncele
          </span>
        </div>

        {/* Telefon çerçevesi */}
        <div
          style={{
            position: "relative",
            display: "flex",
            marginTop: 56,
            width: PHONE_WIDTH,
          }}
        >
          <PhoneSideButtons />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: PHONE_WIDTH,
              backgroundColor: "#0B0B0F",
              borderRadius: 70,
              padding: "88px 22px 0 22px",
              boxShadow: "0 40px 70px rgba(11,21,38,0.35)",
            }}
          >
            {/* Çentik */}
            <div
              style={{
                position: "absolute",
                top: 34,
                left: PHONE_WIDTH / 2 - 90,
                width: 180,
                height: 26,
                borderRadius: 13,
                backgroundColor: "#000000",
                display: "flex",
              }}
            />

            {/* Ekran */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                backgroundColor: "#FFFFFF",
                borderTopLeftRadius: 44,
                borderTopRightRadius: 44,
                overflow: "hidden",
              }}
            >
              {/* Kapak fotoğrafı + rozetler */}
              <div style={{ position: "relative", display: "flex", width: "100%", height: PHOTO_HEIGHT }}>
                {coverDataUri ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coverDataUri}
                    alt=""
                    width={PHONE_WIDTH - 44}
                    height={PHOTO_HEIGHT}
                    style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: "flex",
                      background: `linear-gradient(135deg, ${NAVY} 0%, ${BORDO} 100%)`,
                    }}
                  />
                )}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: "flex",
                    background: "linear-gradient(to top, rgba(11,21,38,0.85) 0%, rgba(11,21,38,0.1) 55%, rgba(11,21,38,0) 75%)",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    top: 24,
                    left: 24,
                    right: 24,
                    display: "flex",
                    flexDirection: "row",
                    gap: 10,
                  }}
                >
                  {categoryName && (
                    <div
                      style={{
                        display: "flex",
                        backgroundColor: "rgba(255,255,255,0.92)",
                        borderRadius: 999,
                        padding: "10px 18px",
                      }}
                    >
                      <span style={{ fontFamily: "Work Sans", fontWeight: 600, fontSize: 18, color: NAVY }}>
                        {categoryName}
                      </span>
                    </div>
                  )}
                  {business.neighborhood && (
                    <div
                      style={{
                        display: "flex",
                        backgroundColor: "rgba(255,255,255,0.92)",
                        borderRadius: 999,
                        padding: "10px 18px",
                      }}
                    >
                      <span style={{ fontFamily: "Work Sans", fontWeight: 600, fontSize: 18, color: NAVY }}>
                        {business.neighborhood}
                      </span>
                    </div>
                  )}
                </div>

                <div
                  style={{
                    position: "absolute",
                    top: 76,
                    left: 24,
                    display: "flex",
                    backgroundColor: BORDO,
                    borderRadius: 999,
                    padding: "10px 20px",
                  }}
                >
                  <span style={{ fontFamily: "Work Sans", fontWeight: 700, fontSize: 18, color: "#FFFFFF" }}>
                    ✨ Yeni
                  </span>
                </div>

                <span
                  style={{
                    position: "absolute",
                    left: 28,
                    right: 28,
                    bottom: 24,
                    fontFamily: "Bitter",
                    fontWeight: 800,
                    fontSize: 46,
                    color: "#FFFFFF",
                    lineHeight: 1.1,
                  }}
                >
                  {business.name}
                </span>
              </div>

              {/* Eylem butonları */}
              <div style={{ display: "flex", gap: 12, padding: "20px 24px" }}>
                <ActionButton
                  label="Ara"
                  bg={BORDO}
                  color="#FFFFFF"
                  icon={
                    <Icon color="#FFFFFF">
                      <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
                    </Icon>
                  }
                />
                <ActionButton
                  label="WhatsApp"
                  bg={NAVY}
                  color="#FFFFFF"
                  icon={
                    <Icon color="#FFFFFF">
                      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                    </Icon>
                  }
                />
                <ActionButton
                  label="Yol Tarifi"
                  bg="#FFFFFF"
                  color={NAVY}
                  border={`2px solid ${OFFWHITE}`}
                  icon={
                    <Icon color={NAVY}>
                      <path d="M3 11L22 2L13 21L11 13Z" />
                    </Icon>
                  }
                />
                <ActionButton
                  label="Paylaş"
                  bg="#FFFFFF"
                  color={NAVY}
                  border={`2px solid ${OFFWHITE}`}
                  icon={
                    <Icon color={NAVY}>
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <path d="M8.59 13.51L15.42 17.49" />
                      <path d="M15.41 6.51L8.59 10.49" />
                    </Icon>
                  }
                />
              </div>

              {/* Hakkında önizlemesi — bilerek tuvalin altından taşabilir */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "4px 28px 40px 28px" }}>
                <span
                  style={{
                    fontFamily: "Work Sans",
                    fontWeight: 700,
                    fontSize: 18,
                    letterSpacing: 2,
                    color: "#9AA3AF",
                  }}
                >
                  HAKKINDA
                </span>
                {cardDescription && (
                  <span
                    style={{
                      fontFamily: "Work Sans",
                      fontWeight: 500,
                      fontSize: 26,
                      color: "#374151",
                      lineHeight: 1.5,
                    }}
                  >
                    {cardDescription}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        { name: "Bitter", data: bitterBold, weight: 800, style: "normal" },
        { name: "Work Sans", data: workSansBold, weight: 800, style: "normal" },
        { name: "Work Sans", data: workSansMedium, weight: 600, style: "normal" },
      ],
    }
  );
}
