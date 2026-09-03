import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Clube Reservas
        </h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          Reserve quadras do clube poliesportivo de forma rapida e simples.
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <Link
          href="/login"
          className="rounded-md bg-zinc-900 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Entrar
        </Link>
        <Link
          href="/cadastro"
          className="rounded-md border border-zinc-300 px-4 py-2.5 text-center text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Criar conta
        </Link>
      </div>
    </main>
  );
}
