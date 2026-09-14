"use client";

import { useEffect } from "react";
import { trackGundemEvent } from "@/lib/analytics";

/**
 * Sayfa açıldığında görüntülenme sayısını bir kez artırır. Aynı sekme/
 * oturumda sayfa yenilense bile tekrar saymaması için sessionStorage'da
 * basit bir "bu haberi bu oturumda zaten saydım" işareti tutulur (madde 21:
 * "her render veya sayfa yenilemesinde tekrar sayma"). Bu, tam bir bot/
 * kötüye kullanım koruması değildir — yalnızca gerçek bir tarayıcıda
 * JavaScript çalıştığında tetiklenir, bu da JS çalıştırmayan botları zaten
 * dışarıda bırakır.
 */
export default function GundemViewCounter({ slug }: { slug: string }) {
  useEffect(() => {
    trackGundemEvent("news_article_view", { postSlug: slug });

    const key = `gundem_viewed_${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // sessionStorage kullanılamıyorsa (gizli sekme vb.) yine de bir kez say.
    }
    fetch("/api/gundem/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
      keepalive: true,
    }).catch(() => {});
  }, [slug]);

  return null;
}
