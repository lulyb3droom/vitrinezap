"use client";

import { useState, useTransition } from "react";
import { Crown, ImageIcon, Pencil, Plus, Trash2, X } from "lucide-react";
import { Alert, Button, Card, Field, Input, Modal, Select, Switch, Textarea } from "@/components/ui";
import { ImageUpload } from "@/components/image-upload";
import { deleteProduct, saveProduct, toggleProductAvailable } from "@/app/actions/admin";
import type { BadgeKey, OptionGroup } from "@/db/schema";
import { BADGES, brl, cn, FREE_PLAN_PRODUCT_LIMIT } from "@/lib/utils";

export type ProductRow = {
  id: string;
  title: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  isAvailable: boolean;
  stock: number | null;
  categoryId: string | null;
  optionsJson: OptionGroup[];
  badges: BadgeKey[];
};
type CategoryRow = { id: string; name: string };

const uid = () => Math.random().toString(36).slice(2, 10);
const parsePrice = (s: string) => Number(s.replace(/\./g, "").replace(",", ".")) || 0;
const parseLoose = (s: string) => Number(s.replace(",", ".")) || 0;

export function ProductManager({
  products,
  categories,
  plan,
}: {
  products: ProductRow[];
  categories: CategoryRow[];
  plan: "free" | "pro";
}) {
  const [editing, setEditing] = useState<ProductRow | "new" | null>(null);
  const [upgrade, setUpgrade] = useState(false);
  const [, start] = useTransition();
  const [optimistic, setOptimistic] = useState<Record<string, boolean>>({});
  const atLimit = plan === "free" && products.length >= FREE_PLAN_PRODUCT_LIMIT;
  const catName = (id: string | null) => categories.find((c) => c.id === id)?.name;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Produtos</h1>
          {plan === "free" && (
            <p className="text-sm text-stone-500">
              {products.length}/{FREE_PLAN_PRODUCT_LIMIT} no plano Free
            </p>
          )}
        </div>
        <Button onClick={() => (atLimit ? setUpgrade(true) : setEditing("new"))}>
          <Plus size={18} /> Novo produto
        </Button>
      </div>

      {products.length === 0 && (
        <Card className="p-8 text-center text-stone-500">
          Nenhum produto ainda. Toque em <b>Novo produto</b> para começar.
        </Card>
      )}

      <div className="space-y-2">
        {products.map((p) => {
          const available = optimistic[p.id] ?? p.isAvailable;
          return (
            <Card key={p.id} className="flex items-center gap-3 p-3">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-stone-100 text-stone-300">
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <ImageIcon />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`truncate font-semibold ${available ? "" : "text-stone-400 line-through"}`}>{p.title}</p>
                <p className="text-sm text-stone-600">
                  {brl(p.price)}
                  {catName(p.categoryId) && <span className="text-stone-400"> · {catName(p.categoryId)}</span>}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <Switch
                    checked={available}
                    label={`${p.title}: disponível`}
                    onChange={(v) => {
                      setOptimistic((o) => ({ ...o, [p.id]: v }));
                      start(() => toggleProductAvailable(p.id, v));
                    }}
                  />
                  <span className="text-xs text-stone-500">{available ? "Disponível" : "Esgotado"}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  aria-label="Editar"
                  className="rounded-lg p-2 text-stone-600 hover:bg-stone-100"
                  onClick={() => setEditing(p)}
                >
                  <Pencil size={18} />
                </button>
                <button
                  aria-label="Excluir"
                  className="rounded-lg p-2 text-stone-400 hover:bg-red-50 hover:text-red-600"
                  onClick={() => {
                    if (confirm(`Excluir "${p.title}"?`)) start(() => deleteProduct(p.id));
                  }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {editing && (
        <ProductForm
          key={editing === "new" ? "new" : editing.id}
          product={editing === "new" ? null : editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onLimit={() => {
            setEditing(null);
            setUpgrade(true);
          }}
        />
      )}

      <Modal open={upgrade} onClose={() => setUpgrade(false)} title="Vamos crescer juntos? 🚀">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <Crown />
          </div>
          <p className="text-stone-700">
            Você chegou ao limite de <b>{FREE_PLAN_PRODUCT_LIMIT} produtos</b> do plano Free. Com o <b>Plano Pro</b> você
            cadastra produtos ilimitados e deixa sua vitrine completa.
          </p>
          <Button size="lg" className="w-full" onClick={() => alert("Em breve: checkout do Plano Pro.")}>
            Quero o Plano Pro
          </Button>
          <button className="text-sm text-stone-500" onClick={() => setUpgrade(false)}>
            Agora não
          </button>
        </div>
      </Modal>
    </div>
  );
}

function ProductForm({
  product,
  categories,
  onClose,
  onLimit,
}: {
  product: ProductRow | null;
  categories: CategoryRow[];
  onClose: () => void;
  onLimit: () => void;
}) {
  const [title, setTitle] = useState(product?.title ?? "");
  const [price, setPrice] = useState(product ? Number(product.price).toFixed(2).replace(".", ",") : "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(product?.imageUrl ?? null);
  const [stock, setStock] = useState(product?.stock != null ? String(product.stock) : "");
  const [groups, setGroups] = useState<OptionGroup[]>(product?.optionsJson ?? []);
  const [badges, setBadges] = useState<BadgeKey[]>(product?.badges ?? []);
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();

  const patchGroup = (id: string, patch: Partial<OptionGroup>) =>
    setGroups((gs) => gs.map((g) => (g.id === id ? { ...g, ...patch } : g)));

  function submit() {
    setError(undefined);
    start(async () => {
      const res = await saveProduct(product?.id ?? null, {
        title,
        description,
        price: parsePrice(price),
        imageUrl,
        categoryId: categoryId || null,
        stock: stock === "" ? null : Math.max(0, Math.floor(Number(stock))),
        badges,
        optionsJson: groups.map((g) => ({ ...g, max: g.type === "multiple" ? g.max ?? 0 : undefined })),
      });
      if (res.code === "PLAN_LIMIT") return onLimit();
      if (res.error) return setError(res.error);
      onClose();
    });
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={product ? "Editar produto" : "Novo produto"}
      footer={
        <div className="space-y-2">
          {error && <Alert>{error}</Alert>}
          <Button size="lg" className="w-full" disabled={pending} onClick={submit}>
            {pending ? "Salvando…" : "Salvar produto"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <ImageUpload value={imageUrl} onChange={setImageUrl} label="Adicionar foto" />
        <Field label="Nome do produto">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Bolo no pote de Ninho" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Preço (R$)">
            <Input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" placeholder="0,00" />
          </Field>
          <Field label="Estoque" hint="Vazio = sem controle">
            <Input value={stock} onChange={(e) => setStock(e.target.value.replace(/\D/g, ""))} inputMode="numeric" />
          </Field>
        </div>
        <Field label="Categoria">
          <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Sem categoria</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-stone-700">Destaques</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(BADGES) as BadgeKey[]).map((k) => {
              const on = badges.includes(k);
              return (
                <button
                  key={k}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setBadges((b) => (on ? b.filter((x) => x !== k) : [...b, k]))}
                  className={cn(
                    "rounded-full border-2 px-3 py-1.5 text-sm font-medium transition",
                    on ? "border-primary-500 bg-accent-badge" : "border-stone-200 bg-white",
                  )}
                >
                  {BADGES[k]}
                </button>
              );
            })}
          </div>
        </div>
        <Field label="Descrição">
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>

        <div className="space-y-3 rounded-2xl bg-stone-50 p-3">
          <div>
            <p className="font-semibold">Opções e adicionais</p>
            <p className="text-xs text-stone-500">
              Tamanho, cor, cobertura, ponto da carne… O cliente escolhe ao adicionar.
            </p>
          </div>
          {groups.map((g) => (
            <div key={g.id} className="space-y-2 rounded-xl border border-stone-200 bg-white p-3">
              <div className="flex gap-2">
                <Input
                  value={g.name}
                  onChange={(e) => patchGroup(g.id, { name: e.target.value })}
                  placeholder="Nome do grupo (ex.: Tamanho)"
                />
                <button
                  aria-label="Remover grupo"
                  className="rounded-lg p-2 text-stone-400 hover:text-red-600"
                  onClick={() => setGroups((gs) => gs.filter((x) => x.id !== g.id))}
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={g.type}
                  onChange={(e) => patchGroup(g.id, { type: e.target.value as OptionGroup["type"] })}
                >
                  <option value="single">Escolher 1</option>
                  <option value="multiple">Escolher vários</option>
                </Select>
                <Select
                  value={g.required ? "1" : "0"}
                  onChange={(e) => patchGroup(g.id, { required: e.target.value === "1" })}
                >
                  <option value="0">Opcional</option>
                  <option value="1">Obrigatório</option>
                </Select>
              </div>
              {g.type === "multiple" && (
                <Field label="Máximo de escolhas" hint="0 = sem limite">
                  <Input
                    value={g.max ?? 0}
                    inputMode="numeric"
                    onChange={(e) => patchGroup(g.id, { max: Number(e.target.value.replace(/\D/g, "")) || 0 })}
                  />
                </Field>
              )}
              {g.items.map((it) => (
                <div key={it.id} className="flex items-center gap-2">
                  <Input
                    value={it.name}
                    placeholder="Opção (ex.: Grande)"
                    onChange={(e) =>
                      patchGroup(g.id, { items: g.items.map((x) => (x.id === it.id ? { ...x, name: e.target.value } : x)) })
                    }
                  />
                  <Input
                    className="w-28"
                    inputMode="decimal"
                    placeholder="+ R$"
                    defaultValue={it.price ? String(it.price).replace(".", ",") : ""}
                    onChange={(e) =>
                      patchGroup(g.id, {
                        items: g.items.map((x) => (x.id === it.id ? { ...x, price: parseLoose(e.target.value) } : x)),
                      })
                    }
                  />
                  <button
                    aria-label="Remover opção"
                    className="p-1 text-stone-400 hover:text-red-600"
                    onClick={() => patchGroup(g.id, { items: g.items.filter((x) => x.id !== it.id) })}
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => patchGroup(g.id, { items: [...g.items, { id: uid(), name: "", price: 0 }] })}
              >
                <Plus size={14} /> Adicionar opção
              </Button>
            </div>
          ))}
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setGroups((gs) => [
                ...gs,
                { id: uid(), name: "", type: "single", required: false, items: [{ id: uid(), name: "", price: 0 }] },
              ])
            }
          >
            <Plus size={14} /> Novo grupo de opções
          </Button>
        </div>
      </div>
    </Modal>
  );
}
