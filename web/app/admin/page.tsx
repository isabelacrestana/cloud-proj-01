"use client";

import { useEffect, useState, useCallback } from "react";

type DadosEstatisticas = {
  dataSelecionada: string | null;
  kpis: {
    faturamentoMes: number;
    faturamentoTotal: number;
    reservasConfirmadasMes: number;
    reservasConfirmadasTotal: number;
    reservasCanceladas: number;
    taxaCancelamento: number;
    clientesAtivos: number;
    totalQuadras: number;
    quadrasAtivas: number;
  };
  porModalidade: {
    modalidade: string;
    total: number;
    faturamento: number;
  }[];
  ultimosDias: {
    data: string;
    total: number;
    receita: number;
  }[];
  horariosPico: {
    hora: string;
    total: number;
  }[];
  reservasDia: {
    id: number;
    data: string;
    data_iso: string;
    hora_inicio: string;
    hora_fim: string;
    status: "confirmada" | "cancelada";
    cliente_nome: string;
    cliente_telefone: string | null;
    quadra_nome: string;
    modalidade: string;
    valor_hora: number;
  }[];
};

const NOMES_MODALIDADES: Record<string, string> = {
  tenis: "Tênis",
  futsal: "Futsal",
  volei: "Vôlei",
  basquete: "Basquete",
  beach_tennis: "Beach Tennis",
  poliesportiva: "Poliesportiva",
};

