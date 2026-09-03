"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Campo } from "../campo";

export default function CadastroPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();

  async function handleSubmit(evento: React.FormEvent) {
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

    setEnviando(true);
    try {
      const resposta = await fetch("/api/auth/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, telefone, senha }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.erro ?? "Nao foi possivel concluir o cadastro.");
        return;
      }

      router.push("/cliente");
      router.refresh();
    } catch {
      setErro("Falha de conexao. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <h1 className="text-center text-2xl font-semibold text-[#1a3a52]">
        Criar conta
      </h1>

      <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-3">
        <Campo
          id="nome"
          placeholder="Nome completo"
          valor={nome}
          aoAlterar={setNome}
          icone="usuario"
          autoComplete="name"
        />
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
          id="telefone"
          tipo="tel"
          placeholder="Telefone (opcional)"
          valor={telefone}
          aoAlterar={setTelefone}
          icone="telefone"
          autoComplete="tel"
          obrigatorio={false}
        />
        <Campo
          id="senha"
          tipo="password"
          placeholder="Senha"
          valor={senha}
          aoAlterar={setSenha}
          icone="senha"
          autoComplete="new-password"
        />
        <Campo
          id="confirmacao"
          tipo="password"
          placeholder="Confirmar senha"
          valor={confirmacao}
          aoAlterar={setConfirmacao}
          icone="senha"
          autoComplete="new-password"
        />

        <div className="px-1 text-xs text-[#1a3a52]">
          <Link href="/login" className="font-medium hover:underline">
            Ja tenho conta
          </Link>
        </div>

        {erro && (
          <p role="alert" className="px-1 text-sm text-red-700">
            {erro}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="mt-3 rounded-full bg-[#0b1a2b] py-3 text-lg font-medium tracking-wide text-white transition hover:bg-[#16334f] disabled:opacity-60"
        >
          {enviando ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>
    </>
  );
}
