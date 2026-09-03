import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-4 py-10">
      <div className="w-full max-w-sm rounded-3xl bg-[#f5f1e8] px-7 py-8 shadow-lg ring-1 ring-black/5">
        <Link href="/" aria-label="Voltar para a pagina inicial">
          <Image
            src="/logo_club.png"
            alt="Clube Poliesportivo Campineiro"
            width={310}
            height={290}
            priority
            className="mx-auto mb-5 h-auto w-24 transition hover:opacity-80"
          />
        </Link>
        {children}
      </div>

      <Link
        href="/"
        className="text-sm text-[#1a3a52] transition hover:underline"
      >
        &larr; Voltar ao inicio
      </Link>
    </div>
  );
}
