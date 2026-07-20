import type { Metadata } from "next";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Kullanım Şartları",
  description: "RehberGölbaşı kullanım şartları ve koşulları.",
};

export default function KullanimSartlariPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-navy/5 px-3 py-1.5 text-xs font-semibold text-navy">
        <FileText className="h-3.5 w-3.5" /> Yasal
      </span>
      <h1 className="mb-2 font-display text-3xl font-bold leading-tight tracking-tight text-navy sm:text-4xl">
        Kullanım Şartları
      </h1>
      <p className="mb-10 text-sm text-ink/50">
        Son güncelleme: {new Date().toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}
      </p>

      <div className="flex flex-col gap-8 leading-relaxed text-ink/80">
        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-navy">1. Kabul</h2>
          <p>
            rehbergolbasi.com&apos;u (&quot;platform&quot;) kullanarak ya da
            üzerinden bir başvuru göndererek bu kullanım şartlarını kabul etmiş
            olursun. Bu şartları kabul etmiyorsan platformu kullanmamalısın.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-navy">2. Hizmetin Tanımı</h2>
          <p>
            RehberGölbaşı, Gölbaşı, Ankara&apos;daki işletmelerin listelendiği
            ücretsiz bir dijital rehber hizmetidir. Platform, işletmeler ile
            ziyaretçileri buluşturan bir aracıdır; işletmelerin sunduğu ürün ve
            hizmetlerin sağlayıcısı değildir.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-navy">3. İşletme Başvuruları</h2>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>Başvuru sırasında girilen bilgilerin doğru ve güncel olması gerekir.</li>
            <li>
              Yanıltıcı, sahte veya başkasına ait işletmeler adına yapılan
              başvurular reddedilir ya da yayından kaldırılır.
            </li>
            <li>
              Başvurular yayına alınmadan önce ekibimiz tarafından incelenir;
              onaylanacağı garanti edilmez.
            </li>
            <li>
              Platform, herhangi bir işletme kaydını, kullanım şartlarına aykırılık
              tespit etmesi hâlinde önceden bildirimde bulunmaksızın yayından
              kaldırma hakkını saklı tutar.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-navy">4. İçerik Sorumluluğu</h2>
          <p>
            İşletme sayfalarındaki açıklama, fotoğraf, menü, fiyat ve diğer
            içeriklerin doğruluğundan ilgili işletme sahibi sorumludur. Platform,
            üçüncü kişilerce sağlanan bu içeriklerin doğruluğunu garanti etmez.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-navy">5. Yasak Kullanımlar</h2>
          <p>Platformu kullanırken şunları yapmamayı kabul edersin:</p>
          <ul className="ml-5 mt-2 list-disc space-y-1.5">
            <li>Yanlış veya yanıltıcı bilgi girmek</li>
            <li>Başka bir kişi veya işletme adına yetkisiz başvuru yapmak</li>
            <li>Platformun işleyişini bozacak teknik müdahalelerde bulunmak</li>
            <li>Elde edilen verileri izinsiz toplu şekilde çekmek (scraping)</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-navy">
            6. Sorumluluğun Sınırlandırılması
          </h2>
          <p>
            Platform, işletmelerle ziyaretçiler arasında gerçekleşen alışverişlere,
            hizmet kalitesine veya iletişimlere taraf değildir ve bunlardan doğacak
            zararlardan sorumlu tutulamaz. Hizmet &quot;olduğu gibi&quot; sunulur;
            kesintisiz veya hatasız çalışacağına dair garanti verilmez.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-navy">7. Fikri Mülkiyet</h2>
          <p>
            Platformun tasarımı, logosu ve yazılımı RehberGölbaşı&apos;na aittir.
            İşletmeler tarafından yüklenen fotoğraf ve içeriklerin telif hakkı
            ilgili işletmeye aittir; işletme, bu içerikleri platformda
            yayınlamamıza izin verdiğini kabul eder.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-navy">8. Değişiklikler</h2>
          <p>
            Bu şartları zaman zaman güncelleyebiliriz. Güncel şartlar her zaman bu
            sayfada yayınlanır.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-navy">9. Uygulanacak Hukuk</h2>
          <p>
            Bu şartlar Türkiye Cumhuriyeti kanunlarına tabidir; doğabilecek
            uyuşmazlıklarda Ankara mahkemeleri ve icra daireleri yetkilidir.
          </p>
        </section>
      </div>
    </div>
  );
}