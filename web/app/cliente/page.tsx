import { lerSessao } from "@/lib/sessao";
import { pool } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// Definição da interface mesclando dados das tabelas 'reserva' e 'quadra'
interface ReservaUsuario extends RowDataPacket {
  id: number;
  data_reserva: Date;
  hora_inicio: string;
  hora_fim: string;
  status: 'confirmada' | 'cancelada';
  quadra_nome: string;
  modalidade: string;
}

export default async function MinhasReservasPage() {
  const sessao = await lerSessao();

  if (!sessao) {
    redirect("/login");
  }

  // =================================================================
  // SERVER ACTION: Função executada no servidor ao clicar em Cancelar
  // =================================================================
  async function cancelarReserva(formData: FormData) {
    "use server";
    
    const reservaId = formData.get("reservaId");
    
    // Verifica a sessão novamente por segurança
    const sessaoAtual = await lerSessao();
    if (!sessaoAtual || !reservaId) return;

    try {
      // Atualiza o status para cancelada garantindo que a reserva pertence ao usuário.
      // O banco de dados se encarrega de setar o 'horario_ocupado' para NULL e liberar a vaga.
      await pool.execute(
        `UPDATE reserva SET status = 'cancelada' WHERE id = ? AND usuario_id = ?`,
        [reservaId, sessaoAtual.id]
      );

      // Revalida a página atual para atualizar a tabela na tela imediatamente
      revalidatePath("/minhas-reservas"); 
    } catch (erro) {
      console.error("Erro ao cancelar reserva:", erro);
    }
  }

  // Busca as reservas específicas do usuário logado cruzando com os dados da quadra
  const [reservas] = await pool.execute<ReservaUsuario[]>(
    `SELECT 
      r.id, 
      r.data_reserva, 
      r.hora_inicio, 
      r.hora_fim, 
      r.status, 
      q.nome AS quadra_nome, 
      q.modalidade 
    FROM reserva r
    INNER JOIN quadra q ON r.quadra_id = q.id
    WHERE r.usuario_id = ?
    ORDER BY r.data_reserva DESC, r.hora_inicio DESC`,
    [sessao.id]
  );

  // Função auxiliar para exibição da data no padrão brasileiro
  const formatarData = (data: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC'
    }).format(new Date(data));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1a3a52]">Minhas reservas</h1>
        <p className="mt-2 text-zinc-600">
          Acompanhe o status, o histórico e gerencie suas reservas de quadras.
        </p>
      </div>

      {reservas.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center text-gray-500 bg-white">
          Você ainda não possui nenhuma reserva feita.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-900 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Quadra</th>
                <th className="px-6 py-4 font-semibold">Modalidade</th>
                <th className="px-6 py-4 font-semibold">Data</th>
                <th className="px-6 py-4 font-semibold">Horário</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                {/* Nova coluna para as Ações */}
                <th className="px-6 py-4 font-semibold text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reservas.map((reserva) => (
                <tr key={reserva.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {reserva.quadra_nome}
                  </td>
                  <td className="px-6 py-4 capitalize">
                    {reserva.modalidade.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4">
                    {formatarData(reserva.data_reserva)}
                  </td>
                  <td className="px-6 py-4">
                    {reserva.hora_inicio.slice(0, 5)} às {reserva.hora_fim.slice(0, 5)}
                  </td>
                  <td className="px-6 py-4">
                    <span 
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        reserva.status === 'confirmada'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {reserva.status.charAt(0).toUpperCase() + reserva.status.slice(1)}
                    </span>
                  </td>
                  {/* Célula de Ação com o Botão Cancelar */}
                  <td className="px-6 py-4 text-center">
                    {reserva.status === 'confirmada' ? (
                      <form action={cancelarReserva}>
                        <input type="hidden" name="reservaId" value={reserva.id} />
                        <button 
                          type="submit"
                          className="rounded text-sm font-semibold text-red-600 hover:text-red-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                        >
                          Cancelar
                        </button>
                      </form>
                    ) : (
                      <span className="text-gray-400 text-sm font-medium">Cancelada</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}