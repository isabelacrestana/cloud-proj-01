import { redirect } from "next/navigation";
import { BotaoSair } from "@/components/botao-sair";
import { ClientNav } from "@/components/client-nav";
import { lerSessao } from "@/lib/sessao";

export default async function ReservasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verifica se o usuário está logado
  const sessao = await lerSessao();

  // Redireciona para login se não houver sessão ativa
  if (!sessao) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="bg-[#0b1a2b] text-white shadow-md">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="text-xl font-bold tracking-wide">Clube Reservas</div>
          <div className="flex items-center gap-6">
            <ClientNav />
            <BotaoSair />
          </div>
        </nav>
      </header>
      
      {/* Container principal onde a page.tsx será injetada */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
