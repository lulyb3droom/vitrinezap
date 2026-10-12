"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowLeft, Banknote, CreditCard, MapPin, Minus, Plus, QrCode, Store, Trash2 } from "lucide-react";
import { Alert, Button, Card, Field, Input, Textarea } from "@/components/ui";
import { useHydrated } from "@/components/storefront";
import { createOrder } from "@/app/actions/orders";
import { lineTotal, useCart } from "@/store/cart";
import { brl, cn, formatPhone } from "@/lib/utils";

type StoreInfo = { slug: string; name: string; isOpen: boolean; hasPix: boolean; askScheduleDate: boolean };

function Choice({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Store;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex flex-1 items-center justify-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-semibold transition",
        active ? "border-primary-500 bg-primary-100 text-stone-900" : "border-stone-200 text-stone-700",
      )}
    >
      <Icon size={18} /> {children}
    </button>
  );
}

export function CheckoutForm({ store }: { store: StoreInfo }) {
  const hydrated = useHydrated();
  const cart = useCart();
  const items = hydrated && cart.storeSlug === store.slug ? cart.items : [];
  const subtotal = items.reduce((s, i) => s + lineTotal(i), 0);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [delivery, setDelivery] = useState<"retirada" | "entrega">("retirada");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [district, setDistrict] = useState("");
  const [complement, setComplement] = useState("");
  const [payment, setPayment] = useState<"pix" | "cartao" | "dinheiro">("pix");
  const [changeFor, setChangeFor] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    start(async () => {
      const res = await createOrder({
        slug: store.slug,
        customerName: name,
        customerPhone: phone || undefined,
        deliveryType: delivery,
        street,
        number,
        district,
        complement,
        payment,
        changeFor: payment === "dinheiro" ? changeFor : undefined,
        scheduledFor: scheduledFor || undefined,
        notes: notes || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          qty: i.qty,
          optionItemIds: i.options.map((o) => o.itemId),
          note: i.note,
        })),
      });
      if (res.error || !res.url) return setError(res.error ?? "Não foi possível enviar o pedido.");
      cart.clear();
      window.location.href = res.url; // abre o WhatsApp (app no mobile, web no desktop)
    });
  }

  if (hydrated && items.length === 0) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-5xl">🛒</p>
        <h1 className="text-xl font-bold">Seu carrinho está vazio</h1>
        <Link href={`/${store.slug}`} className="rounded-xl bg-brand px-5 py-3 font-semibold text-on-brand">
          Ver catálogo
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-4 pb-32 pt-4">
      <Link href={`/${store.slug}`} className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-stone-600">
        <ArrowLeft size={16} /> {store.name}
      </Link>
      <h1 className="mb-4 text-2xl font-extrabold">Finalizar pedido</h1>

      <form onSubmit={submit} className="space-y-5">
        <Card className="divide-y divide-stone-100">
          {items.map((i) => (
            <div key={i.key} className="flex gap-3 p-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{i.title}</p>
                {i.options.length > 0 && (
                  <p className="text-sm text-stone-500">{i.options.map((o) => o.name).join(", ")}</p>
                )}
                {i.note && <p className="text-sm italic text-stone-500">Obs: {i.note}</p>}
                <div className="mt-2 flex items-center gap-2">
                  <button type="button" aria-label="Diminuir" className="rounded-lg border border-stone-300 p-1.5" onClick={() => cart.setQty(i.key, i.qty - 1)}>
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center font-bold">{i.qty}</span>
                  <button type="button" aria-label="Aumentar" className="rounded-lg border border-stone-300 p-1.5" onClick={() => cart.setQty(i.key, i.qty + 1)}>
                    <Plus size={14} />
                  </button>
                  <button type="button" aria-label="Remover" className="ml-1 p-1.5 text-stone-400 hover:text-red-600" onClick={() => cart.remove(i.key)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="font-bold">{brl(lineTotal(i))}</p>
            </div>
          ))}
          <div className="flex justify-between p-3 text-lg font-extrabold">
            <span>Subtotal</span>
            <span>{brl(subtotal)}</span>
          </div>
        </Card>

        <Card className="space-y-4 p-4">
          <Field label="Seu nome">
            <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required minLength={2} />
          </Field>
          <Field label="Seu WhatsApp (opcional)">
            <Input
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              inputMode="tel"
              autoComplete="tel"
              placeholder="(16) 99999-9999"
            />
          </Field>
          {store.askScheduleDate && (
            <Field label="Para quando você quer?" hint="Data e horário desejados.">
              <Input value={scheduledFor} onChange={(e) => setScheduledFor(e.target.value)} placeholder="Ex.: 15/11 às 14h" required />
            </Field>
          )}
        </Card>

        <Card className="space-y-4 p-4">
          <p className="font-semibold">Como você quer receber?</p>
          <div className="flex gap-2">
            <Choice active={delivery === "retirada"} onClick={() => setDelivery("retirada")} icon={Store}>
              Retirada
            </Choice>
            <Choice active={delivery === "entrega"} onClick={() => setDelivery("entrega")} icon={MapPin}>
              Entrega
            </Choice>
          </div>
          {delivery === "entrega" && (
            <div className="space-y-3">
              <Field label="Rua">
                <Input value={street} onChange={(e) => setStreet(e.target.value)} autoComplete="address-line1" required />
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Número">
                  <Input value={number} onChange={(e) => setNumber(e.target.value)} required />
                </Field>
                <Field label="Bairro" className="col-span-2">
                  <Input value={district} onChange={(e) => setDistrict(e.target.value)} required />
                </Field>
              </div>
              <Field label="Complemento (opcional)">
                <Input value={complement} onChange={(e) => setComplement(e.target.value)} placeholder="Apto, bloco, referência…" />
              </Field>
            </div>
          )}
        </Card>

        <Card className="space-y-4 p-4">
          <p className="font-semibold">Forma de pagamento</p>
          <div className="flex flex-wrap gap-2">
            <Choice active={payment === "pix"} onClick={() => setPayment("pix")} icon={QrCode}>
              Pix
            </Choice>
            <Choice active={payment === "cartao"} onClick={() => setPayment("cartao")} icon={CreditCard}>
              Cartão na entrega
            </Choice>
            <Choice active={payment === "dinheiro"} onClick={() => setPayment("dinheiro")} icon={Banknote}>
              Dinheiro
            </Choice>
          </div>
          {payment === "pix" && (
            <p className="rounded-xl bg-stone-50 p-3 text-sm text-stone-600">
              {store.hasPix
                ? "A chave Pix da loja será enviada junto com o pedido no WhatsApp."
                : "A loja vai te passar a chave Pix pelo WhatsApp."}
            </p>
          )}
          {payment === "dinheiro" && (
            <Field label="Troco para quanto? (opcional)">
              <Input value={changeFor} onChange={(e) => setChangeFor(e.target.value)} inputMode="decimal" placeholder="Ex.: 50,00" />
            </Field>
          )}
        </Card>

        <Field label="Observações do pedido (opcional)">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} />
        </Field>

        {!store.isOpen && <Alert tone="info">A loja está fechada no momento e não está recebendo pedidos.</Alert>}
        {error && <Alert>{error}</Alert>}

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto flex max-w-xl items-center gap-3">
            <div className="shrink-0">
              <p className="text-xs text-stone-500">Total</p>
              <p className="text-xl font-extrabold">{brl(subtotal)}</p>
            </div>
            <Button type="submit" size="lg" className="flex-1 !bg-success-zap !text-white hover:!brightness-95" disabled={pending || !store.isOpen || !items.length}>
              {pending ? "Enviando…" : "Enviar Pedido via WhatsApp"}
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}
