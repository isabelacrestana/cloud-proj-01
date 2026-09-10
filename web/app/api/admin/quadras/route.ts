// CRUD das quadras

import { NextResponse } from "next/server";                                                                                  
import type { ResultSetHeader } from "mysql2";                                                                
import { pool } from "@/lib/db";                                                                                             
import { lerSessao } from "@/lib/sessao";
import { MODALIDADES, type Modalidade, type Quadra } from "@/lib/quadras";                                                                                    
                                                                                                                                
                                                                                                                                
// 1. GET: Retorna todas as quadras                                                                                          
export async function GET() {                                                                                                
    try {                                                                                                                      
    const [linhas] = await pool.execute<Quadra[]>(                                                                           
        `SELECT id, nome, modalidade, coberta, valor_hora, ativa                                                               
            FROM quadra                                                                                                         
        ORDER BY id DESC`                                                                                                    
    );                                                                                                                       
                                                                                                                                
    // Converte os campos tinyint(1) em booleanos puros para o front                                                         
    const quadras = linhas.map((q) => ({                                                                                     
        ...q,                                                                                                                  
        coberta: Boolean(q.coberta),                                                                                           
        ativa: Boolean(q.ativa),                                                                                               
        valor_hora: Number(q.valor_hora),                                                                                      
    }));                                                                                                                     
                                                                                                                                
    return NextResponse.json(quadras);                                                                                       
    } catch (erro) {                                                                                                           
    console.error("[quadras] erro ao buscar:", erro);                                                                        
    return NextResponse.json(                                                                                                
        { erro: "Erro ao buscar quadras." },                                                                                   
        { status: 500 }                                                                                                        
    );                                                                                                                       
    }                                                                                                                          
}                                                                                                                            
                                                                                                                                
// 2. POST: Cadastra uma nova quadra                                                                                         
export async function POST(requisicao: Request) {  

    // Verificação de segurança extra para garantir perfil admin                                                               
    const sessao = await lerSessao();                                                                                          
    if (!sessao || sessao.papel !== "admin") {                                                                                 
        return NextResponse.json({ erro: "Sem permissão." }, { status: 403 });                                                   
    }                                                                                                                          
                                                                                                                                
    let corpo: unknown;                                                                                                        
    try {                                                                                                                      
        corpo = await requisicao.json();                                                                                         
    } catch {                                                                                                                  
        return NextResponse.json({ erro: "Corpo da requisição inválido." }, { status: 400 });                                    
    }                                                                                                                          
                                                                                                                                
    const { nome, modalidade, coberta, valor_hora, ativa } = (corpo ?? {}) as Record<string, unknown>;                         
                                                                                                                                
    // Validações básicas                                                                                                      
    if (typeof nome !== "string" || nome.trim().length === 0 || nome.length > 80) {                                            
        return NextResponse.json({ erro: "Nome da quadra é obrigatório (máx 80 caracteres)." }, { status: 400 });                
    }                                                                                                                          
                                                                                                                                
    if (typeof modalidade !== "string" || !MODALIDADES.includes(modalidade as Modalidade)) {                                   
        return NextResponse.json(                                                                                                
            { erro: `Modalidade inválida. Permitidas: ${MODALIDADES.join(", ")}` },                                                
            { status: 400 }                                                                                                        
        );                                                                                                                       
    }                                                                                                                          
                                                                                                                                
    const preco = Number(valor_hora);                                                                                          
    if (isNaN(preco) || preco <= 0) {                                                                                          
        return NextResponse.json({ erro: "Valor por hora deve ser maior que zero." }, { status: 400 });                          
    }                                                                                                                          
                                                                                                                                
    try {                                                                                                                      
    const [resultado] = await pool.execute<ResultSetHeader>(                                                                 
        `INSERT INTO quadra (nome, modalidade, coberta, valor_hora, ativa)                                                     
        VALUES (?, ?, ?, ?, ?)`,                                                                                              
        [                                                                                                                      
        nome.trim(),                                                                                                         
        modalidade,                                                                                                          
        coberta ? 1 : 0,                                                                                                     
        preco,                                                                                                               
        ativa !== false ? 1 : 0,                                                                                             
        ]                                                                                                                      
    );                                                                                                                       
                                                                                                                                
    return NextResponse.json(                                                                                                
        {
        id: resultado.insertId,
        mensagem: "Quadra criada com sucesso!",
        },
        { status: 201 }
    );
    } catch (erro: unknown) {
    // Código de erro 1062 do MySQL = violação de UNIQUE (nome duplicado)
    if (typeof erro === "object" && erro !== null && "errno" in erro && (erro as { errno: number }).errno === 1062) {        
        return NextResponse.json(
            { erro: "Já existe uma quadra cadastrada com este nome." },
            { status: 409 }
        );
    }

    console.error("[quadras] erro ao criar:", erro);
    
    return NextResponse.json({ erro: "Não foi possível cadastrar a quadra." }, { status: 500 });
    }
}