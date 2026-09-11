import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { lerSessao } from "@/lib/sessao";
import type { RowDataPacket } from "mysql2";

export async function GET(requisicao: Request) {
  const sessao = await lerSessao();

  if (!sessao || sessao.papel !== "admin") {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
  }

  // Permite filtrar as reservas por uma data específica (ex: /api/admin/estatisticas?data=2026-09-10)
  const { searchParams } = new URL(requisicao.url);
  const dataParam = searchParams.get("data");
  const dataValida = dataParam && /^\d{4}-\d{2}-\d{2}$/.test(dataParam) ? dataParam : null;

  try {
    // 1. KPIs Gerais (acumulado e mês atual)
    const [kpiRows] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        COUNT(r.id) AS total_reservas,
        COUNT(CASE WHEN r.status = 'confirmada' THEN 1 END) AS confirmadas,
        COUNT(CASE WHEN r.status = 'cancelada' THEN 1 END) AS canceladas,
        COALESCE(SUM(CASE WHEN r.status = 'confirmada' THEN q.valor_hora ELSE 0 END), 0) AS faturamento_total,
        COALESCE(SUM(CASE WHEN r.status = 'confirmada' AND MONTH(r.data_reserva) = MONTH(CURDATE()) AND YEAR(r.data_reserva) = YEAR(CURDATE()) THEN q.valor_hora ELSE 0 END), 0) AS faturamento_mes,
        COUNT(CASE WHEN r.status = 'confirmada' AND MONTH(r.data_reserva) = MONTH(CURDATE()) AND YEAR(r.data_reserva) = YEAR(CURDATE()) THEN 1 END) AS confirmadas_mes,
        COUNT(DISTINCT CASE WHEN r.status = 'confirmada' THEN r.usuario_id END) AS clientes_ativos
      FROM reserva r
      INNER JOIN quadra q ON r.quadra_id = q.id
    `);

    const [quadrasRows] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        COUNT(*) AS total_quadras,
        COUNT(CASE WHEN ativa = 1 THEN 1 END) AS quadras_ativas
      FROM quadra
    `);

    // 2. Reservas e Faturamento por Modalidade
    const [modalidadesRows] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        q.modalidade,
        COUNT(r.id) AS total_reservas,
        COALESCE(SUM(CASE WHEN r.status = 'confirmada' THEN q.valor_hora ELSE 0 END), 0) AS faturamento
      FROM quadra q
      LEFT JOIN reserva r ON q.id = r.quadra_id AND r.status = 'confirmada'
      GROUP BY q.modalidade
      ORDER BY total_reservas DESC
    `);

    // 3. Evolução dos Últimos 7 Dias
    const [diasRows] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        DATE_FORMAT(r.data_reserva, '%Y-%m-%d') AS data,
        COUNT(r.id) AS total,
        COALESCE(SUM(CASE WHEN r.status = 'confirmada' THEN q.valor_hora ELSE 0 END), 0) AS receita
      FROM reserva r
      INNER JOIN quadra q ON r.quadra_id = q.id
      WHERE r.status = 'confirmada'
        AND r.data_reserva >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY r.data_reserva
      ORDER BY r.data_reserva ASC
    `);

    // 4. Horários de Maior Movimento (Pico)
    const [horariosRows] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        DATE_FORMAT(r.hora_inicio, '%H:00') AS hora,
        COUNT(r.id) AS total
      FROM reserva r
      WHERE r.status = 'confirmada'
      GROUP BY hora
      ORDER BY hora ASC
    `);

    // 5. Reservas do Dia Selecionado (ou de hoje se não fornecido)
    const queryDataSql = dataValida
      ? `SELECT 
           r.id,
           DATE_FORMAT(r.data_reserva, '%d/%m/%Y') AS data,
           DATE_FORMAT(r.data_reserva, '%Y-%m-%d') AS data_iso,
           DATE_FORMAT(r.hora_inicio, '%H:%i') AS hora_inicio,
           DATE_FORMAT(r.hora_fim, '%H:%i') AS hora_fim,
           r.status,
           u.nome AS cliente_nome,
           u.telefone AS cliente_telefone,
           q.nome AS quadra_nome,
           q.modalidade,
           q.valor_hora
         FROM reserva r
         INNER JOIN usuario u ON r.usuario_id = u.id
         INNER JOIN quadra q ON r.quadra_id = q.id
         WHERE r.data_reserva = ?
         ORDER BY r.hora_inicio ASC`
      : `SELECT 
           r.id,
           DATE_FORMAT(r.data_reserva, '%d/%m/%Y') AS data,
           DATE_FORMAT(r.data_reserva, '%Y-%m-%d') AS data_iso,
           DATE_FORMAT(r.hora_inicio, '%H:%i') AS hora_inicio,
           DATE_FORMAT(r.hora_fim, '%H:%i') AS hora_fim,
           r.status,
           u.nome AS cliente_nome,
           u.telefone AS cliente_telefone,
           q.nome AS quadra_nome,
           q.modalidade,
           q.valor_hora
         FROM reserva r
         INNER JOIN usuario u ON r.usuario_id = u.id
         INNER JOIN quadra q ON r.quadra_id = q.id
         WHERE r.data_reserva = CURDATE()
         ORDER BY r.hora_inicio ASC`;

    const [reservasDiaRows] = await pool.execute<RowDataPacket[]>(
      queryDataSql,
      dataValida ? [dataValida] : []
    );

    const kpi = kpiRows[0] || {};
    const totalReservas = Number(kpi.total_reservas || 0);
    const canceladas = Number(kpi.canceladas || 0);
    const taxaCancelamento = totalReservas > 0 ? ((canceladas / totalReservas) * 100).toFixed(1) : "0.0";

    return NextResponse.json({
      dataSelecionada: dataValida,
      kpis: {
        faturamentoMes: Number(kpi.faturamento_mes || 0),
        faturamentoTotal: Number(kpi.faturamento_total || 0),
        reservasConfirmadasMes: Number(kpi.confirmadas_mes || 0),
        reservasConfirmadasTotal: Number(kpi.confirmadas || 0),
        reservasCanceladas: canceladas,
        taxaCancelamento: Number(taxaCancelamento),
        clientesAtivos: Number(kpi.clientes_ativos || 0),
        totalQuadras: Number(quadrasRows[0]?.total_quadras || 0),
        quadrasAtivas: Number(quadrasRows[0]?.quadras_ativas || 0),
      },
      porModalidade: modalidadesRows.map((m) => ({
        modalidade: m.modalidade,
        total: Number(m.total_reservas || 0),
        faturamento: Number(m.faturamento || 0),
      })),
      ultimosDias: diasRows.map((d) => ({
        data: d.data,
        total: Number(d.total || 0),
        receita: Number(d.receita || 0),
      })),
      horariosPico: horariosRows.map((h) => ({
        hora: h.hora,
        total: Number(h.total || 0),
      })),
      reservasDia: reservasDiaRows.map((r) => ({
        id: r.id,
        data: r.data,
        data_iso: r.data_iso,
        hora_inicio: r.hora_inicio,
        hora_fim: r.hora_fim,
        status: r.status,
        cliente_nome: r.cliente_nome,
        cliente_telefone: r.cliente_telefone,
        quadra_nome: r.quadra_nome,
        modalidade: r.modalidade,
        valor_hora: Number(r.valor_hora || 0),
      })),
    });
  } catch (erro) {
    console.error("[estatisticas] erro ao buscar:", erro);
    return NextResponse.json(
      { erro: "Erro ao carregar estatísticas do sistema." },
      { status: 500 }
    );
  }
}
