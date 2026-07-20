import type { Metadata } from "next";
import { Cookie } from "lucide-react";

export const metadata: Metadata = {
  title: "Çerez Politikası",
  description: "RehberGölbaşı çerez politikası — sitede hangi çerezlerin kullanıldığı.",
};

export default function CerezPolitikasiPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-navy/5 px-3 py-1.5 text-xs font-semibold text-navy">
        <Cookie className="h-3.5 w-3.5" /> Yasal
      </span>
      <h1 className="mb-2 font-display text-3xl font-bold leading-tight tracking-tight text-navy sm:text-4xl">
        Çerez Politikası
      </h1>
      <p className="mb-10 text-sm text-ink/50">
        Son güncelleme: {new Date().toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}
      </p>

      <div className="flex flex-col gap-8 leading-relaxed text-ink/80">
        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-navy">1. Çerez Nedir?</h2>
          <p>
            Çerezler, bir web sitesini ziyaret ettiğinde tarayıcına kaydedilen küçük
            metin dosyalarıdır. Sitenin düzgün çalışmasını sağlamak, tercihlerini
            hatırlamak veya ziyaretçi istatistiklerini ölçmek için kullanılabilirler.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-navy">
            2. Hangi Çerezleri Kullanıyoruz?
          </h2>
          <p className="mb-3">
            RehberGölbaşı&apos;nda iki tür çerez bulunur:
          </p>
          <ul className="ml-5 list-disc space-y-2">
            <li>
              <span className="font-semibold text-navy">Zorunlu teknik çerezler:</span> sitenin
              temel işlevlerinin (örn. çerez tercihi hatırlama, admin oturumu) çalışması
              için gereklidir, onay gerektirmez.
            </li>
            <li>
              <span className="font-semibold text-navy">Google Analytics çerezleri:</span> siteyi
              kaç kişinin ziyaret ettiği, hangi sayfaların ilgi gördüğü gibi anonim
              istatistikleri ölçmek için kullanılır. Bu çerezler{" "}
              <span className="font-semibold text-navy">yalnızca &quot;Kabul Et&quot; dediğinde</span>{" "}
              yüklenir; &quot;Reddet&quot; dersen veya bir seçim yapmazsan hiç çalışmaz. IP
              adresin anonimleştirilerek işlenir. Bu veriler Google tarafından, Google&apos;ın
              kendi{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-bordo hover:underline"
              >
                Gizlilik Politikası
              </a>{" "}
              kapsamında işlenir.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-navy">3. Tercihini Değiştirmek</h2>
          <p>
            Onay tercihini istediğin zaman değiştirebilirsin: tarayıcı geçmişini/site
            verilerini temizleyerek onay bildirimini tekrar tetikleyebilir, ya da
            tarayıcı ayarlarından çerezleri tamamen engelleyebilirsin. Reddetmen,
            sitenin temel işlevlerini kullanmanı engellemez.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-navy">4. Daha Fazla Bilgi</h2>
          <p>
            Kişisel verilerinin nasıl işlendiği hakkında daha fazla bilgi için{" "}
            <a href="/gizlilik-politikasi" className="font-semibold text-bordo hover:underline">
              Gizlilik Politikamıza
            </a>{" "}
            ve{" "}
            <a href="/kvkk" className="font-semibold text-bordo hover:underline">
              KVKK Aydınlatma Metnimize
            </a>{" "}
            göz atabilirsin.
          </p>
        </section>
      </div>
    </div>
  );
}