import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESSAO, verificarToken } from "@/lib/sessao";

export async function proxy(requisicao: NextRequest) {
  const { pathname } = requisicao.nextUrl;
  const token = requisicao.cookies.get(COOKIE_SESSAO)?.value;
  const sessao = token ? await verificarToken(token) : null;

  const ehApi = pathname.startsWith("/api/");
  const exigeAdmin =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  // --- nao autenticado ---
  if (!sessao) {
    // API responde com status; pagina redireciona para o login.
    if (ehApi) {
      return NextResponse.json({ erro: "Nao autenticado." }, { status: 401 });
    }
    const destino = new URL("/login", requisicao.url);
    destino.searchParams.set("redirect", pathname);
    const resposta = NextResponse.redirect(destino);
    // Cookie invalido ou expirado nao deve continuar sendo reenviado.
    resposta.cookies.delete(COOKIE_SESSAO);
    return resposta;
  }

  // --- autenticado, mas sem permissao ---
  if (exigeAdmin && sessao.papel !== "admin") {
    if (ehApi) {
      return NextResponse.json({ erro: "Sem permissao." }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/cliente", requisicao.url));
  }

  return NextResponse.next();
}

export const config = {
  // Apenas as areas protegidas. Login, cadastro, landing e as rotas de
  // autenticacao ficam de fora, senao ninguem conseguiria entrar.
  matcher: [
    "/admin/:path*",
    "/cliente/:path*",
    "/api/admin/:path*",
    "/api/reservas/:path*",
  ],
};
