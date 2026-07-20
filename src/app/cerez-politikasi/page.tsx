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
          <h2 className="mb-2 font-display text-lg font-bold text-navy">2. Şu An Hangi Çerezleri Kullanıyoruz?</h2>
          <p>
            RehberGölbaşı, bu politikanın yayınlandığı tarih itibarıyla{" "}
            <span className="font-semibold text-navy">
              takip amaçlı veya reklam amaçlı üçüncü taraf çerezleri kullanmamaktadır.
            </span>{" "}
            Sitenin temel işlevlerinin (örneğin oturum durumu, admin girişi) çalışması
            için gerekli olan zorunlu teknik çerezler dışında herhangi bir çerez
            saklanmaz.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-navy">3. İleride Neler Değişebilir?</h2>
          <p>
            Ziyaretçi sayısı ve site performansı gibi anonim istatistikleri ölçmek
            için ileride Google Analytics gibi analiz araçları ekleyebiliriz. Bu
            durumda bu sayfayı güncelleyip, kullanılan çerez türlerini ve amaçlarını
            burada açıkça listeleyeceğiz; gerekiyorsa tarayıcında bir onay
            (rıza) seçeneği sunacağız.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-navy">4. Çerezleri Nasıl Kontrol Edebilirsin?</h2>
          <p>
            Çoğu tarayıcı, çerezleri otomatik olarak kabul edecek şekilde
            ayarlanmıştır. Tarayıcı ayarlarından mevcut çerezleri silebilir veya
            yeni çerezlerin kaydedilmesini engelleyebilirsin; ancak bu, bazı site
            özelliklerinin beklendiği gibi çalışmamasına yol açabilir.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-navy">5. Daha Fazla Bilgi</h2>
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