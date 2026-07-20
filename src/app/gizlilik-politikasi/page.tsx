import type { Metadata } from "next";
import { Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  description: "RehberGölbaşı gizlilik politikası — kişisel verilerin nasıl toplandığı ve kullanıldığı.",
};

export default function GizlilikPolitikasiPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-navy/5 px-3 py-1.5 text-xs font-semibold text-navy">
        <Lock className="h-3.5 w-3.5" /> Yasal
      </span>
      <h1 className="mb-2 font-display text-3xl font-bold leading-tight tracking-tight text-navy sm:text-4xl">
        Gizlilik Politikası
      </h1>
      <p className="mb-10 text-sm text-ink/50">Son güncelleme: {new Date().toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}</p>

      <div className="flex flex-col gap-8 leading-relaxed text-ink/80">
        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-navy">1. Bu Politika Neyi Kapsar?</h2>
          <p>
            RehberGölbaşı (&quot;biz&quot;, &quot;platform&quot;) olarak, rehbergolbasi.com
            üzerinden topladığımız kişisel verileri nasıl işlediğimizi bu politikada
            açıklıyoruz. Siteyi ziyaret ederek ya da formlarımızı doldurarak bu
            politikayı kabul etmiş olursun.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-navy">2. Hangi Verileri Topluyoruz?</h2>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              <span className="font-semibold text-navy">İşletme başvurusu bilgileri:</span> işletme
              adı, kategori, açıklama, adres, telefon, WhatsApp, sosyal medya linkleri,
              çalışma saatleri, fotoğraflar, menü ve SSS içerikleri.
            </li>
            <li>
              <span className="font-semibold text-navy">İsteğe bağlı sahiplik bilgisi:</span>{" "}
              işletme sahibinin adı, telefonu ve e-postası. Bu bilgiler sitede
              yayınlanmaz, sadece doğrulama amacıyla saklanır.
            </li>
            <li>
              <span className="font-semibold text-navy">İletişim talepleri:</span> &quot;Sizi
              Arayalım&quot;, bildirim ve sahiplenme formlarında bıraktığın ad, telefon
              ve mesaj içeriği.
            </li>
            <li>
              <span className="font-semibold text-navy">Teknik veriler:</span> sayfa
              görüntülenme sayıları gibi anonim kullanım istatistikleri.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-navy">3. Verileri Ne İçin Kullanıyoruz?</h2>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>İşletme başvurularını incelemek ve onaylamak</li>
            <li>İşletme sayfalarını herkese açık olarak yayınlamak</li>
            <li>Sana veya işletme sahibine geri dönüş yapmak</li>
            <li>Platformu geliştirmek ve kötüye kullanımı önlemek</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-navy">4. Verileri Kimlerle Paylaşıyoruz?</h2>
          <p>
            Verilerini üçüncü taraflara satmıyoruz. Verilerin barındırıldığı
            altyapı sağlayıcımız (veritabanı ve dosya depolama için Supabase)
            dışında, yasal bir zorunluluk olmadıkça verilerini paylaşmıyoruz.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-navy">5. Çerezler</h2>
          <p>
            Şu an sitede takip amaçlı çerez kullanmıyoruz. İleride ziyaretçi
            istatistikleri için analiz araçları eklersek, bu politikayı güncelleyip
            seni bilgilendireceğiz.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-navy">6. Haklarımız ve Senin Hakların</h2>
          <p>
            Kişisel verilerinin hangi amaçla işlendiğini öğrenme, düzeltilmesini
            veya silinmesini talep etme hakkına sahipsin. Detaylı haklar için{" "}
            <a href="/kvkk" className="font-semibold text-bordo hover:underline">
              KVKK Aydınlatma Metnimize
            </a>{" "}
            bakabilirsin.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-navy">7. Bize Ulaş</h2>
          <p>
            Gizlilikle ilgili sorularını{" "}
            <a href="/iletisim" className="font-semibold text-bordo hover:underline">
              iletişim sayfamız
            </a>{" "}
            üzerinden bize iletebilirsin.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-navy">8. Değişiklikler</h2>
          <p>
            Bu politikayı zaman zaman güncelleyebiliriz. Önemli değişikliklerde
            sayfanın üstündeki güncelleme tarihini yenileriz.
          </p>
        </section>
      </div>
    </div>
  );
}