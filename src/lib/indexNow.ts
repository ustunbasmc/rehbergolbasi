const INDEXNOW_KEY = "c2f5d09ca0be1e5bc1473cd929269b36";

/**
 * Bir URL'nin yeni eklendiğini/güncellendiğini arama motorlarına bildirir.
 * Yanıtı okumaya gerek olmadığı için "no-cors" modunda, sonucu beklemeden
 * (fire-and-forget) çalışır — başarısız olsa bile uygulamayı etkilemez.
 */
export function pingIndexNow(url: string) {
  try {
    const endpoint = `https://api.indexnow.org/indexnow?url=${encodeURIComponent(
      url
    )}&key=${INDEXNOW_KEY}`;
    fetch(endpoint, { mode: "no-cors" }).catch(() => {
      // Sessizce yoksay, kritik değil
    });
  } catch {
    // Sessizce yoksay
  }
}