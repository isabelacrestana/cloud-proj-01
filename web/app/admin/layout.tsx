import Link from "next/link";
import { redirect } from "next/navigation";
import { BotaoSair } from "@/components/botao-sair";
import { lerSessao } from "@/lib/sessao";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessao = await lerSessao();

  // Roda no servidor, antes de qualquer pagina desta pasta ser renderizada:
  // quem nao passar daqui nunca recebe o HTML da area administrativa.
  if (!sessao) redirect("/login");
  if (sessao.papel !== "admin") redirect("/cliente");

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="bg-[#0b1a2b] text-white">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-semibold">
              Administracao
            </Link>
            <Link href="/admin/quadras" className="text-sm text-white/80 hover:text-white">
              Quadras
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
