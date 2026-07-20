import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni",
  description: "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni.",
};

export default function KVKKPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-navy/5 px-3 py-1.5 text-xs font-semibold text-navy">
        <ShieldCheck className="h-3.5 w-3.5" /> Yasal
      </span>
      <h1 className="mb-2 font-display text-3xl font-bold leading-tight tracking-tight text-navy sm:text-4xl">
        KVKK Aydınlatma Metni
      </h1>
      <p className="mb-10 text-sm text-ink/50">
        6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) kapsamında
      </p>

      <div className="flex flex-col gap-8 leading-relaxed text-ink/80">
        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-navy">1. Veri Sorumlusu</h2>
          <p>
            İşbu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu
            (&quot;Kanun&quot;) uyarınca, veri sorumlusu sıfatıyla RehberGölbaşı
            (&quot;platform&quot;) tarafından, rehbergolbasi.com üzerinden elde
            edilen kişisel verilerin işlenmesine ilişkin olarak seni
            bilgilendirmek amacıyla hazırlanmıştır.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-navy">
            2. İşlenen Kişisel Veri Kategorileri
          </h2>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              <span className="font-semibold text-navy">Kimlik verisi:</span> ad-soyad
            </li>
            <li>
              <span className="font-semibold text-navy">İletişim verisi:</span> telefon
              numarası, e-posta adresi, adres
            </li>
            <li>
              <span className="font-semibold text-navy">İşletme verisi:</span> işletme
              adı, kategori, açıklama, çalışma saatleri, fotoğraf, menü ve sosyal
              medya bilgileri
            </li>
            <li>
              <span className="font-semibold text-navy">İşlem güvenliği verisi:</span>{" "}
              sayfa görüntülenme sayısı gibi anonim kullanım verileri
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-navy">
            3. Kişisel Verilerin İşlenme Amaçları
          </h2>
          <p>Kişisel verilerin, aşağıdaki amaçlarla sınırlı olarak işlenmesi hedeflenmektedir:</p>
          <ul className="ml-5 mt-2 list-disc space-y-1.5">
            <li>İşletme başvurularının değerlendirilmesi ve onaylanması</li>
            <li>Onaylanan işletme bilgilerinin herkese açık sayfalarda yayınlanması</li>
            <li>Ziyaretçi taleplerinin işletmelere ya da platforma iletilmesi</li>
            <li>Hizmet kalitesinin artırılması ve kötüye kullanımın önlenmesi</li>
            <li>Hukuki yükümlülüklerin yerine getirilmesi</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-navy">
            4. Kişisel Verilerin İşlenmesinin Hukuki Sebebi
          </h2>
          <p>
            Kişisel verilerin, Kanun&apos;un 5. maddesinde belirtilen &quot;ilgili
            kişinin açık rızasının bulunması&quot; ve &quot;bir sözleşmenin
            kurulması veya ifasıyla doğrudan doğruya ilgili olması&quot; hukuki
            sebeplerine dayanılarak işlenmektedir. Formları doldurarak ve göndererek
            açık rızanı vermiş olursun.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-navy">
            5. Kişisel Verilerin Aktarılması
          </h2>
          <p>
            Kişisel veriler, hizmetin sunulabilmesi için gerekli olan barındırma ve
            veritabanı altyapı sağlayıcılarımız (örn. Supabase) haricinde, yasal
            zorunluluk olmadıkça üçüncü kişilerle paylaşılmamaktadır. İşletme
            başvurusu sırasında girilen ve yayınlanması istenen bilgiler (işletme
            adı, adres, telefon vb.) doğası gereği herkese açık olarak sitede
            yayınlanır.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-navy">
            6. Kişisel Veri Sahibinin Hakları
          </h2>
          <p>Kanun&apos;un 11. maddesi uyarınca, kişisel veri sahibi olarak şu haklara sahipsin:</p>
          <ul className="ml-5 mt-2 list-disc space-y-1.5">
            <li>Kişisel verinin işlenip işlenmediğini öğrenme</li>
            <li>İşlenmişse buna ilişkin bilgi talep etme</li>
            <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Yurt içinde/yurt dışında aktarıldığı üçüncü kişileri bilme</li>
            <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
            <li>
              Kanun&apos;da öngörülen şartlar çerçevesinde silinmesini veya yok
              edilmesini isteme
            </li>
            <li>Düzeltme, silme, yok etme işlemlerinin, verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
            <li>
              İşlenen verilerin münhasıran otomatik sistemler ile analiz edilmesi
              suretiyle aleyhine bir sonuç ortaya çıkmasına itiraz etme
            </li>
            <li>Kanuna aykırı işlenme nedeniyle zarara uğraması hâlinde zararın giderilmesini talep etme</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-navy">7. Başvuru Yöntemi</h2>
          <p>
            Yukarıda sayılan haklarına ilişkin taleplerini{" "}
            <a href="/iletisim" className="font-semibold text-bordo hover:underline">
              iletişim sayfamız
            </a>{" "}
            üzerinden bize iletebilirsin. Talebin, niteliğine göre en kısa sürede
            ve en geç 30 gün içinde sonuçlandırılır.
          </p>
        </section>
      </div>
    </div>
  );
}