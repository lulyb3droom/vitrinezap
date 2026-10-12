"use server";

import { and, asc, count, desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { categories, products, profiles, orders } from "@/db/schema";
import { requireStore } from "@/lib/session";
import { FREE_PLAN_PRODUCT_LIMIT, onlyDigits } from "@/lib/utils";

export type AdminResult = { error?: string; code?: "PLAN_LIMIT" };

function refresh(slug: string) {
  revalidatePath("/admin", "layout");
  revalidatePath(`/${slug}`);
}

/* ------------------------------- Loja ------------------------------- */

export async function toggleStoreOpen(open: boolean) {
  const store = await requireStore();
  await db.update(profiles).set({ isOpen: open }).where(eq(profiles.id, store.id));
  refresh(store.storeSlug);
}

const settingsSchema = z.object({
  storeName: z.string().trim().min(2, "Informe o nome da loja").max(60),
  whatsapp: z.string().refine((v) => [10, 11].includes(onlyDigits(v).length), "WhatsApp inválido (use DDD + número)"),
  description: z.string().trim().max(300).optional(),
  openingHours: z.string().trim().max(120).optional(),
  themeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida"),
  pixKey: z.string().trim().max(120).optional(),
  logoUrl: z.string().url().nullable().optional(),
  askScheduleDate: z.boolean(),
});

export async function saveSettings(input: z.input<typeof settingsSchema>): Promise<AdminResult> {
  const store = await requireStore();
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  await db
    .update(profiles)
    .set({
      storeName: d.storeName,
      whatsappNumber: onlyDigits(d.whatsapp),
      description: d.description || null,
      openingHours: d.openingHours || null,
      themeColor: d.themeColor,
      pixKey: d.pixKey || null,
      logoUrl: d.logoUrl ?? null,
      askScheduleDate: d.askScheduleDate,
    })
    .where(eq(profiles.id, store.id));
  refresh(store.storeSlug);
  return {};
}

/* ----------------------------- Categorias ----------------------------- */

const nameSchema = z.string().trim().min(1, "Informe um nome").max(40, "Nome muito longo");

export async function createCategory(name: string): Promise<AdminResult> {
  const store = await requireStore();
  const parsed = nameSchema.safeParse(name);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(${categories.sortOrder}), -1)` })
    .from(categories)
    .where(eq(categories.storeId, store.id));
  await db.insert(categories).values({ storeId: store.id, name: parsed.data, sortOrder: Number(max) + 1 });
  refresh(store.storeSlug);
  return {};
}

export async function renameCategory(id: string, name: string): Promise<AdminResult> {
  const store = await requireStore();
  const parsed = nameSchema.safeParse(name);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await db
    .update(categories)
    .set({ name: parsed.data })
    .where(and(eq(categories.id, id), eq(categories.storeId, store.id)));
  refresh(store.storeSlug);
  return {};
}

export async function deleteCategory(id: string) {
  const store = await requireStore();
  await db.delete(categories).where(and(eq(categories.id, id), eq(categories.storeId, store.id)));
  refresh(store.storeSlug);
}

/** Troca a posição da categoria com a vizinha (dir = -1 sobe, 1 desce). */
export async function moveCategory(id: string, dir: -1 | 1) {
  const store = await requireStore();
  const list = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.storeId, store.id))
    .orderBy(asc(categories.sortOrder), asc(categories.createdAt));
  const i = list.findIndex((c) => c.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  await Promise.all(
    list.map((c, idx) =>
      db
        .update(categories)
        .set({ sortOrder: idx })
        .where(and(eq(categories.id, c.id), eq(categories.storeId, store.id))),
    ),
  );
  refresh(store.storeSlug);
}

/* ------------------------------ Produtos ------------------------------ */

const optionGroupSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, "Dê um nome para cada grupo de opções").max(40),
  type: z.enum(["single", "multiple"]),
  required: z.boolean(),
  max: z.number().int().min(0).max(20).optional(),
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().trim().min(1, "Preencha o nome de todas as opções").max(40),
        price: z.number().min(0).max(100000),
      }),
    )
    .min(1, "Cada grupo precisa de ao menos uma opção")
    .max(30),
});

const productSchema = z.object({
  title: z.string().trim().min(1, "Informe o nome do produto").max(80),
  description: z.string().trim().max(400).optional(),
  price: z.number().min(0, "Preço inválido").max(1_000_000),
  imageUrl: z.string().url().nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  stock: z.number().int().min(0).nullable().optional(),
  optionsJson: z.array(optionGroupSchema).max(10),
  badges: z.array(z.enum(["best_seller", "artisanal", "vegan", "promo"])).max(4).default([]),
});

export type ProductInput = z.input<typeof productSchema>;

async function assertCategory(storeId: string, categoryId?: string | null) {
  if (!categoryId) return true;
  const [c] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.storeId, storeId)))
    .limit(1);
  return !!c;
}

export async function saveProduct(id: string | null, input: ProductInput): Promise<AdminResult> {
  const store = await requireStore();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  if (!(await assertCategory(store.id, d.categoryId))) return { error: "Categoria inválida." };

  const values = {
    title: d.title,
    description: d.description || null,
    price: d.price.toFixed(2),
    imageUrl: d.imageUrl ?? null,
    categoryId: d.categoryId ?? null,
    stock: d.stock ?? null,
    optionsJson: d.optionsJson,
    badges: d.badges,
  };

  if (id) {
    await db.update(products).set(values).where(and(eq(products.id, id), eq(products.storeId, store.id)));
  } else {
    if (store.plan === "free") {
      const [{ n }] = await db.select({ n: count() }).from(products).where(eq(products.storeId, store.id));
      if (n >= FREE_PLAN_PRODUCT_LIMIT) return { code: "PLAN_LIMIT", error: "Limite do plano Free atingido." };
    }
    const [{ max }] = await db
      .select({ max: sql<number>`coalesce(max(${products.sortOrder}), -1)` })
      .from(products)
      .where(eq(products.storeId, store.id));
    await db.insert(products).values({ ...values, storeId: store.id, sortOrder: Number(max) + 1 });
  }
  refresh(store.storeSlug);
  return {};
}

export async function toggleProductAvailable(id: string, available: boolean) {
  const store = await requireStore();
  await db
    .update(products)
    .set({ isAvailable: available })
    .where(and(eq(products.id, id), eq(products.storeId, store.id)));
  refresh(store.storeSlug);
}

export async function deleteProduct(id: string) {
  const store = await requireStore();
  await db.delete(products).where(and(eq(products.id, id), eq(products.storeId, store.id)));
  refresh(store.storeSlug);
}

/* ------------------------------- Pedidos ------------------------------ */

export async function completeOrder(id: string) {
  const store = await requireStore();
  await db.update(orders).set({ status: "completed" }).where(and(eq(orders.id, id), eq(orders.storeId, store.id)));
  refresh(store.storeSlug);
}

export async function recentOrders(storeId: string, limit = 8) {
  return db.select().from(orders).where(eq(orders.storeId, storeId)).orderBy(desc(orders.createdAt)).limit(limit);
}
