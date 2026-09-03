"use client";

import Link from "next/link";
import { useState } from "react";

export default function CadastroPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  function handleSubmit(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);

    if (senha.length < 8) {
      setErro("A senha precisa ter ao menos 8 caracteres.");
      return;
    }
    if (senha !== confirmacao) {
      setErro("As senhas nao conferem.");
      return;
    }

    // TODO: enviar para POST /api/auth/cadastro
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h1 className="text-xl font-semibold">Criar conta</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Preencha os dados para se cadastrar no clube.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Campo
          id="nome"
          rotulo="Nome completo"
          valor={nome}
          aoAlterar={setNome}
          autoComplete="name"
        />
        <Campo
          id="email"
          rotulo="E-mail"
          tipo="email"
          valor={email}
          aoAlterar={setEmail}
          autoComplete="email"
        />
        <Campo
          id="telefone"
          rotulo="Telefone"
          tipo="tel"
          valor={telefone}
          aoAlterar={setTelefone}
          autoComplete="tel"
          obrigatorio={false}
        />
        <Campo
          id="senha"
          rotulo="Senha"
          tipo="password"
          valor={senha}
          aoAlterar={setSenha}
          autoComplete="new-password"
        />
        <Campo
          id="confirmacao"
          rotulo="Confirmar senha"
          tipo="password"
          valor={confirmacao}
          aoAlterar={setConfirmacao}
          autoComplete="new-password"
        />

        {erro && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {erro}
          </p>
        )}

        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Cadastrar
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        Ja tem conta?{" "}
        <Link href="/login" className="font-medium underline underline-offset-4">
          Entrar
        </Link>
      </p>
    </div>
  );
}

function Campo({
  id,
  rotulo,
  valor,
  aoAlterar,
  tipo = "text",
  autoComplete,
  obrigatorio = true,
}: {
  id: string;
  rotulo: string;
  valor: string;
  aoAlterar: (valor: string) => void;
  tipo?: string;
  autoComplete?: string;
  obrigatorio?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {rotulo}
      </label>
      <input
        id={id}
        type={tipo}
        value={valor}
        onChange={(e) => aoAlterar(e.target.value)}
        required={obrigatorio}
        autoComplete={autoComplete}
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
      />
    </div>
  );
}
