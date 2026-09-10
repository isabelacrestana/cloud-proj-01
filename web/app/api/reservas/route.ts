import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { lerSessao } from "@/lib/sessao";

// ==========================================
// GET: Retorna os horários já ocupados
// ==========================================
export async function GET(requisicao: Request) {
  // Pega os parâmetros da URL (ex: /api/reservas?quadraId=1&data=2026-10-15)
  const { searchParams } = new URL(requisicao.url);
  const quadraId = searchParams.get("quadraId");
  const data = searchParams.get("data");

  if (!quadraId || !data) {
    return NextResponse.json({ erro: "Parâmetros quadraId e data são obrigatórios" }, { status: 400 });
  }

  try {
    const [linhas] = await pool.execute<RowDataPacket[]>(
      `SELECT hora_inicio 
       FROM reserva 
       WHERE quadra_id = ? 
         AND data_reserva = ? 
         AND status = 'confirmada'`,
      [quadraId, data]
    );

    const horariosOcupados = linhas.map((linha) => linha.hora_inicio);
    return NextResponse.json({ ocupados: horariosOcupados });
  } catch (erro) {
    console.error("Erro ao buscar horários:", erro);
    return NextResponse.json({ erro: "Erro interno do servidor" }, { status: 500 });
  }
}

// ==========================================
// POST: Cria uma nova reserva
// ==========================================
export async function POST(requisicao: Request) {
  // Só permite reservar se estiver logado
  const sessao = await lerSessao();
  if (!sessao) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  try {
    const corpo = await requisicao.json();
    const { quadraId, data, horaInicio } = corpo;

    if (!quadraId || !data || !horaInicio) {
      return NextResponse.json({ erro: "Dados incompletos (quadraId, data, horaInicio)" }, { status: 400 });
    }

    // Calcula a hora de fim (adicionando 1 hora)
    const horaInicioNum = parseInt(horaInicio.split(":")[0]);
    const horaFim = `${(horaInicioNum + 1).toString().padStart(2, "0")}:00:00`;

    // Tenta inserir no banco com status padrão 'confirmada'
    const [resultado] = await pool.execute<ResultSetHeader>(
      `INSERT INTO reserva (usuario_id, quadra_id, data_reserva, hora_inicio, hora_fim, status)
       VALUES (?, ?, ?, ?, ?, 'confirmada')`,
      [sessao.id, quadraId, data, horaInicio, horaFim]
    );

    return NextResponse.json({ 
      mensagem: "Reserva criada com sucesso!", 
      id: resultado.insertId 
    }, { status: 201 });

  } catch (erro: unknown) {
    // Código 1062 é a trava do seu banco de dados para a UNIQUE KEY (quadra_id, horario_ocupado, hora_inicio)
    if (typeof erro === "object" && erro !== null && "errno" in erro && (erro as { errno: number }).errno === 1062) {
      return NextResponse.json(
        { erro: "Este horário acabou de ser reservado por outra pessoa." }, 
        { status: 409 }
      );
    }

    console.error("Erro ao criar reserva:", erro);
    return NextResponse.json({ erro: "Erro ao salvar a reserva" }, { status: 500 });
  }
}