"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Clock, ImageIcon, Minus, Plus, ShoppingBag, Store } from "lucide-react";
import { Button, Modal, Textarea } from "@/components/ui";
import { lineTotal, useCart, type CartOption } from "@/store/cart";
import type { BadgeKey, OptionGroup } from "@/db/schema";
import { BADGES, brl, cn } from "@/lib/utils";

type StoreInfo = {
  slug: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  isOpen: boolean;
  openingHours: string | null;
};
type Cat = { id: string; name: string };
type Prod = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  categoryId: string | null;
  available: boolean;
  optionsJson: OptionGroup[];
  badges: BadgeKey[];
};

export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}

export function Storefront({ store, categories, products }: { store: StoreInfo; categories: Cat[]; products: Prod[] }) {
  const [selected, setSelected] = useState<Prod | null>(null);
  const [activeCat, setActiveCat] = useState<string>(categories[0]?.id ?? "none");
  const hydrated = useHydrated();
  const cart = useCart();
  const mine = hydrated && cart.storeSlug === store.slug ? cart.items : [];
  const qty = mine.reduce((s, i) => s + i.qty, 0);
  const subtotal = mine.reduce((s, i) => s + lineTotal(i), 0);
  const chipsRef = useRef<HTMLDivElement>(null);

  const sections = useMemo(() => {
    const list = categories
      .map((c) => ({ id: c.id, name: c.name, items: products.filter((p) => p.categoryId === c.id) }))
      .filter((s) => s.items.length);
    const loose = products.filter((p) => !p.categoryId || !categories.some((c) => c.id === p.categoryId));
    if (loose.length) list.push({ id: "none", name: list.length ? "Outros" : "Produtos", items: loose });
    return list;
  }, [categories, products]);

  // destaca o chip da seção visível
  useEffect(() => {
    const els = sections.map((s) => document.getElementById(`cat-${s.id}`)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (vis) setActiveCat(vis.target.id.replace("cat-", ""));
      },
      { rootMargin: "-120px 0px -65% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  useEffect(() => {
    chipsRef.current?.querySelector<HTMLElement>(`[data-chip="${activeCat}"]`)?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [activeCat]);

  return (
    <div className="mx-auto min-h-dvh max-w-5xl bg-canvas pb-28">
      <header className="relative">
        <div className="h-28 bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 sm:h-40" />
        <div className="-mt-12 flex items-end gap-4 px-4">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-stone-100 text-stone-400 shadow-lg ring-4 ring-white">
            {store.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={store.logoUrl} alt={`Logo ${store.name}`} className="h-full w-full object-cover" />
            ) : (
              <Store size={36} />
            )}
          </div>
          <span
            className={cn(
              "mb-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
              store.isOpen ? "bg-green-100 text-green-700" : "bg-stone-200 text-stone-600",
            )}
          >
            <span className={cn("h-2 w-2 rounded-full", store.isOpen ? "animate-pulse bg-green-500" : "bg-stone-400")} />
            {store.isOpen ? "Aberto agora" : "Fechado"}
          </span>
        </div>
        <div className="px-4 pb-4 pt-3">
          <h1 className="text-2xl font-extrabold tracking-tight">{store.name}</h1>
          {store.description && <p className="mt-1 text-stone-600">{store.description}</p>}
          {store.openingHours && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-stone-500">
              <Clock size={15} /> {store.openingHours}
            </p>
          )}
          {!store.isOpen && (
            <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Estamos fechados agora. Você pode olhar o catálogo, mas os pedidos só podem ser enviados quando abrirmos.
            </p>
          )}
        </div>
      </header>

      {sections.length > 1 && (
        <nav
          aria-label="Categorias"
          className="sticky top-0 z-30 border-y border-stone-200/70 bg-canvas/90 backdrop-blur-md"
        >
          <div ref={chipsRef} className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3">
            {sections.map((s) => (
              <button
                key={s.id}
                data-chip={s.id}
                onClick={() => document.getElementById(`cat-${s.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition",
                  activeCat === s.id
                    ? "bg-primary-500 font-semibold text-on-brand shadow-sm"
                    : "bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-stone-100",
                )}
              >
                {s.name}
              </button>
            ))}
          </div>
        </nav>
      )}

      <main className="space-y-8 px-4 py-6">
        {sections.length === 0 && (
          <p className="py-16 text-center text-stone-500">Esta loja ainda não cadastrou produtos.</p>
        )}
        {sections.map((s) => (
          <section key={s.id} id={`cat-${s.id}`} className="scroll-mt-20">
            <h2 className="mb-4 text-xl font-extrabold tracking-tight">{s.name}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {s.items.map((p) => (
                <ProductCard key={p.id} p={p} onOpen={() => setSelected(p)} />
              ))}
            </div>
          </section>
        ))}
      </main>

      {qty > 0 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Link
            href={`/${store.slug}/checkout`}
            className="pointer-events-auto flex w-full max-w-md items-center justify-between rounded-2xl bg-primary-500 px-5 py-4 font-bold text-on-brand shadow-xl ring-1 ring-black/5 transition hover:bg-primary-600 active:scale-[0.99]"
          >
            <span className="relative flex items-center gap-2">
              <ShoppingBag />
              <span className="absolute -right-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-stone-900 px-1 text-xs font-extrabold text-white">
                {qty}
              </span>
              <span className="ml-3">Ver carrinho</span>
            </span>
            <span>{brl(subtotal)}</span>
          </Link>
        </div>
      )}

      {selected && <ProductSheet key={selected.id} slug={store.slug} product={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function ProductCard({ p, onOpen }: { p: Prod; onOpen: () => void }) {
  return (
    <article
      className={cn(
        "group flex gap-3 overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg sm:flex-col sm:p-3",
        !p.available && "opacity-60 hover:translate-y-0 hover:shadow-none",
      )}
    >
      <div className="relative aspect-[4/3] w-32 shrink-0 overflow-hidden rounded-xl bg-stone-100 sm:w-full">
        {p.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.imageUrl} alt={p.title} loading="lazy" decoding="async" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-stone-300">
            <ImageIcon size={32} strokeWidth={1.75} />
          </div>
        )}
        {!p.available && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-xs font-bold uppercase text-stone-700">
            Esgotado
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          {p.badges.length > 0 && (
            <div className="mb-1.5 flex flex-wrap gap-1">
              {p.badges.map((b) => (
                <span key={b} className="rounded-full bg-accent-badge px-2 py-0.5 text-[11px] font-semibold text-stone-800">
                  {BADGES[b]}
                </span>
              ))}
            </div>
          )}
          <h3 className="font-semibold leading-snug">{p.title}</h3>
          {p.description && <p className="mt-0.5 line-clamp-2 text-sm text-stone-500">{p.description}</p>}
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-lg font-bold text-stone-900">{brl(p.price)}</p>
          <button
            disabled={!p.available}
            onClick={onOpen}
            aria-label={`Adicionar ${p.title}`}
            className="flex h-10 items-center gap-1 rounded-xl bg-primary-100 px-3 text-sm font-semibold text-stone-900 transition-colors hover:bg-primary-500 hover:text-on-brand disabled:pointer-events-none"
          >
            <Plus size={18} strokeWidth={2} /> Adicionar
          </button>
        </div>
      </div>
    </article>
  );
}

function ProductSheet({ slug, product: p, onClose }: { slug: string; product: Prod; onClose: () => void }) {
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [picked, setPicked] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string>();

  const toggle = (g: OptionGroup, itemId: string) =>
    setPicked((cur) => {
      const now = cur[g.id] ?? [];
      if (g.type === "single") return { ...cur, [g.id]: [itemId] };
      if (now.includes(itemId)) return { ...cur, [g.id]: now.filter((x) => x !== itemId) };
      if (g.max && now.length >= g.max) return cur;
      return { ...cur, [g.id]: [...now, itemId] };
    });

  const options: CartOption[] = p.optionsJson.flatMap((g) =>
    g.items
      .filter((it) => (picked[g.id] ?? []).includes(it.id))
      .map((it) => ({ groupId: g.id, group: g.name, itemId: it.id, name: it.name, price: it.price })),
  );
  const unit = p.price + options.reduce((s, o) => s + o.price, 0);

  function confirm() {
    const missing = p.optionsJson.find((g) => g.required && !(picked[g.id]?.length));
    if (missing) return setError(`Escolha uma opção em "${missing.name}".`);
    add(slug, { productId: p.id, title: p.title, imageUrl: p.imageUrl, unitPrice: p.price, qty, options, note: note.trim() || undefined });
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={p.title}
      footer={
        <div className="space-y-2">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-xl border border-stone-300">
              <button aria-label="Diminuir" className="p-3" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                <Minus size={18} strokeWidth={1.75} />
              </button>
              <span className="w-8 text-center font-bold">{qty}</span>
              <button aria-label="Aumentar" className="p-3" onClick={() => setQty((q) => Math.min(99, q + 1))}>
                <Plus size={18} strokeWidth={1.75} />
              </button>
            </div>
            <Button size="lg" className="flex-1" onClick={confirm}>
              Adicionar · {brl(unit * qty)}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {p.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.imageUrl} alt={p.title} className="h-52 w-full rounded-2xl object-cover" />
        )}
        {p.description && <p className="text-stone-600">{p.description}</p>}

        {p.optionsJson.map((g) => (
          <fieldset key={g.id} className="space-y-2">
            <legend className="flex w-full items-center justify-between font-semibold">
              <span>{g.name}</span>
              <span className="text-xs font-medium text-stone-500">
                {g.required ? "Obrigatório" : "Opcional"}
                {g.type === "multiple" && g.max ? ` · até ${g.max}` : ""}
              </span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {g.items.map((it) => {
                const on = (picked[g.id] ?? []).includes(it.id);
                return (
                  <label key={it.id} className="cursor-pointer">
                    <input
                      type={g.type === "single" ? "radio" : "checkbox"}
                      name={g.id}
                      checked={on}
                      onChange={() => {
                        setError(undefined);
                        toggle(g, it.id);
                      }}
                      className="peer sr-only"
                    />
                    <span className="flex items-center gap-2 rounded-xl border-2 border-stone-200 bg-white px-3.5 py-2.5 text-sm font-medium transition peer-checked:border-primary-500 peer-checked:bg-primary-100 peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500">
                      {it.name}
                      {it.price > 0 && <span className="text-xs text-stone-500">+ {brl(it.price)}</span>}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}

        <div>
          <label className="mb-1.5 block text-sm font-semibold" htmlFor="note">
            Observações
          </label>
          <Textarea
            id="note"
            value={note}
            maxLength={200}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex.: sem granulado, ponto da carne bem passado…"
          />
        </div>
      </div>
    </Modal>
  );
}
