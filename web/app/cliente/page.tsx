import { lerSessao } from "@/lib/sessao";

export default async function MinhasReservasPage() {
  const sessao = await lerSessao();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#1a3a52]">Minhas reservas</h1>
      <p className="mt-2 text-zinc-600">
        Sessao ativa: usuario #{sessao?.id}, papel {sessao?.papel}.
      </p>
    </div>
  );
}
