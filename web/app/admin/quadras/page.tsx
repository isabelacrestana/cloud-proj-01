"use client";                                                                                                                  
                                                                                                                                   
import { useEffect, useState } from "react";                                                                                   
                                                                                                                                
type Modalidade =                                                                                                              
  | "tenis"                                                                                                                    
  | "futsal"                                                                                                                   
  | "volei"                                                                                                                    
  | "basquete"                                                                                                                 
  | "beach_tennis"                                                                                                             
  | "poliesportiva";                                                                                                           
                                                                                                                                
type Quadra = {                                                                                                                
  id: number;                                                                                                                  
  nome: string;                                                                                                                
  modalidade: Modalidade;                                                                                                      
  coberta: boolean;                                                                                                            
  valor_hora: number;                                                                                                          
  ativa: boolean;                                                                                                              
};                                                                                                                             
                                                                                                                                
// Mapeamento para exibir os nomes das modalidades em português bonito                                                         
const NOMES_MODALIDADES: Record<Modalidade, string> = {                                                                        
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
                                                                                                                                
export default function AdminQuadrasPage() {                                                                                   
  const [quadras, setQuadras] = useState<Quadra[]>([]);                                                                        
  const [carregando, setCarregando] = useState(true);                                                                          
  const [erro, setErro] = useState<string | null>(null);                                                                       
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);                                                 
                                                                                                                                
  // Estados do Modal de Criação/Edição                                                                                        
  const [modalAberto, setModalAberto] = useState(false);                                                                       
  const [salvando, setSalvando] = useState(false);                                                                             
  const [idEditando, setIdEditando] = useState<number | null>(null);                                                           
                                                                                                                                
  // Campos do formulário                                                                                                      
  const [nome, setNome] = useState("");                                                                                        
  const [modalidade, setModalidade] = useState<Modalidade>("tenis");                                                           
  const [coberta, setCoberta] = useState(false);                                                                               
  const [valorHora, setValorHora] = useState("");                                                                              
  const [ativa, setAtiva] = useState(true);                                                                                    
                                                                                                                                
  // 1. Carrega as quadras ao abrir a página                                                                                   
  async function carregarQuadras() {                                                                                           
    setCarregando(true);                                                                                                       
    setErro(null);                                                                                                             
    try {                                                                                                                      
      const res = await fetch("/api/admin/quadras");                                                                           
      if (!res.ok) throw new Error("Não foi possível carregar as quadras.");                                                   
      const dados = await res.json();                                                                                          
      setQuadras(dados);                                                                                                       
    } catch (e) {                                                                                                              
      setErro(e instanceof Error ? e.message : "Falha ao carregar.");                                                          
    } finally {                                                                                                                
      setCarregando(false);                                                                                                    
    }                                                                                                                          
  }                                                                                                                            
                                                                                                                                
  useEffect(() => {                                                                                                            
    carregarQuadras();                                                                                                         
  }, []);                                                                                                                      
                                                                                                                                
  // Abre modal para cadastrar nova quadra                                                                                     
  function abrirModalCriacao() {                                                                                               
    setIdEditando(null);                                                                                                       
    setNome("");                                                                                                               
    setModalidade("tenis");                                                                                                    
    setCoberta(false);                                                                                                         
    setValorHora("");                                                                                                          
    setAtiva(true);                                                                                                            
    setErro(null);                                                                                                             
    setModalAberto(true);                                                                                                      
  }                                                                                                                            
                                                                                                                                
  // Abre modal preenchido para editar quadra                                                                                  
  function abrirModalEdicao(quadra: Quadra) {                                                                                  
    setIdEditando(quadra.id);                                                                                                  
    setNome(quadra.nome);                                                                                                      
    setModalidade(quadra.modalidade);                                                                                          
    setCoberta(quadra.coberta);                                                                                                
    setValorHora(quadra.valor_hora.toString());                                                                                
    setAtiva(quadra.ativa);                                                                                                    
    setErro(null);                                                                                                             
    setModalAberto(true);                                                                                                      
  }                                                                                                                            
                                                                                                                                
  // 2. Salva (Criação via POST ou Edição via PUT)                                                                             
  async function handleSalvar(evento: React.FormEvent) {                                                                       
    evento.preventDefault();                                                                                                   
    setSalvando(true);                                                                                                         
    setErro(null);                                                                                                             
    setMensagemSucesso(null);                                                                                                  
                                                                                                                                
    const corpo = {                                                                                                            
      nome,                                                                                                                    
      modalidade,                                                                                                              
      coberta,                                                                                                                 
      valor_hora: Number(valorHora),                                                                                           
      ativa,                                                                                                                   
    };                                                                                                                         
                                                                                                                                
    try {                                                                                                                      
      const url = idEditando                                                                                                   
        ? `/api/admin/quadras/${idEditando}`                                                                                   
        : "/api/admin/quadras";                                                                                                
                                                                                                                                
      const metodo = idEditando ? "PUT" : "POST";                                                                              
                                                                                                                                
      const res = await fetch(url, {                                                                                           
        method: metodo,                                                                                                        
        headers: { "Content-Type": "application/json" },                                                                       
        body: JSON.stringify(corpo),                                                                                           
      });                                                                                                                      
                                                                                                                                
      const resposta = await res.json();                                                                                       
                                                                                                                                
      if (!res.ok) {                                                                                                           
        setErro(resposta.erro ?? "Ocorreu um erro ao salvar.");                                                                
        return;                                                                                                                
      }                                                                                                                        
                                                                                                                                
      setModalAberto(false);                                                                                                   
      setMensagemSucesso(                                                                                                      
        idEditando                                                                                                             
          ? "Quadra atualizada com sucesso!"                                                                                   
          : "Quadra cadastrada com sucesso!"                                                                                   
      );                                                                                                                       
      await carregarQuadras();                                                                                                 
    } catch {                                                                                                                  
      setErro("Falha de conexão com o servidor.");                                                                             
    } finally {                                                                                                                
      setSalvando(false);                                                                                                      
    }                                                                                                                          
  }                                                                                                                            
                                                                                                                                
  // 3. Exclui uma quadra (DELETE)                                                                                             
  async function handleExcluir(quadra: Quadra) {                                                                               
    const confirmou = window.confirm(                                                                                          
      `Tem certeza que deseja excluir a quadra "${quadra.nome}"?`                                                              
    );                                                                                                                         
    if (!confirmou) return;                                                                                                    
                                                                                                                                
    setErro(null);                                                                                                             
    setMensagemSucesso(null);                                                                                                  
                                                                                                                                
    try {                                                                                                                      
      const res = await fetch(`/api/admin/quadras/${quadra.id}`, {                                                             
        method: "DELETE",                                                                                                      
      });                                                                                                                      
                                                                                                                                
      const resposta = await res.json();                                                                                       
                                                                                                                                
      if (!res.ok) {                                                                                                           
        setErro(resposta.erro ?? "Erro ao excluir quadra.");                                                                   
        return;                                                                                                                
      }                                                                                                                        
                                                                                                                                
      setMensagemSucesso("Quadra excluída com sucesso!");                                                                      
      await carregarQuadras();                                                                                                 
    } catch {                                                                                                                  
      setErro("Falha ao comunicar com o servidor.");                                                                           
    }                                                                                                                          
  }                                                                                                                            
                                                                                                                                
  return (                                                                                                                     
    <div className="space-y-6">                                                                                                
      {/* Cabeçalho da página */}                                                                                              
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">                                     
        <div>                                                                                                                  
          <h1 className="text-2xl font-bold text-[#1a3a52]">Gerenciamento de Quadras</h1>                                      
          <p className="text-sm text-zinc-500">                                                                                
            Cadastre, altere preços e gerencie a disponibilidade das quadras do clube.                                         
          </p>                                                                                                                 
        </div>                                                                                                                 
        <button                                                                                                                
          onClick={abrirModalCriacao}                                                                                          
          className="inline-flex items-center justify-center rounded-lg bg-[#0b1a2b] px-4 py-2.5 text-sm font-medium text-white
shadow-sm transition hover:bg-[#16334f]"                                                                                         
        >                                                                                                                      
          + Nova Quadra                                                                                                        
        </button>                                                                                                              
      </div>                                                                                                                   
                                                                                                                                
      {/* Avisos de Sucesso ou Erro Geral */}                                                                                  
      {mensagemSucesso && (                                                                                                    
        <div className="rounded-lg bg-emerald-50 p-4 text-sm font-medium text-emerald-800 border border-emerald-200">          
          {mensagemSucesso}                                                                                                    
        </div>                                                                                                                 
      )}                                                                                                                       
                                                                                                                                
      {erro && (                                                                                                               
        <div className="rounded-lg bg-red-50 p-4 text-sm font-medium text-red-800 border border-red-200">                      
          {erro}                                                                                                               
        </div>                                                                                                                 
      )}                                                                                                                       
                                                                                                                                
      {/* Lista / Tabela de Quadras */}                                                                                        
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">                                   
        {carregando ? (                                                                                                        
          <div className="p-8 text-center text-sm text-zinc-500">                                                              
            Carregando quadras...                                                                                              
          </div>                                                                                                               
        ) : quadras.length === 0 ? (                                                                                           
          <div className="p-8 text-center text-sm text-zinc-500">                                                              
            Nenhuma quadra cadastrada até o momento.                                                                           
          </div>                                                                                                               
        ) : (                                                                                                                  
          <div className="overflow-x-auto">                                                                                    
            <table className="w-full text-left text-sm text-zinc-600">                                                         
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase text-zinc-600">            
                <tr>                                                                                                           
                  <th className="px-6 py-3.5">Nome</th>                                                                        
                  <th className="px-6 py-3.5">Modalidade</th>                                                                  
                  <th className="px-6 py-3.5">Tipo</th>                                                                        
                  <th className="px-6 py-3.5">Valor / Hora</th>                                                                
                  <th className="px-6 py-3.5">Status</th>                                                                      
                  <th className="px-6 py-3.5 text-right">Ações</th>                                                            
                </tr>                                                                                                          
              </thead>                                                                                                         
              <tbody className="divide-y divide-zinc-200">                                                                     
                {quadras.map((quadra) => (                                                                                     
                  <tr key={quadra.id} className="hover:bg-zinc-50/70 transition">                                              
                    <td className="px-6 py-4 font-medium text-[#1a3a52]">                                                      
                      {quadra.nome}                                                                                            
                    </td>                                                                                                      
                    <td className="px-6 py-4">                                                                                 
                      <span className="inline-flex items-center rounded-md bg-[#f5f1e8] px-2.5 py-0.5 text-xs font-medium text-
[#8a6d3b]">                                                                                                                      
                        {NOMES_MODALIDADES[quadra.modalidade] ?? quadra.modalidade}                                            
                      </span>                                                                                                  
                    </td>                                                                                                      
                    <td className="px-6 py-4">                                                                                 
                      {quadra.coberta ? (                                                                                      
                        <span className="text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">                
                          Coberta                                                                                              
                        </span>                                                                                                
                      ) : (                                                                                                    
                        <span className="text-xs font-medium text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded">                   
                          Ao ar livre                                                                                          
                        </span>                                                                                                
                      )}                                                                                                       
                    </td>                                                                                                      
                    <td className="px-6 py-4 font-semibold text-zinc-800">                                                     
                      {FORMATADOR_MOEDA.format(quadra.valor_hora)}                                                             
                    </td>                                                                                                      
                    <td className="px-6 py-4">                                                                                 
                      {quadra.ativa ? (                                                                                        
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">               
                          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>                                        
                          Ativa                                                                                                
                        </span>                                                                                                
                      ) : (                                                                                                    
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500">                  
                          <span className="h-2 w-2 rounded-full bg-zinc-400"></span>                                           
                          Inativa                                                                                              
                        </span>                                                                                                
                      )}                                                                                                       
                    </td>                                                                                                      
                    <td className="px-6 py-4 text-right space-x-2">                                                            
                      <button                                                                                                  
                        onClick={() => abrirModalEdicao(quadra)}                                                               
                        className="rounded px-2.5 py-1 text-xs font-medium text-[#1a3a52] hover:bg-zinc-100 transition"        
                      >                                                                                                        
                        Editar                                                                                                 
                      </button>                                                                                                
                      <button                                                                                                  
                        onClick={() => handleExcluir(quadra)}                                                                  
                        className="rounded px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition"            
                      >                                                                                                        
                        Excluir                                                                                                
                      </button>                                                                                                
                    </td>                                                                                                      
                  </tr>                                                                                                        
                ))}                                                                                                            
              </tbody>                                                                                                         
            </table>                                                                                                           
          </div>                                                                                                               
        )}                                                                                                                     
      </div>                                                                                                                   
                                                                                                                                
      {/* Modal de Criação / Edição */}                                                                                        
      {modalAberto && (                                                                                                        
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">                 
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">                                                 
            <h2 className="text-xl font-bold text-[#1a3a52]">                                                                  
              {idEditando ? "Editar Quadra" : "Cadastrar Nova Quadra"}                                                         
            </h2>                                                                                                              
            <p className="mt-1 text-xs text-zinc-500">                                                                         
              Preencha as informações da quadra abaixo.                                                                        
            </p>                                                                                                               
                                                                                                                                
            <form onSubmit={handleSalvar} className="mt-5 space-y-4">                                                          
              {/* Nome */}                                                                                                     
              <div>                                                                                                            
                <label className="block text-xs font-semibold text-zinc-700">                                                  
                  Nome da Quadra                                                                                               
                </label>                                                                                                       
                <input                                                                                                         
                  type="text"                                                                                                  
                  required                                                                                                     
                  maxLength={80}                                                                                               
                  placeholder="Ex: Quadra 3 - Saibro"                                                                          
                  value={nome}                                                                                                 
                  onChange={(e) => setNome(e.target.value)}                                                                    
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-800 outline-none        
focus:border-[#0b1a2b] focus:ring-1 focus:ring-[#0b1a2b]"                                                                        
                />                                                                                                             
              </div>                                                                                                           
                                                                                                                                
              {/* Modalidade */}                                                                                               
              <div>                                                                                                            
                <label className="block text-xs font-semibold text-zinc-700">                                                  
                  Modalidade                                                                                                   
                </label>                                                                                                       
                <select                                                                                                        
                  value={modalidade}                                                                                           
                  onChange={(e) => setModalidade(e.target.value as Modalidade)}                                                
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-800 outline-none        
focus:border-[#0b1a2b] focus:ring-1 focus:ring-[#0b1a2b] bg-white"                                                               
                >                                                                                                              
                  <option value="tenis">Tênis</option>                                                                         
                  <option value="beach_tennis">Beach Tennis</option>                                                           
                  <option value="futsal">Futsal</option>                                                                       
                  <option value="volei">Vôlei</option>                                                                         
                  <option value="basquete">Basquete</option>                                                                   
                  <option value="poliesportiva">Poliesportiva</option>                                                         
                </select>                                                                                                      
              </div>                                                                                                           
                                                                                                                                
              {/* Valor por Hora */}                                                                                           
              <div>                                                                                                            
                <label className="block text-xs font-semibold text-zinc-700">                                                  
                  Valor por Hora (R$)                                                                                          
                </label>                                                                                                       
                <input                                                                                                         
                  type="number"                                                                                                
                  step="0.01"                                                                                                  
                  min="1"                                                                                                      
                  required                                                                                                     
                  placeholder="Ex: 80.00"                                                                                      
                  value={valorHora}                                                                                            
                  onChange={(e) => setValorHora(e.target.value)}                                                               
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-800 outline-none        
focus:border-[#0b1a2b] focus:ring-1 focus:ring-[#0b1a2b]"                                                                        
                />                                                                                                             
              </div>                                                                                                           
                                                                                                                                
              {/* Opções: Coberta e Ativa */}                                                                                  
              <div className="flex items-center gap-6 pt-1">                                                                   
                <label className="flex items-center gap-2 text-xs font-medium text-zinc-700 cursor-pointer">                   
                  <input                                                                                                       
                    type="checkbox"                                                                                            
                    checked={coberta}                                                                                          
                    onChange={(e) => setCoberta(e.target.checked)}                                                             
                    className="h-4 w-4 rounded border-zinc-300 text-[#0b1a2b] focus:ring-[#0b1a2b]"                            
                  />                                                                                                           
                  Quadra Coberta                                                                                               
                </label>                                                                                                       
                                                                                                                                
                <label className="flex items-center gap-2 text-xs font-medium text-zinc-700 cursor-pointer">                   
                  <input                                                                                                       
                    type="checkbox"                                                                                            
                    checked={ativa}                                                                                            
                    onChange={(e) => setAtiva(e.target.checked)}                                                               
                    className="h-4 w-4 rounded border-zinc-300 text-[#0b1a2b] focus:ring-[#0b1a2b]"                            
                  />                                                                                                           
                  Quadra Ativa                                                                                                 
                </label>                                                                                                       
              </div>                                                                                                           
                                                                                                                                
              {/* Botões de Ação */}                                                                                           
              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">                         
                <button                                                                                                        
                  type="button"                                                                                                
                  onClick={() => setModalAberto(false)}                                                                        
                  className="rounded-lg px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition"              
                >                                                                                                              
                  Cancelar                                                                                                     
                </button>                                                                                                      
                <button
                  type="submit"
                  disabled={salvando}
                  className="rounded-lg bg-[#0b1a2b] px-5 py-2 text-xs font-medium text-white shadow-sm hover:bg-[#16334f]     
disabled:opacity-60 transition"
                >
                  {salvando ? "Salvando..." : "Salvar Quadra"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}