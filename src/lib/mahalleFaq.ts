import { turkishDirSuffix, type Mahalle } from "@/data/mahalleler";

export interface MahalleFaqItem {
  id: string;
  question: string;
  answer: string;
}

/**
 * Mahalle sayfası için SSS (FAQPage) içeriği — tamamen mahalle verisinden
 * (muhtar, nüfus, işletme kategorileri) türetilir, uydurma içerik yok.
 */
export function buildMahalleFaqs(
  mahalle: Mahalle,
  businessCount: number,
  topCategoryNames: string[]
): MahalleFaqItem[] {
  const faqs: MahalleFaqItem[] = [
    {
      id: "muhtar",
      question: `${mahalle.name} Mahallesi'nin muhtarı kimdir?`,
      answer: `${mahalle.name} Mahallesi'nin muhtarı ${mahalle.muhtar.name}${turkishDirSuffix(mahalle.muhtar.name)}. Kendisine ${mahalle.muhtar.mobile} numaralı telefondan ulaşabilirsiniz.`,
    },
    {
      id: "konum",
      question: `${mahalle.name} Mahallesi nerede, hangi ilçeye bağlıdır?`,
      answer: `${mahalle.name} Mahallesi, Ankara'nın Gölbaşı ilçesine bağlı bir mahalledir.`,
    },
  ];

  if (mahalle.population2023) {
    faqs.push({
      id: "nufus",
      question: `${mahalle.name} Mahallesi'nin nüfusu kaçtır?`,
      answer: `TÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2023 verilerine göre ${mahalle.name} Mahallesi'nin nüfusu ${mahalle.population2023.toLocaleString("tr-TR")} kişidir.`,
    });
  }

  if (businessCount > 0) {
    faqs.push({
      id: "isletmeler",
      question: `${mahalle.name} Mahallesi'nde hangi işletmeler bulunuyor?`,
      answer:
        topCategoryNames.length > 0
          ? `RehberGölbaşı'nda bu mahallede kayıtlı ${businessCount} işletme bulunuyor; öne çıkan kategoriler arasında ${topCategoryNames.join(", ")} yer alıyor.`
          : `RehberGölbaşı'nda bu mahallede kayıtlı ${businessCount} işletme bulunuyor.`,
    });
  } else {
    faqs.push({
      id: "isletmeler",
      question: `${mahalle.name} Mahallesi'nde hangi işletmeler bulunuyor?`,
      answer: `Şu an bu mahallede kayıtlı bir işletme bulunmuyor. Mahallenizde bir işletme işletiyorsanız hemen ekleyerek RehberGölbaşı'nda ilk sırada yer alabilirsiniz.`,
    });
  }

  faqs.push({
    id: "muhtarlik-konum",
    question: `${mahalle.name} Mahallesi Muhtarlığı'na nasıl gidebilirim?`,
    answer: "Muhtarlık ofisinin konumuna bu sayfadaki haritadan ulaşabilir, doğrudan yol tarifi alabilirsiniz.",
  });

  return faqs;
}
