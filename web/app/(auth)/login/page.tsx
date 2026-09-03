"use client";

import Link from "next/link";
import { useState } from "react";
import { Campo } from "../campo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  function handleSubmit(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);

    // TODO: enviar para POST /api/auth/login
  }

  return (
    <>
      <h1 className="text-center text-2xl font-semibold text-[#1a3a52]">
        Bem-vindo de volta!
      </h1>

      <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-3">
        <Campo
          id="email"
          tipo="email"
          placeholder="E-mail"
          valor={email}
          aoAlterar={setEmail}
          icone="email"
          autoComplete="email"
        />
        <Campo
          id="senha"
          tipo="password"
          placeholder="Senha"
          valor={senha}
          aoAlterar={setSenha}
          icone="senha"
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between px-1 text-xs text-[#1a3a52]">
          <Link href="/cadastro" className="font-medium hover:underline">
            Registre-se
          </Link>
          <span className="text-[#9c8464]">Esqueci minha senha?</span>
        </div>

        {erro && (
          <p role="alert" className="px-1 text-sm text-red-700">
            {erro}
          </p>
        )}

        <button
          type="submit"
          className="mt-3 rounded-full bg-[#0b1a2b] py-3 text-lg font-medium tracking-wide text-white transition hover:bg-[#16334f]"
        >
          Entrar
        </button>
      </form>
    </>
  );
}
