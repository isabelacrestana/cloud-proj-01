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
                                                                                                                                
  // Estados dos Filtros                                                                                                       
  const [filtroNome, setFiltroNome] = useState("");                                                                            
  const [filtroModalidade, setFiltroModalidade] = useState<string>("todas");                                                   
  const [filtroCoberta, setFiltroCoberta] = useState<string>("todas");                                                         
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");                                                           
                                                                                                                                
  // Estados do Modal                                                                                                          
  const [modalAberto, setModalAberto] = useState(false);                                                                       
  const [salvando, setSalvando] = useState(false);                                                                             
  const [idEditando, setIdEditando] = useState<number | null>(null);                                                           
                                                                                                                                
  // Campos do formulário                                                                                                      
  const [nome, setNome] = useState("");                                                                                        
  const [modalidade, setModalidade] = useState<Modalidade>("tenis");                                                           
  const [coberta, setCoberta] = useState(false);                                                                               
  const [valorHora, setValorHora] = useState("");                                                                              
  const [ativa, setAtiva] = useState(true);                                                                                    
                                                                                                                                
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
                                                                                                                                
  const quadrasFiltradas = quadras.filter((quadra) => {                                                                        
    const bateNome = quadra.nome                                                                                               
      .toLowerCase()                                                                                                           
      .includes(filtroNome.trim().toLowerCase());                                                                              
                                                                                                                                
    const bateModalidade =                                                                                                     
      filtroModalidade === "todas" || quadra.modalidade === filtroModalidade;                                                  
                                                                                                                                
    const bateCobertura =                                                                                                      
      filtroCoberta === "todas" ||                                                                                             
      (filtroCoberta === "coberta" && quadra.coberta) ||                                                                       
      (filtroCoberta === "ar_livre" && !quadra.coberta);                                                                       
                                                                                                                                
    const bateStatus =                                                                                                         
      filtroStatus === "todos" ||                                                                                              
      (filtroStatus === "ativas" && quadra.ativa) ||                                                                           
      (filtroStatus === "inativas" && !quadra.ativa);                                                                          
                                                                                                                                
    return bateNome && bateModalidade && bateCobertura && bateStatus;                                                          
  });                                                                                                                          
                                                                                                                                
  const temFiltroAtivo =                                                                                                       
    filtroNome.trim() !== "" ||                                                                                                
    filtroModalidade !== "todas" ||                                                                                            
    filtroCoberta !== "todas" ||                                                                                               
    filtroStatus !== "todos";                                                                                                  
                                                                                                                                
  function limparFiltros() {                                                                                                   
    setFiltroNome("");                                                                                                         
    setFiltroModalidade("todas");                                                                                              
    setFiltroCoberta("todas");                                                                                                 
    setFiltroStatus("todos");                                                                                                  
  }                                                                                                                            
                                                                                                                                
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
      {/* Cabeçalho */}                                                                                                        
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">                                     
        <div>                                                                                                                  
          <h1 className="text-2xl font-bold text-[#1a3a52]">Gerenciamento de Quadras</h1>                                      
          <p className="text-sm text-[#9c8464] mt-0.5">                                                                        
            Cadastre, edite preços e gerencie a disponibilidade das quadras do clube.                                          
          </p>                                                                                                                 
        </div>                                                                                                                 
        <button                                                                                                                
          onClick={abrirModalCriacao}                                                                                          
          className="inline-flex items-center justify-center rounded-full bg-[#0b1a2b] px-6 py-2.5 text-sm font-medium text-   
