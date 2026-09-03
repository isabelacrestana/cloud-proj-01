"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function BotaoSair() {
  const [saindo, setSaindo] = useState(false);
  const router = useRouter();

  async function sair() {
    setSaindo(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setSaindo(false);
    }
  }

  return (
    <button
      onClick={sair}
      disabled={saindo}
      className="rounded-full border border-white/30 px-4 py-1.5 text-sm text-white transition hover:bg-white/10 disabled:opacity-60"
    >
      {saindo ? "Saindo..." : "Sair"}
    </button>
  );
}