const FORMATADOR_MOEDA = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function obterDataLocalIso(offsetDias = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDias);
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export default function AdminDashboardPage() {
  const [dataSelecionada, setDataSelecionada] = useState<string>(() => obterDataLocalIso(0));
  const [dados, setDados] = useState<DadosEstatisticas | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarEstatisticas = useCallback(async (dataFiltro: string) => {
    setCarregando(true);
    setErro(null);
    try {
      const url = dataFiltro
        ? `/api/admin/estatisticas?data=${dataFiltro}`
        : "/api/admin/estatisticas";
      const resposta = await fetch(url);
      if (!resposta.ok) {
        throw new Error("Falha ao obter dados estatísticos.");
      }
      const json = await resposta.json();
      setDados(json);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarEstatisticas(dataSelecionada);
  }, [dataSelecionada, carregarEstatisticas]);

  if (carregando && !dados) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-zinc-500 text-sm animate-pulse">
          Carregando indicadores e estatísticas...
        </div>
      </div>
    );
  }

  if (erro || !dados) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
        <p className="font-medium">Não foi possível carregar a dashboard</p>
        <p className="mt-1 text-sm">{erro}</p>
        <button
          onClick={() => carregarEstatisticas(dataSelecionada)}
          className="mt-4 rounded bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  const maxReservasDias = Math.max(...dados.ultimosDias.map((d) => d.total), 1);
  const maxHorarioPico = Math.max(...dados.horariosPico.map((h) => h.total), 1);
  const totalModalidades = dados.porModalidade.reduce((acc, m) => acc + m.total, 0) || 1;

  const hojeIso = obterDataLocalIso(0);
  const ontemIso = obterDataLocalIso(-1);
  const amanhaIso = obterDataLocalIso(1);

  const rotuloData =
    dataSelecionada === hojeIso
      ? "Hoje"
      : dataSelecionada === ontemIso
      ? "Ontem"
      : dataSelecionada === amanhaIso
      ? "Amanhã"
      : null;

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a52]">Visão Geral do Clube</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Acompanhamento de receita, movimentação de quadras e taxa de ocupação.
          </p>
        </div>
        <button
          onClick={() => carregarEstatisticas(dataSelecionada)}
          className="inline-flex items-center justify-center rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 transition cursor-pointer"
        >
          Atualizar Dados
        </button>
      </div>

      {/* 1. KPIs (Cards de Topo) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Faturamento do Mês Atual */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Faturamento (Mês Atual)
            </span>
            <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-[#b08d57]">
              Mês Atual
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-[#1a3a52]">
            {FORMATADOR_MOEDA.format(dados.kpis.faturamentoMes)}
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Total acumulado:{" "}
            <strong className="text-zinc-700">
              {FORMATADOR_MOEDA.format(dados.kpis.faturamentoTotal)}
            </strong>
          </p>
        </div>

        {/* Reservas Confirmadas */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Reservas Confirmadas
            </span>
            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
              {dados.kpis.reservasConfirmadasMes} no mês
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">
            {dados.kpis.reservasConfirmadasMes}
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            {dados.kpis.reservasConfirmadasTotal} acumuladas • Taxa cancelamento:{" "}
            <span className={dados.kpis.taxaCancelamento > 15 ? "text-amber-600 font-semibold" : "text-zinc-600"}>
              {dados.kpis.taxaCancelamento}%
            </span>
          </p>
        </div>

        {/* Clientes Ativos */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Clientes Ativos
          </span>
          <div className="mt-2 text-2xl font-bold text-[#1a3a52]">
            {dados.kpis.clientesAtivos}
          </div>
          <p className="mt-1 text-xs text-zinc-500">Usuários distintos com reservas ativas</p>
        </div>

        {/* Ocupação / Quadras */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Quadras Ativas
          </span>
          <div className="mt-2 text-2xl font-bold text-[#1a3a52]">
            {dados.kpis.quadrasAtivas}{" "}
            <span className="text-sm font-normal text-zinc-500">
              / {dados.kpis.totalQuadras} totais
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">Prontas para receber jogos</p>
        </div>
      </div>

      {/* 2. Seção de Gráficos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Gráfico A: Evolução dos Últimos 7 Dias */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
          <h2 className="text-base font-semibold text-[#1a3a52]">
            Reservas nos Últimos 7 Dias
          </h2>
          <p className="text-xs text-zinc-500 mb-6">Volume diário de agendamentos confirmados</p>

          {dados.ultimosDias.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-xs text-zinc-400">
              Nenhuma reserva registrada nos últimos 7 dias.
            </div>
          ) : (
            <div className="flex h-48 items-end gap-3 pt-6">
              {dados.ultimosDias.map((item) => {
                const alturaPercentual = Math.round((item.total / maxReservasDias) * 100);
                const diaFormatado = item.data.split("-").slice(1).reverse().join("/");
                const ehSelecionado = item.data === dataSelecionada;

                return (
                  <div
                    key={item.data}
                    onClick={() => setDataSelecionada(item.data)}
                    className="flex flex-1 flex-col items-center gap-2 group relative cursor-pointer"
                    title="Clique para ver as reservas deste dia"
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-8 hidden group-hover:flex flex-col items-center bg-[#0b1a2b] text-white text-[10px] rounded px-2 py-0.5 whitespace-nowrap z-10 shadow">
                      <span>{item.total} reserva(s)</span>
                      <span>{FORMATADOR_MOEDA.format(item.receita)}</span>
                    </div>

                    <span className="text-[11px] font-semibold text-zinc-700">{item.total}</span>
                    <div className="w-full bg-zinc-100 rounded-t h-32 flex items-end">
                      <div
                        style={{ height: `${Math.max(alturaPercentual, 8)}%` }}
                        className={`w-full rounded-t transition-colors ${
                          ehSelecionado
                            ? "bg-[#b08d57]"
                            : "bg-[#1a3a52] hover:bg-[#b08d57]/80"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-[10px] ${
                        ehSelecionado ? "font-bold text-[#b08d57]" : "text-zinc-500"
                      }`}
                    >
                      {diaFormatado}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Gráfico B: Reservas por Modalidade */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
          <h2 className="text-base font-semibold text-[#1a3a52]">
            Demanda por Esporte / Modalidade
          </h2>
          <p className="text-xs text-zinc-500 mb-6">Distribuição percentual das reservas</p>

          <div className="space-y-4">
            {dados.porModalidade.map((item) => {
              const porcentagem = Math.round((item.total / totalModalidades) * 100);
              const nome = NOMES_MODALIDADES[item.modalidade] || item.modalidade;

              return (
                <div key={item.modalidade} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-zinc-800">{nome}</span>
                    <span className="text-zinc-500">
                      {item.total} reservas ({porcentagem}%) •{" "}
                      <strong className="text-zinc-700">
                        {FORMATADOR_MOEDA.format(item.faturamento)}
                      </strong>
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${porcentagem}%` }}
                      className="h-full bg-[#b08d57] rounded-full transition-all duration-300"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Gráfico C: Horários de Pico */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
        <h2 className="text-base font-semibold text-[#1a3a52]">
          Horários Mais Frequentados
        </h2>
        <p className="text-xs text-zinc-500 mb-6">
          Distribuição acumulada de reservas ao longo do dia
        </p>

        {dados.horariosPico.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-400">
            Ainda não há dados suficientes de horários.
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {dados.horariosPico.map((h) => {
              const intensidade = Math.round((h.total / maxHorarioPico) * 100);
              return (
                <div
                  key={h.hora}
                  className="flex flex-col items-center justify-center p-3 rounded-lg border border-zinc-100 bg-zinc-50 hover:border-zinc-300 transition"
                >
                  <span className="text-xs font-semibold text-zinc-800">{h.hora}</span>
                  <span className="mt-1 text-sm font-bold text-[#1a3a52]">{h.total}</span>
                  <span className="text-[10px] text-zinc-400">reservas</span>
                  <div className="mt-2 h-1 w-full bg-zinc-200 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${intensidade}%` }}
                      className="h-full bg-emerald-600"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Tabela Operacional: Reservas por Data Selecionada */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-zinc-200 bg-zinc-50/50 px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-[#1a3a52]">
                Agenda de Reservas
              </h2>
              {rotuloData && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800">
                  {rotuloData}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Selecione o dia para consultar as reservas marcadas
            </p>
          </div>

          {/* Filtro de Data Interativo */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-md border border-zinc-200 bg-white shadow-xs overflow-hidden text-xs">
              <button
                onClick={() => setDataSelecionada(ontemIso)}
                className={`px-2.5 py-1 transition cursor-pointer ${
                  dataSelecionada === ontemIso
                    ? "bg-[#1a3a52] text-white font-medium"
                    : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                Ontem
              </button>
              <button
                onClick={() => setDataSelecionada(hojeIso)}
                className={`border-l border-r border-zinc-200 px-2.5 py-1 transition cursor-pointer ${
                  dataSelecionada === hojeIso
                    ? "bg-[#1a3a52] text-white font-medium"
                    : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                Hoje
              </button>
              <button
                onClick={() => setDataSelecionada(amanhaIso)}
                className={`px-2.5 py-1 transition cursor-pointer ${
                  dataSelecionada === amanhaIso
                    ? "bg-[#1a3a52] text-white font-medium"
                    : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                Amanhã
              </button>
            </div>

            <input
              type="date"
              value={dataSelecionada}
              onChange={(e) => setDataSelecionada(e.target.value)}
              className="rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs text-zinc-800 shadow-xs focus:border-[#1a3a52] focus:outline-none cursor-pointer"
            />

            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700">
              {dados.reservasDia.length} jogo(s)
            </span>
          </div>
        </div>

        {dados.reservasDia.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400">
            Nenhuma reserva marcada para{" "}
            {dataSelecionada.split("-").reverse().join("/")}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-600">
              <thead className="bg-zinc-50 text-zinc-900 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-3 font-semibold">Horário</th>
                  <th className="px-6 py-3 font-semibold">Quadra</th>
                  <th className="px-6 py-3 font-semibold">Modalidade</th>
                  <th className="px-6 py-3 font-semibold">Cliente</th>
                  <th className="px-6 py-3 font-semibold">Telefone</th>
                  <th className="px-6 py-3 font-semibold">Valor</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {dados.reservasDia.map((reserva) => (
                  <tr key={reserva.id} className="hover:bg-zinc-50/70">
                    <td className="px-6 py-3 font-medium text-zinc-900">
                      {reserva.hora_inicio} às {reserva.hora_fim}
                    </td>
                    <td className="px-6 py-3">{reserva.quadra_nome}</td>
                    <td className="px-6 py-3 capitalize">
                      {NOMES_MODALIDADES[reserva.modalidade] || reserva.modalidade}
                    </td>
                    <td className="px-6 py-3 font-medium text-zinc-900">
                      {reserva.cliente_nome}
                    </td>
                    <td className="px-6 py-3">{reserva.cliente_telefone || "—"}</td>
                    <td className="px-6 py-3">
                      {FORMATADOR_MOEDA.format(reserva.valor_hora)}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          reserva.status === "confirmada"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {reserva.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
