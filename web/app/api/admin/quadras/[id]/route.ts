import { NextResponse } from "next/server";                                                                                  
import type { ResultSetHeader } from "mysql2";                                                                               
import { pool } from "@/lib/db";                                                                                             
import { lerSessao } from "@/lib/sessao";                                                                                    
import { MODALIDADES, type Modalidade } from "@/lib/quadras";                                                                     
                                                                                                                                
type Contexto = {                                                                                                            
    params: Promise<{ id: string }>;                                                                                           
};                                                                                                                           
                                                                                                                                
// 1. PUT: Atualiza uma quadra existente                                                                                     
export async function PUT(requisicao: Request, { params }: Contexto) {                                                       
    const sessao = await lerSessao();                                                                                          
    if (!sessao || sessao.papel !== "admin") {                                                                                 
        return NextResponse.json({ erro: "Sem permissão." }, { status: 403 });                                                   
    }                                                                                                                          
                                                                                                                                
    const { id } = await params;                                                                                               
    const idQuadra = Number(id);                                                                                               
                                                                                                                                
    if (!Number.isInteger(idQuadra) || idQuadra <= 0) {                                                                        
        return NextResponse.json({ erro: "ID de quadra inválido." }, { status: 400 });                                           
    }                                                                                                                          
                                                                                                                                
    let corpo: unknown;                                                                                                        
    try {                                                                                                                      
        corpo = await requisicao.json();                                                                                         
    } catch {                                                                                                                  
        return NextResponse.json({ erro: "Corpo da requisição inválido." }, { status: 400 });                                    
    }                                                                                                                          
                                                                                                                                
    const { nome, modalidade, coberta, valor_hora, ativa } = (corpo ?? {}) as Record<string, unknown>;                         
                                                                                                                                
    if (typeof nome !== "string" || nome.trim().length === 0 || nome.length > 80) {                                            
        return NextResponse.json({ erro: "Nome é obrigatório (máx 80 caracteres)." }, { status: 400 });                          
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
            `UPDATE quadra                                                                                                         
                SET nome = ?, modalidade = ?, coberta = ?, valor_hora = ?, ativa = ?                                               
            WHERE id = ?`,                                                                                                       
            [                                                                                                                      
            nome.trim(),                                                                                                         
            modalidade,                                                                                                          
            coberta ? 1 : 0,                                                                                                     
            preco,                                                                                                               
            ativa ? 1 : 0,                                                                                                       
            idQuadra,                                                                                                            
            ]                                                                                                                      
        );                                                                                                                       
                                                                                                                                    
        if (resultado.affectedRows === 0) {                                                                                      
            return NextResponse.json({ erro: "Quadra não encontrada." }, { status: 404 });                                         
        }                                                                                                                        
                                                                                                                                    
        return NextResponse.json({ mensagem: "Quadra atualizada com sucesso!" });                                                
    } catch (erro: unknown) {                                                                                                  
        // 1062 = Nome duplicado em outra quadra                                                                                 
        if (typeof erro === "object" && erro !== null && "errno" in erro && (erro as { errno: number }).errno === 1062) {        
            return NextResponse.json(                                                                                              
                { erro: "Já existe outra quadra cadastrada com este nome." },                                                        
                { status: 409 }                                                                                                      
            );                                                                                                                     
        }                                                                                                                        
                                                                                                                                
        console.error("[quadras] erro ao atualizar:", erro);                                                                     
        return NextResponse.json({ erro: "Não foi possível atualizar a quadra." }, { status: 500 });                             
    }                                                                                                                          
}                                                                                                                            
                                                                                                                                
// 2. DELETE: Exclui uma quadra                                                                                              
export async function DELETE(_requisicao: Request, { params }: Contexto) {                                                   
    const sessao = await lerSessao();                                                                                          
    if (!sessao || sessao.papel !== "admin") {                                                                                 
        return NextResponse.json({ erro: "Sem permissão." }, { status: 403 });                                                   
    }                                                                                                                          
                                                                                                                                
    const { id } = await params;                                                                                               
    const idQuadra = Number(id);                                                                                               
                                                                                                                                
    if (!Number.isInteger(idQuadra) || idQuadra <= 0) {                                                                        
        return NextResponse.json({ erro: "ID inválido." }, { status: 400 });                                                     
    }                                                                                                                          
                                                                                                                                
    try {                                                                                                                      
        const [resultado] = await pool.execute<ResultSetHeader>(                                                                 
            `DELETE FROM quadra WHERE id = ?`,                                                                                     
            [idQuadra]                                                                                                             
        );                                                                                                                       
                                                                                                                                    
        if (resultado.affectedRows === 0) {                                                                                      
            return NextResponse.json({ erro: "Quadra não encontrada." }, { status: 404 });                                         
        }                                                                                                                        
                                                                                                                                    
        return NextResponse.json({ mensagem: "Quadra excluída com sucesso!" });                                                  
    } catch (erro: unknown) {                                                                                                  
        // Código 1451 no MySQL = ER_ROW_IS_REFERENCED_2 (violação de chave estrangeira com a tabela reserva)                    
        if (typeof erro === "object" && erro !== null && "errno" in erro && (erro as { errno: number }).errno === 1451) {        
            return NextResponse.json(                                                                                              
            {                                                                                                                    
                erro: "Esta quadra não pode ser excluída pois possui histórico de reservas. Em vez disso, você pode desativá-la.", 
            },                                                                                                                   
            { status: 409 }                                                                                                      
            );                                                                                                                     
        }                                                                                                                        
                                                                                                                                
        console.error("[quadras] erro ao excluir:", erro);                                                                       
        return NextResponse.json({ erro: "Não foi possível excluir a quadra." }, { status: 500 });                               
    }                                                                                                                          
}      