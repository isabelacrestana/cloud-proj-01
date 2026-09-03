import { cookies } from "next/headers";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const NOME_COOKIE = "sessao";
const DURACAO_SEGUNDOS = 60 * 60 * 8; // 8 horas
const ALGORITMO = "HS256";

export type Papel = "cliente" | "admin";

export type Sessao = {
  id: number;
  papel: Papel;
};

/**
 * A chave vira bytes uma vez por processo. Usamos jose (e nao node:crypto)
 * porque o middleware roda no Edge Runtime, onde as APIs do Node nao existem:
 * assim o mesmo codigo de verificacao serve para o middleware e para as rotas.
 */
function chave(): Uint8Array {
  const valor = process.env.JWT_SECRET;
  if (!valor || valor.length < 32) {
    throw new Error(
      "JWT_SECRET ausente ou muito curto (minimo 32 caracteres).",
    );
  }
  return new TextEncoder().encode(valor);
}

export async function assinarToken(id: number, papel: Papel): Promise<string> {
  return new SignJWT({ papel })
    .setProtectedHeader({ alg: ALGORITMO })
    .setSubject(String(id))
    .setIssuedAt()
    .setExpirationTime(`${DURACAO_SEGUNDOS}s`)
    .sign(chave());
}

/**
 * Verifica assinatura e expiracao. Qualquer falha devolve null: token
 * adulterado, expirado, assinado com outra chave ou com algoritmo diferente.
 */
export async function verificarToken(token: string): Promise<Sessao | null> {
  try {
    const { payload } = await jwtVerify(token, chave(), {
      algorithms: [ALGORITMO], // fixo: impede o ataque de trocar alg para "none"
    });
    return dosPayload(payload);
  } catch {
    return null;
  }
}

function dosPayload(payload: JWTPayload): Sessao | null {
  const id = Number(payload.sub);
  const papel = payload.papel;
  if (!Number.isInteger(id) || (papel !== "cliente" && papel !== "admin")) {
    return null;
  }
  return { id, papel };
}

export async function criarSessao(id: number, papel: Papel) {
  const token = await assinarToken(id, papel);

  (await cookies()).set(NOME_COOKIE, token, {
    httpOnly: true, // JavaScript da pagina nao consegue ler
    sameSite: "lax", // nao acompanha requisicoes vindas de outros sites
    secure: process.env.NODE_ENV === "production", // so por HTTPS em producao
    path: "/",
    maxAge: DURACAO_SEGUNDOS,
  });
}

export async function lerSessao(): Promise<Sessao | null> {
  const token = (await cookies()).get(NOME_COOKIE)?.value;
  if (!token) return null;
  return verificarToken(token);
}

export async function encerrarSessao() {
  (await cookies()).delete(NOME_COOKIE);
}

export const COOKIE_SESSAO = NOME_COOKIE;
