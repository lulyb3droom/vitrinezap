import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-5xl">🔎</p>
      <h1 className="text-2xl font-bold">Loja não encontrada</h1>
      <p className="text-slate-600">Confira se o link está correto.</p>
      <Link href="/" className="font-semibold text-brand">
        Conhecer o VitrineZap
      </Link>
    </main>
  );
}
