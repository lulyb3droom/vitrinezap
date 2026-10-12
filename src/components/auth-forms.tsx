"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Alert, Button, Card, Field, Input } from "@/components/ui";
import { loginAction, registerAction } from "@/app/actions/auth";
import { Logo } from "@/components/logo";
import { formatPhone, slugify } from "@/lib/utils";

function Shell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <Link href="/" className="mb-6 flex justify-center" aria-label="MenuZap">
        <Logo className="text-2xl" />
      </Link>
      <Card className="p-6">
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="mb-5 mt-1 text-sm text-stone-500">{subtitle}</p>
        {children}
      </Card>
    </main>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();

  return (
    <Shell title="Entrar" subtitle="Acesse o painel da sua loja.">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          setError(undefined);
          start(async () => {
            const res = await loginAction({ email: String(f.get("email")), password: String(f.get("password")), next });
            if (res?.error) setError(res.error);
          });
        }}
      >
        <Field label="E-mail">
          <Input name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="Senha">
          <Input name="password" type="password" autoComplete="current-password" required />
        </Field>
        {error && <Alert>{error}</Alert>}
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Entrando…" : "Entrar"}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-stone-600">
        Ainda não tem loja?{" "}
        <Link href="/cadastro" className="font-semibold text-stone-900 underline decoration-primary-500 decoration-2 underline-offset-4">
          Criar grátis
        </Link>
      </p>
    </Shell>
  );
}

export function RegisterForm() {
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [phone, setPhone] = useState("");

  return (
    <Shell title="Crie sua loja" subtitle="Leva menos de 3 minutos. Sem cartão de crédito.">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          setError(undefined);
          start(async () => {
            const res = await registerAction({
              storeName: name,
              slug,
              whatsapp: phone,
              email: String(f.get("email")),
              password: String(f.get("password")),
            });
            if (res?.error) setError(res.error);
          });
        }}
      >
        <Field label="Nome da loja">
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            placeholder="Ex.: Doces da Ana"
            required
          />
        </Field>
        <Field label="Link da loja" hint="É o endereço que você vai divulgar para seus clientes.">
          <div className="flex items-center rounded-xl border border-stone-300 bg-white pl-3 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/25">
            <span className="text-sm text-stone-400">menuzap.com/</span>
            <input
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              className="h-11 min-w-0 flex-1 bg-transparent px-1 text-base outline-none"
              required
            />
          </div>
        </Field>
        <Field label="WhatsApp que recebe os pedidos" hint="Com DDD.">
          <Input
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            inputMode="tel"
            placeholder="(16) 99999-9999"
            required
          />
        </Field>
        <Field label="E-mail">
          <Input name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="Senha" hint="Mínimo de 8 caracteres.">
          <Input name="password" type="password" autoComplete="new-password" minLength={8} required />
        </Field>
        {error && <Alert>{error}</Alert>}
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Criando…" : "Criar minha loja"}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-stone-600">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-stone-900 underline decoration-primary-500 decoration-2 underline-offset-4">
          Entrar
        </Link>
      </p>
    </Shell>
  );
}
