import Link from "next/link";
import { redirect } from "next/navigation";
import { BotaoSair } from "@/components/botao-sair";
import { lerSessao } from "@/lib/sessao";

export default async function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessao = await lerSessao();

  if (!sessao) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="bg-[#0b1a2b] text-white">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/cliente" className="font-semibold">
              Minhas reservas
            </Link>
            <Link href="/cliente/reservar" className="text-sm text-white/80 hover:text-white">
              Reservar quadra
            </Link>
          </div>
          <BotaoSair />
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
