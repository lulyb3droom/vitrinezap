import Link from "next/link";
import { Camera, MessageCircle, Smartphone, UtensilsCrossed, Shirt, PawPrint } from "lucide-react";

const niches = [
  { icon: UtensilsCrossed, title: "Gastronomia", text: "Docerias, lanchonetes e marmitarias com adicionais, tamanhos e observações por item." },
  { icon: Shirt, title: "Varejo e moda", text: "Brechós e lojas de roupas com variações de tamanho, cor e controle de estoque." },
  { icon: PawPrint, title: "Serviços e artesanato", text: "Pet shops, floristas e presentes com data desejada e dados de entrega." },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-20">
      <header className="flex items-center justify-between py-5">
        <span className="text-xl font-extrabold text-brand">
          Vitrine<span className="text-slate-900">Zap</span>
        </span>
        <nav className="flex items-center gap-2 text-sm font-semibold">
          <Link href="/login" className="rounded-xl px-3 py-2 hover:bg-slate-100">Entrar</Link>
          <Link href="/cadastro" className="rounded-xl bg-brand px-4 py-2 text-white">Criar grátis</Link>
        </nav>
      </header>

      <section className="py-14 text-center sm:py-20">
        <h1 className="mx-auto max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          Seu catálogo digital com pedido direto no <span className="text-brand">WhatsApp</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
          Cadastre seus produtos pelo celular em minutos. O cliente abre o link, monta o pedido e você recebe a comanda
          pronta — sem app, sem cadastro.
        </p>
        <Link href="/cadastro" className="mt-8 inline-flex h-14 items-center rounded-2xl bg-brand px-8 text-base font-bold text-white shadow-lg">
          Criar minha vitrine grátis
        </Link>
        <p className="mt-3 text-sm text-slate-500">Plano Free com até 10 produtos. Sem cartão.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Camera, t: "Cadastro em 3 minutos", d: "Foto, nome, preço. Pronto." },
          { icon: Smartphone, t: "Feito para o celular", d: "Cliente e lojista com experiência mobile-first." },
          { icon: MessageCircle, t: "Pedido formatado", d: "Comanda organizada chega no seu WhatsApp." },
        ].map(({ icon: Icon, t, d }) => (
          <div key={t} className="rounded-2xl border border-slate-200 bg-white p-5">
            <Icon className="text-brand" />
            <h3 className="mt-3 font-bold">{t}</h3>
            <p className="text-sm text-slate-600">{d}</p>
          </div>
        ))}
      </section>

      <section className="mt-14">
        <h2 className="mb-5 text-center text-2xl font-bold">Para o seu tipo de negócio</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {niches.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <Icon className="text-brand" />
              <h3 className="mt-3 font-bold">{title}</h3>
              <p className="text-sm text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
