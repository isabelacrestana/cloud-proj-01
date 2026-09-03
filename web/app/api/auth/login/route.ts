import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import type { RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";
import { criarSessao } from "@/lib/sessao";

type LinhaUsuario = RowDataPacket & {
  id: number;
  nome: string;
  senha_hash: string;
  papel: "cliente" | "admin";
};

// Hash descartavel usado quando o e-mail nao existe. Sem ele, a resposta
// voltaria na hora nesse caso e demoraria ~200ms quando o e-mail existisse,
// permitindo descobrir quais e-mails estao cadastrados pelo tempo de resposta.
const HASH_FALSO = "$2b$12$" + "n".repeat(53);

export async function POST(requisicao: Request) {
  let corpo: unknown;
  try {
    corpo = await requisicao.json();
  } catch {
    return NextResponse.json({ erro: "Requisicao invalida." }, { status: 400 });
  }

  const { email, senha } = (corpo ?? {}) as Record<string, unknown>;

  if (typeof email !== "string" || typeof senha !== "string") {
    return NextResponse.json(
      { erro: "Informe e-mail e senha." },
      { status: 400 },
    );
  }

  try {
    const [linhas] = await pool.execute<LinhaUsuario[]>(
      `SELECT id, nome, senha_hash, papel
         FROM usuario
        WHERE email = ?
        LIMIT 1`,
      [email.trim().toLowerCase()],
    );

    const usuario = linhas[0];
    const confere = await bcrypt.compare(
      senha,
      usuario?.senha_hash ?? HASH_FALSO,
    );

    // Mensagem unica para "e-mail nao existe" e "senha errada": dizer qual dos
    // dois falhou entregaria a lista de e-mails cadastrados.
    if (!usuario || !confere) {
      return NextResponse.json(
        { erro: "E-mail ou senha incorretos." },
        { status: 401 },
      );
    }

    await criarSessao(usuario.id, usuario.papel);

    // A resposta nunca inclui senha_hash.
    return NextResponse.json({
      id: usuario.id,
      nome: usuario.nome,
      papel: usuario.papel,
    });
  } catch (erro) {
    console.error("[login] falha ao autenticar:", erro);
    return NextResponse.json(
      { erro: "Nao foi possivel entrar." },
      { status: 500 },
    );
  }
}
