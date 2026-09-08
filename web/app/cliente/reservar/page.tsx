import { lerSessao } from "@/lib/sessao";
import { pool } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { redirect } from "next/navigation";
import ReservaClient from "./ReservaClient";

interface Quadra extends RowDataPacket {
  id: number;
  nome: string;
  modalidade: string;
  coberta: boolean;
  valor_hora: number;
}

export default async function ReservarPage() {
  const sessao = await lerSessao();

  if (!sessao) {
    redirect("/login");
  }

  // Busca as quadras ativas diretamente no servidor
  const [quadras] = await pool.execute<Quadra[]>(
    `SELECT id, nome, modalidade, coberta, valor_hora 
     FROM quadra 
     WHERE ativa = TRUE 
     ORDER BY modalidade, nome`
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1a3a52]">Reservar Quadra</h1>
        <p className="mt-2 text-zinc-600">
          Selecione a quadra, escolha um dia no calendário e veja os horários disponíveis.
        </p>
      </div>

      {/* Chama o componente cliente passando as quadras e o ID do usuário */}
      <ReservaClient quadras={quadras} usuarioId={sessao.id} />
    </div>
  );
}