import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const NOME_COOKIE = "sessao";
const DURACAO_SEGUNDOS = 60 * 60 * 8; // 8 horas

export type Sessao = {
  id: number;
  papel: "cliente" | "admin";
  exp: number; // epoch em segundos
};

function segredo(): string {
  const valor = process.env.SESSION_SECRET;
  if (!valor || valor.length < 32) {
    throw new Error(
      "SESSION_SECRET ausente ou muito curto (minimo 32 caracteres).",
    );
  }
  return valor;
}

function assinar(dados: string): string {
  return createHmac("sha256", segredo()).update(dados).digest("base64url");
}

/**
 * O cookie guarda os dados em claro mais uma assinatura HMAC. Qualquer
 * alteracao no conteudo (trocar o papel para "admin", por exemplo) invalida a
 * assinatura, porque quem altera nao conhece o SESSION_SECRET.
 */
export async function criarSessao(id: number, papel: Sessao["papel"]) {
  const sessao: Sessao = {
    id,
    papel,
    exp: Math.floor(Date.now() / 1000) + DURACAO_SEGUNDOS,
  };

  const dados = Buffer.from(JSON.stringify(sessao)).toString("base64url");
  const valor = `${dados}.${assinar(dados)}`;

  (await cookies()).set(NOME_COOKIE, valor, {
    httpOnly: true, // JavaScript da pagina nao consegue ler
    sameSite: "lax", // nao acompanha requisicoes vindas de outros sites
    secure: process.env.NODE_ENV === "production", // so por HTTPS em producao
    path: "/",
    maxAge: DURACAO_SEGUNDOS,
  });
}

export async function lerSessao(): Promise<Sessao | null> {
  const bruto = (await cookies()).get(NOME_COOKIE)?.value;
  if (!bruto) return null;

  const [dados, assinatura] = bruto.split(".");
  if (!dados || !assinatura) return null;

  const esperada = assinar(dados);
  const a = Buffer.from(assinatura);
  const b = Buffer.from(esperada);
  // Comparacao em tempo constante: comparar com === vazaria informacao pelo
  // tempo de resposta, permitindo descobrir a assinatura byte a byte.
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const sessao = JSON.parse(
      Buffer.from(dados, "base64url").toString(),
    ) as Sessao;
    if (sessao.exp < Math.floor(Date.now() / 1000)) return null;
    return sessao;
  } catch {
    return null;
  }
}

export async function encerrarSessao() {
  (await cookies()).delete(NOME_COOKIE);
}
