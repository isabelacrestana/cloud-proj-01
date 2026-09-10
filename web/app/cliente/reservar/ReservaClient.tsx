"use client";

import { useState, useEffect } from "react";

// Tipagem baseada nos dados enviados pelo servidor
interface Quadra {
  id: number;
  nome: string;
  modalidade: string;
  coberta: boolean;
  valor_hora: number;
}

export default function ReservaClient({ quadras, usuarioId }: { quadras: Quadra[]; usuarioId: number }) {
  const [quadraSelecionada, setQuadraSelecionada] = useState<Quadra | null>(null);
  const [dataSelecionada, setDataSelecionada] = useState<string>("");
  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([]);
  const [horarioEscolhido, setHorarioEscolhido] = useState<string>("");

  // Gera horários das 08:00 às 22:00
  const horariosPossiveis = Array.from({ length: 15 }, (_, i) => {
    const hora = i + 8;
    return `${hora.toString().padStart(2, "0")}:00:00`;
  });

    const handleConfirmarReserva = async () => {
        try {
            const res = await fetch("/api/reservas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    quadraId: quadraSelecionada?.id,
                    data: dataSelecionada,
                    horaInicio: horarioEscolhido,
            }),
            });

            if (res.ok) {
                alert("Reserva confirmada com sucesso!");
            // Limpa os campos após reservar ou redireciona para a página 'Minhas Reservas'
                setHorarioEscolhido("");
            // Recarrega os horários para bloquear o que acabou de ser reservado
                const horariosAtualizados = await fetch(`/api/reservas?quadraId=${quadraSelecionada?.id}&data=${dataSelecionada}`).then(r => r.json());
                setHorariosOcupados(horariosAtualizados.ocupados);
            } else {
                const erro = await res.json();
                alert(erro.erro || "Erro ao fazer reserva.");
            }
            } catch (error) {
                alert("Erro de conexão ao tentar reservar.");
            }
     };

  // Busca os horários ocupados sempre que a data ou a quadra mudarem
  useEffect(() => {
    if (quadraSelecionada && dataSelecionada) {
      setHorarioEscolhido(""); // Reseta o horário ao mudar de dia
      fetch(`/api/reservas?quadraId=${quadraSelecionada.id}&data=${dataSelecionada}`)
        .then((res) => res.json())
        .then((data) => setHorariosOcupados(data.ocupados))
        .catch(console.error);
    }
  }, [quadraSelecionada, dataSelecionada]);

  const formatarMoeda = (valor: number) => 
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Coluna 1: Lista de Quadras */}
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">1. Escolha a Quadra</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quadras.map((quadra) => (
            <div
              key={quadra.id}
              onClick={() => {
                setQuadraSelecionada(quadra);
                setDataSelecionada("");
              }}
              className={`cursor-pointer rounded-xl border p-4 transition-all ${
                quadraSelecionada?.id === quadra.id
                  ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600"
                  : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-medium uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-1 rounded-md">
                  {quadra.modalidade.replace("_", " ")}
                </span>
                <span className="text-xs text-gray-500">{quadra.coberta ? "🌧️ Coberta" : "☀️ Descoberta"}</span>
              </div>
              <h3 className="mt-3 text-lg font-bold text-gray-900">{quadra.nome}</h3>
              <p className="mt-1 text-sm font-semibold text-gray-600">
                {formatarMoeda(Number(quadra.valor_hora))} / hora
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Coluna 2: Calendário e Horários */}
      <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800">2. Data e Horário</h2>

        {!quadraSelecionada ? (
          <p className="text-sm text-gray-500 text-center py-10">
            Selecione uma quadra ao lado primeiro.
          </p>
        ) : (
          <>
            {/* Calendário Interativo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Escolha o dia:</label>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]} // Impede datas passadas
                value={dataSelecionada}
                onChange={(e) => setDataSelecionada(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2.5 text-gray-900 focus:border-blue-600 focus:ring-blue-600"
              />
            </div>

            {/* Grade de Horários */}
            {dataSelecionada && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Horários disponíveis:</label>
                <div className="grid grid-cols-3 gap-2">
                  {horariosPossiveis.map((hora) => {
                    const estaOcupado = horariosOcupados.includes(hora);
                    const selecionado = horarioEscolhido === hora;

                    return (
                      <button
                        key={hora}
                        disabled={estaOcupado}
                        onClick={() => setHorarioEscolhido(hora)}
                        className={`rounded-md py-2 text-sm font-semibold transition-colors ${
                          estaOcupado
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200" // Tom cinzentado exigido
                            : selecionado
                            ? "bg-blue-600 text-white border border-blue-600 shadow-md"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:border-blue-400"
                        }`}
                      >
                        {hora.slice(0, 5)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Overview Visível das Variáveis */}
        {quadraSelecionada && dataSelecionada && horarioEscolhido && (
          <div className="mt-6 rounded-lg bg-gray-50 p-4 border border-gray-100">
            <h4 className="text-sm font-bold text-gray-900 mb-2">Resumo da Reserva</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li><strong>Quadra:</strong> {quadraSelecionada.nome} ({quadraSelecionada.coberta ? 'Coberta' : 'Descoberta'})</li>
              <li className="capitalize"><strong>Modalidade:</strong> {quadraSelecionada.modalidade.replace('_', ' ')}</li>
              <li><strong>Data:</strong> {dataSelecionada.split('-').reverse().join('/')}</li>
              <li><strong>Horário:</strong> {horarioEscolhido.slice(0, 5)} às {(parseInt(horarioEscolhido) + 1).toString().padStart(2, '0')}:00</li>
              <li><strong>Total:</strong> {formatarMoeda(Number(quadraSelecionada.valor_hora))}</li>
            </ul>
            <button 
                onClick={handleConfirmarReserva}
            className="mt-4 w-full rounded-md bg-green-600 px-4 py-2 text-white font-bold hover:bg-green-700 transition-colors"
            >
                Confirmar Reserva
            </button>
          </div>
        )}
      </div>
    </div>
  );
}