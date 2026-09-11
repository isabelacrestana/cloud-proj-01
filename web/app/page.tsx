import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-10 bg-white px-4 py-12">
      <Image
        src="/logo-clube.png"
        alt="Clube Poliesportivo Campineiro - esporte, saude e convivencia"
        width={800}
        height={537}
        priority
        className="h-auto w-full max-w-lg"
      />

      <div className="flex w-full max-w-xs flex-col gap-3">
        <Link
          href="/login"
          className="rounded-full bg-[#0b1a2b] py-3 text-center text-base font-medium text-white transition hover:bg-[#16334f]"
        >
          Entrar
        </Link>
        <Link
          href="/cadastro"
          className="rounded-full border border-[#b08d57] py-3 text-center text-base font-medium text-[#1a3a52] transition hover:bg-[#f5f1e8]"
        >
          Criar conta
        </Link>
      </div>
    </main>
  );
}
