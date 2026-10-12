import Link from "next/link";
import { Camera, MessageCircle, PawPrint, Shirt, Smartphone, Sparkles, Utensils } from "lucide-react";
import { Logo } from "@/components/logo";

const niches = [
  { icon: Utensils, title: "Gastronomia", text: "Docerias, lanchonetes e marmitarias com adicionais, tamanhos e observações por item." },
  { icon: Shirt, title: "Varejo e moda", text: "Brechós e lojas de roupas com variações de tamanho, cor e controle de estoque." },
  { icon: PawPrint, title: "Serviços e artesanato", text: "Pet shops, floristas e presentes com data desejada e dados de entrega." },
];

const cta =
  "inline-flex items-center justify-center rounded-2xl bg-primary-500 font-bold text-stone-900 shadow-sm transition hover:bg-primary-600 active:scale-[0.98]";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-20">
      <header className="flex items-center justify-between py-5">
        <Logo />
        <nav className="flex items-center gap-2 text-sm font-semibold">
          <Link href="/login" className="rounded-xl px-3 py-2 hover:bg-stone-200/60">
            Entrar
          </Link>
          <Link href="/cadastro" className={`${cta} px-4 py-2`}>
            Criar grátis
          </Link>
        </nav>
      </header>

      <section className="py-14 text-center sm:py-20">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-badge px-3 py-1 text-xs font-bold text-stone-800">
          <Sparkles size={14} strokeWidth={1.75} /> Pedidos direto no seu WhatsApp
        </span>
        <h1 className="mx-auto mt-6 max-w-2xl text-balance text-4xl font-extrabold leading-[1.2] tracking-tight sm:text-5xl sm:leading-[1.2]">
          Seu cardápio e catálogo digital,{" "}
          <span className="box-decoration-clone bg-[linear-gradient(transparent_62%,rgb(var(--primary-400))_62%,rgb(var(--primary-400))_92%,transparent_92%)] px-1">
            pronto em minutos
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-stone-600">
          Cadastre seus produtos pelo celular. O cliente abre o link, monta o pedido e você recebe a comanda
          pronta — sem app, sem cadastro.
        </p>
        <Link href="/cadastro" className={`${cta} mt-8 h-14 px-8 text-base`}>
          Criar meu MenuZap grátis
        </Link>
        <p className="mt-3 text-sm text-stone-500">Plano Free com até 10 produtos. Sem cartão.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Camera, t: "Cadastro em 3 minutos", d: "Foto, nome, preço. Pronto." },
          { icon: Smartphone, t: "Feito para o celular", d: "Cliente e lojista com experiência mobile-first." },
          { icon: MessageCircle, t: "Pedido formatado", d: "Comanda organizada chega no seu WhatsApp." },
        ].map(({ icon: Icon, t, d }) => (
          <div key={t} className="rounded-2xl border border-stone-200/80 bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-stone-900">
              <Icon size={20} strokeWidth={1.75} />
            </span>
            <h3 className="mt-3 font-bold">{t}</h3>
            <p className="text-sm text-stone-600">{d}</p>
          </div>
        ))}
      </section>

      <section className="mt-14">
        <h2 className="mb-5 text-center text-2xl font-extrabold tracking-tight">Para o seu tipo de negócio</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {niches.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl bg-stone-900 p-5 text-stone-300">
              <Icon className="text-primary-400" strokeWidth={1.75} />
              <h3 className="mt-3 font-bold text-white">{title}</h3>
              <p className="text-sm">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
