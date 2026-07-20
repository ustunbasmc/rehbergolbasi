import Link from "next/link";

export default function TesekkurlerPage() {
  return (
    <div className="mx-auto max-w-lg px-5 py-24 text-center">
      <h1 className="mb-3 font-display text-3xl font-bold text-navy">Teşekkürler!</h1>
      <p className="mb-8 text-ink/60">
        Başvurun bize ulaştı. İnceleyip onayladıktan sonra işletmen RehberGölbaşı&apos;nda
        yayına alınacak.
      </p>
      <Link
        href="/"
        className="inline-block rounded-lg bg-bordo px-5 py-3 text-sm font-bold text-white hover:bg-bordo-dark"
      >
        Ana sayfaya dön
      </Link>
    </div>
  );
}