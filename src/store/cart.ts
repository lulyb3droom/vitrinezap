"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartOption = { groupId: string; group: string; itemId: string; name: string; price: number };

export type CartItem = {
  key: string; // produto + opções + obs → agrupa linhas idênticas
  productId: string;
  title: string;
  imageUrl?: string | null;
  unitPrice: number;
  qty: number;
  options: CartOption[];
  note?: string;
};

type CartState = {
  storeSlug: string | null;
  items: CartItem[];
  add: (slug: string, item: Omit<CartItem, "key">) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

export const itemKey = (i: Pick<CartItem, "productId" | "options" | "note">) =>
  [i.productId, i.options.map((o) => o.itemId).sort().join("+"), (i.note ?? "").trim()].join("|");

export const lineTotal = (i: CartItem) =>
  (i.unitPrice + i.options.reduce((s, o) => s + o.price, 0)) * i.qty;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      storeSlug: null,
      items: [],
      add: (slug, item) =>
        set((s) => {
          const base = s.storeSlug === slug ? s.items : []; // carrinho é de uma loja só
          const key = itemKey(item);
          const existing = base.find((i) => i.key === key);
          const items = existing
            ? base.map((i) => (i.key === key ? { ...i, qty: i.qty + item.qty } : i))
            : [...base, { ...item, key }];
          return { storeSlug: slug, items };
        }),
      setQty: (key, qty) =>
        set((s) => ({
          items:
            qty <= 0 ? s.items.filter((i) => i.key !== key) : s.items.map((i) => (i.key === key ? { ...i, qty } : i)),
        })),
      remove: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
      clear: () => set({ items: [] }),
    }),
    { name: "vitrinezap-cart", version: 1 },
  ),
);
