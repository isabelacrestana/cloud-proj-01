"use client";

type Props = {
  id: string;
  tipo?: string;
  placeholder: string;
  valor: string;
  aoAlterar: (valor: string) => void;
  icone: "email" | "senha" | "usuario" | "telefone";
  autoComplete?: string;
  obrigatorio?: boolean;
};

const icones = {
  email: "M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  senha: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  usuario: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  telefone: "M3 5a2 2 0 012-2h3.28a1 1 0 01.95.68l1.5 4.5a1 1 0 01-.5 1.21l-2.26 1.13a11 11 0 005.5 5.5l1.13-2.26a1 1 0 011.21-.5l4.5 1.5a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.72 21 3 14.28 3 6V5z",
};

export function Campo({
  id,
  tipo = "text",
  placeholder,
  valor,
  aoAlterar,
  icone,
  autoComplete,
  obrigatorio = true,
}: Props) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a6d3b]">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d={icones[icone]} />
        </svg>
      </span>
      <input
        id={id}
        name={id}
        type={tipo}
        value={valor}
        onChange={(e) => aoAlterar(e.target.value)}
        placeholder={placeholder}
        required={obrigatorio}
        autoComplete={autoComplete}
        aria-label={placeholder}
        className="w-full rounded-xl border border-[#b08d57] bg-transparent py-3 pl-11 pr-4 text-sm text-[#1a3a52] outline-none transition placeholder:text-[#9c8464] focus:border-[#0b1a2b] focus:ring-1 focus:ring-[#0b1a2b]"
      />
    </div>
  );
}
