import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import type { ResultSetHeader } from "mysql2";
import { pool } from "@/lib/db";
import { criarSessao } from "@/lib/sessao";

const CUSTO_BCRYPT = 12;

export async function POST(requisicao: Request) {
  let corpo: unknown;
  try {
    corpo = await requisicao.json();
  } catch {
    return NextResponse.json({ erro: "Requisicao invalida." }, { status: 400 });
  }

  const { nome, email, telefone, senha } = (corpo ?? {}) as Record<
    string,
    unknown
  >;

  // Validacao no servidor. A do formulario existe para dar retorno rapido ao
  // usuario, mas nao vale nada como protecao: qualquer um chama esta rota
  // diretamente.
  if (typeof nome !== "string" || nome.trim().length < 3) {
    return NextResponse.json(
      { erro: "Informe o nome completo." },
      { status: 400 },
    );
  }
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ erro: "E-mail invalido." }, { status: 400 });
  }
  if (typeof senha !== "string" || senha.length < 8) {
    return NextResponse.json(
      { erro: "A senha precisa ter ao menos 8 caracteres." },
      { status: 400 },
    );
  }
  if (telefone !== undefined && typeof telefone !== "string") {
    return NextResponse.json({ erro: "Telefone invalido." }, { status: 400 });
  }

  const senhaHash = await bcrypt.hash(senha, CUSTO_BCRYPT);

  try {
    // O papel NAO vem da requisicao: quem se cadastra e sempre cliente.
    // Aceitar um papel enviado pelo navegador permitiria a qualquer visitante
    // criar uma conta de administrador.
    const [resultado] = await pool.execute<ResultSetHeader>(
      `INSERT INTO usuario (nome, email, senha_hash, telefone, papel)
       VALUES (?, ?, ?, ?, 'cliente')`,
      [
        nome.trim(),
        email.trim().toLowerCase(),
        senhaHash,
        telefone?.trim() || null,
      ],
    );

    await criarSessao(resultado.insertId, "cliente");

    return NextResponse.json(
      { id: resultado.insertId, nome: nome.trim(), papel: "cliente" },
      { status: 201 },
    );
  } catch (erro) {
    if (
      typeof erro === "object" &&
      erro !== null &&
      (erro as { code?: string }).code === "ER_DUP_ENTRY"
    ) {
      return NextResponse.json(
        { erro: "Este e-mail ja esta cadastrado." },
        { status: 409 },
      );
    }

    console.error("[cadastro] falha ao inserir usuario:", erro);
    return NextResponse.json(
      { erro: "Nao foi possivel concluir o cadastro." },
      { status: 500 },
    );
  }
}