white shadow-sm transition hover:bg-[#16334f] cursor-pointer"                                                                    
        >                                                                                                                      
          + Nova Quadra                                                                                                        
        </button>                                                                                                              
      </div>                                                                                                                   
                                                                                                                                
      {/* Avisos */}                                                                                                           
      {mensagemSucesso && (                                                                                                    
        <div className="rounded-2xl bg-[#f5f1e8] p-4 text-sm font-medium text-[#1a3a52] border border-[#b08d57]/50 flex items- 
center gap-2">                                                                                                                   
          <span className="text-[#8a6d3b]">✓</span>                                                                            
          {mensagemSucesso}                                                                                                    
        </div>                                                                                                                 
      )}                                                                                                                       
                                                                                                                                
      {erro && (                                                                                                               
        <div className="rounded-2xl bg-red-50/80 p-4 text-sm font-medium text-red-800 border border-red-200">                  
          {erro}                                                                                                               
        </div>                                                                                                                 
      )}                                                                                                                       
                                                                                                                                
      {/* Barra de Filtros Harmonizada */}                                                                                     
      <div className="rounded-2xl border border-[#b08d57]/30 bg-[#f5f1e8]/70 p-5 shadow-xs">                                   
        <div className="flex flex-col gap-4">                                                                                  
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">                                               
            {/* Busca por Nome */}                                                                                             
            <div>                                                                                                              
              <label className="block text-xs font-semibold text-[#1a3a52] mb-1.5">                                            
                Buscar por nome                                                                                                
              </label>                                                                                                         
              <input                                                                                                           
                type="text"                                                                                                    
                placeholder="Ex: Saibro, Rapida..."                                                                            
                value={filtroNome}                                                                                             
                onChange={(e) => setFiltroNome(e.target.value)}                                                                
                className="w-full rounded-xl border border-[#b08d57]/50 bg-white px-3.5 py-2 text-xs text-[#1a3a52] outline-   
none transition placeholder:text-[#9c8464] focus:border-[#0b1a2b] focus:ring-1 focus:ring-[#0b1a2b]"                             
              />                                                                                                               
            </div>                                                                                                             
                                                                                                                                
            {/* Modalidade */}                                                                                                 
            <div>                                                                                                              
              <label className="block text-xs font-semibold text-[#1a3a52] mb-1.5">                                            
                Modalidade                                                                                                     
              </label>                                                                                                         
              <select                                                                                                          
                value={filtroModalidade}                                                                                       
                onChange={(e) => setFiltroModalidade(e.target.value)}                                                          
                className="w-full rounded-xl border border-[#b08d57]/50 bg-white px-3.5 py-2 text-xs text-[#1a3a52] outline-   
none transition focus:border-[#0b1a2b] focus:ring-1 focus:ring-[#0b1a2b]"                                                        
              >                                                                                                                
                <option value="todas">Todas as modalidades</option>                                                            
                <option value="tenis">Tênis</option>                                                                           
                <option value="beach_tennis">Beach Tennis</option>                                                             
                <option value="futsal">Futsal</option>                                                                         
                <option value="volei">Vôlei</option>                                                                           
                <option value="basquete">Basquete</option>                                                                     
                <option value="poliesportiva">Poliesportiva</option>                                                           
              </select>                                                                                                        
            </div>                                                                                                             
                                                                                                                                
            {/* Cobertura */}                                                                                                  
            <div>                                                                                                              
              <label className="block text-xs font-semibold text-[#1a3a52] mb-1.5">                                            
                Tipo de Cobertura                                                                                              
              </label>                                                                                                         
              <select                                                                                                          
                value={filtroCoberta}                                                                                          
                onChange={(e) => setFiltroCoberta(e.target.value)}                                                             
                className="w-full rounded-xl border border-[#b08d57]/50 bg-white px-3.5 py-2 text-xs text-[#1a3a52] outline-   
none transition focus:border-[#0b1a2b] focus:ring-1 focus:ring-[#0b1a2b]"                                                        
              >                                                                                                                
                <option value="todas">Todas as coberturas</option>                                                             
                <option value="coberta">Apenas cobertas</option>                                                               
                <option value="ar_livre">Ao ar livre</option>                                                                  
              </select>                                                                                                        
            </div>                                                                                                             
                                                                                                                                
            {/* Status */}                                                                                                     
            <div>                                                                                                              
              <label className="block text-xs font-semibold text-[#1a3a52] mb-1.5">                                            
                Status                                                                                                         
              </label>                                                                                                         
              <select                                                                                                          
                value={filtroStatus}                                                                                           
                onChange={(e) => setFiltroStatus(e.target.value)}                                                              
                className="w-full rounded-xl border border-[#b08d57]/50 bg-white px-3.5 py-2 text-xs text-[#1a3a52] outline-   
none transition focus:border-[#0b1a2b] focus:ring-1 focus:ring-[#0b1a2b]"                                                        
              >                                                                                                                
                <option value="todos">Todos os status</option>                                                                 
                <option value="ativas">Apenas ativas</option>                                                                  
                <option value="inativas">Apenas inativas</option>                                                              
              </select>                                                                                                        
            </div>                                                                                                             
          </div>                                                                                                               
                                                                                                                                
          {/* Rodapé da barra de filtros */}                                                                                   
          <div className="flex items-center justify-between pt-3 border-t border-[#b08d57]/20 text-xs">                        
            <span className="text-[#8a6d3b]">                                                                                  
              Exibindo <strong className="text-[#1a3a52] font-semibold">{quadrasFiltradas.length}</strong> de {quadras.length} 
quadras                                                                                                                          
            </span>                                                                                                            
            {temFiltroAtivo && (                                                                                               
              <button                                                                                                          
                onClick={limparFiltros}                                                                                        
                className="font-medium text-[#b08d57] hover:text-[#1a3a52] transition underline cursor-pointer"                
              >                                                                                                                
                Limpar filtros                                                                                                 
              </button>                                                                                                        
            )}                                                                                                                 
          </div>                                                                                                               
        </div>                                                                                                                 
      </div>                                                                                                                   
                                                                                                                                
      {/* Tabela de Quadras */}                                                                                                
      <div className="overflow-hidden rounded-2xl border border-[#b08d57]/30 bg-white shadow-xs">                              
        {carregando ? (                                                                                                        
          <div className="p-10 text-center text-sm text-[#9c8464]">                                                            
            Carregando quadras...                                                                                              
          </div>                                                                                                               
        ) : quadras.length === 0 ? (                                                                                           
          <div className="p-10 text-center text-sm text-[#9c8464]">                                                            
            Nenhuma quadra cadastrada até o momento.                                                                           
          </div>                                                                                                               
        ) : quadrasFiltradas.length === 0 ? (                                                                                  
          <div className="p-10 text-center text-sm text-[#9c8464] space-y-2">                                                  
            <p>Nenhuma quadra encontrada com os filtros selecionados.</p>                                                      
            <button                                                                                                            
              onClick={limparFiltros}                                                                                          
              className="text-xs text-[#0b1a2b] font-semibold hover:underline"                                                 
            >                                                                                                                  
              Limpar filtros aplicados                                                                                         
            </button>                                                                                                          
          </div>                                                                                                               
        ) : (                                                                                                                  
          <div className="overflow-x-auto">                                                                                    
            <table className="w-full text-left text-sm">                                                                       
              <thead className="border-b border-[#b08d57]/20 bg-[#f5f1e8] text-xs font-semibold text-[#1a3a52] uppercase       
tracking-wider">                                                                                                                 
                <tr>                                                                                                           
                  <th className="px-6 py-4">Nome</th>                                                                          
                  <th className="px-6 py-4">Modalidade</th>                                                                    
                  <th className="px-6 py-4">Tipo</th>                                                                          
                  <th className="px-6 py-4">Valor / Hora</th>                                                                  
                  <th className="px-6 py-4">Status</th>                                                                        
                  <th className="px-6 py-4 text-right">Ações</th>                                                              
                </tr>                                                                                                          
              </thead>                                                                                                         
              <tbody className="divide-y divide-[#b08d57]/15 text-[#1a3a52]">                                                  
                {quadrasFiltradas.map((quadra) => (                                                                            
                  <tr                                                                                                          
                    key={quadra.id}                                                                                            
                    className="hover:bg-[#f5f1e8]/40 transition duration-150"                                                  
                  >                                                                                                            
                    <td className="px-6 py-4 font-medium text-[#1a3a52]">                                                      
                      {quadra.nome}                                                                                            
                    </td>                                                                                                      
                    <td className="px-6 py-4">                                                                                 
                      <span className="inline-flex items-center rounded-full bg-[#f5f1e8] border border-[#b08d57]/40 px-3 py-1 
text-xs font-medium text-[#8a6d3b]">                                                                                             
                        {NOMES_MODALIDADES[quadra.modalidade] ?? quadra.modalidade}                                            
                      </span>                                                                                                  
                    </td>                                                                                                      
                     <td className="px-6 py-4">                                                                                                     
                      {quadra.coberta ? (                                                                                                          
                        <span className="inline-flex items-center rounded-full bg-[#0b1a2b]/10 border border-[#0b1a2b]/25 px-3 py-1 text-xs font-  
                  medium text-[#0b1a2b]">                                                                                                          
                          Coberta                                                                                                                  
                        </span>                                                                                                                    
                      ) : (                                                                                                                        
                        <span className="inline-flex items-center rounded-full bg-[#f5f1e8] border border-[#b08d57]/30 px-3 py-1 text-xs font-     
                  medium text-[#9c8464]">                                                                                                          
                          Ao ar livre                                                                                                              
                        </span>                                                                                                                    
                      )}                                                                                                                           
                    </td>                                                                                                   
                    <td className="px-6 py-4 font-semibold text-[#1a3a52]">                                                    
                      {FORMATADOR_MOEDA.format(quadra.valor_hora)}                                                             
                    </td>                                                                                                      
                    <td className="px-6 py-4">                                                                                 
                      {quadra.ativa ? (                                                                                        
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2d6a4f]">                 
                          <span className="h-2 w-2 rounded-full bg-[#2d6a4f]"></span>                                          
                          Ativa                                                                                                
                        </span>                                                                                                
                      ) : (                                                                                                    
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#9c8464]">                 
                          <span className="h-2 w-2 rounded-full bg-zinc-400"></span>                                           
                          Inativa                                                                                              
                        </span>                                                                                                
                      )}                                                                                                       
                    </td>                                                                                                      
                    <td className="px-6 py-4 text-right space-x-2">                                                            
                      <button                                                                                                  
                        onClick={() => abrirModalEdicao(quadra)}                                                               
                        className="rounded-lg border border-[#b08d57]/40 px-3 py-1 text-xs font-medium text-[#1a3a52] hover:bg-
[#f5f1e8] transition cursor-pointer"                                                                                             
                      >                                                                                                        
                        Editar                                                                                                 
                      </button>                                                                                                
                      <button                                                                                                  
                        onClick={() => handleExcluir(quadra)}                                                                  
                        className="rounded-lg border border-red-200/60 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-
50 transition cursor-pointer"                                                                                                    
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
                                                                                                                                
      {/* Modal Harmonizado */}                                                                                                
      {modalAberto && (                                                                                                        
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1a2b]/50 p-4 backdrop-blur-xs">             
          <div className="w-full max-w-md rounded-3xl border border-[#b08d57]/30 bg-white p-7 shadow-2xl">                     
            <h2 className="text-xl font-bold text-[#1a3a52]">                                                                  
              {idEditando ? "Editar Quadra" : "Cadastrar Nova Quadra"}                                                         
            </h2>                                                                                                              
            <p className="mt-1 text-xs text-[#9c8464]">                                                                        
              Preencha as informações para disponibilizar no clube.                                                            
            </p>                                                                                                               
                                                                                                                                
            <form onSubmit={handleSalvar} className="mt-6 space-y-4">                                                          
              <div>                                                                                                            
                <label className="block text-xs font-semibold text-[#1a3a52]">                                                 
                  Nome da Quadra                                                                                               
                </label>                                                                                                       
                <input                                                                                                                         
                  type="text"                                                                                                                  
                  required                                                                                                                     
                  maxLength={80}                                                                                                               
                  placeholder="Ex: Quadra 3 - Saibro"                                                                                          
                  value={nome}                                                                                                                 
                  onChange={(e) => setNome(e.target.value)}                                                                                    
                  className="mt-1.5 w-full rounded-xl border border-[#b08d57] bg-white px-3.5 py-2.5 text-sm font-medium text-[#0b1a2b]        
              outline-none transition placeholder:text-[#9c8464]/60 focus:border-[#0b1a2b] focus:ring-1 focus:ring-[#0b1a2b]"                  
                />                                                                                                              
              </div>                                                                                                           
                                                                                                                                
              <div>                                                                                                            
                <label className="block text-xs font-semibold text-[#1a3a52]">                                                 
                  Modalidade                                                                                                   
                </label>                                                                                                       
                <select                                                                                                        
                  value={modalidade}                                                                                           
                  onChange={(e) => setModalidade(e.target.value as Modalidade)}                                                
                  className="mt-1.5 w-full rounded-xl border border-[#b08d57] bg-white px-3.5 py-2.5 text-sm text-[#1a3a52]    
outline-none transition focus:border-[#0b1a2b] focus:ring-1 focus:ring-[#0b1a2b]"                                                
                >                                                                                                              
                  <option value="tenis">Tênis</option>                                                                         
                  <option value="beach_tennis">Beach Tennis</option>                                                           
                  <option value="futsal">Futsal</option>                                                                       
                  <option value="volei">Vôlei</option>                                                                         
                  <option value="basquete">Basquete</option>                                                                   
                  <option value="poliesportiva">Poliesportiva</option>                                                         
                </select>                                                                                                      
              </div>                                                                                                           
                                                                                                                                
              <div>                                                                                                            
                <label className="block text-xs font-semibold text-[#1a3a52]">                                                 
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
                  className="mt-1.5 w-full rounded-xl border border-[#b08d57] bg-white px-3.5 py-2.5 text-sm font-medium text-[#0b1a2b]        
              outline-none transition placeholder:text-[#9c8464]/60 focus:border-[#0b1a2b] focus:ring-1 focus:ring-[#0b1a2b]"
                />                                                                                                         
              </div>                                                                                                           
                                                                                                                                
              <div className="flex items-center gap-6 pt-2">                                                                   
                <label className="flex items-center gap-2 text-xs font-medium text-[#1a3a52] cursor-pointer">                  
                  <input                                                                                                       
                    type="checkbox"                                                                                            
                    checked={coberta}                                                                                          
                    onChange={(e) => setCoberta(e.target.checked)}                                                             
                    className="h-4 w-4 rounded border-[#b08d57] text-[#0b1a2b] focus:ring-[#0b1a2b]"                           
                  />                                                                                                           
                  Quadra Coberta                                                                                               
                </label>                                                                                                       
                                                                                                                                
                <label className="flex items-center gap-2 text-xs font-medium text-[#1a3a52] cursor-pointer">                  
                  <input                                                                                                       
                    type="checkbox"                                                                                            
                    checked={ativa}                                                                                            
                    onChange={(e) => setAtiva(e.target.checked)}                                                               
                    className="h-4 w-4 rounded border-[#b08d57] text-[#0b1a2b] focus:ring-[#0b1a2b]"                           
                  />                                                                                                           
                  Quadra Ativa                                                                                                 
                </label>                                                                                                       
              </div>                                                                                                           
                                                                                                                                
              <div className="mt-7 flex items-center justify-end gap-3 pt-4 border-t border-[#b08d57]/20">                     
                <button                                                                                                        
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="rounded-full px-5 py-2.5 text-xs font-medium text-[#1a3a52] hover:bg-[#f5f1e8] transition cursor- 
pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="rounded-full bg-[#0b1a2b] px-6 py-2.5 text-xs font-medium text-white shadow-sm hover:bg-[#16334f] 
disabled:opacity-60 transition cursor-pointer"
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