import { cache } from "react";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, products, profiles } from "@/db/schema";

export const getStoreBySlug = cache(async (slug: string) => {
  const [store] = await db.select().from(profiles).where(eq(profiles.storeSlug, slug.toLowerCase())).limit(1);
  return store ?? null;
});

export async function getCatalog(storeId: string) {
  const [cats, prods] = await Promise.all([
    db.select().from(categories).where(eq(categories.storeId, storeId)).orderBy(asc(categories.sortOrder), asc(categories.createdAt)),
    db.select().from(products).where(eq(products.storeId, storeId)).orderBy(asc(products.sortOrder), asc(products.createdAt)),
  ]);
  return { cats, prods };
}

/** "#16a34a" → "22 163 74" (formato esperado pela variável CSS --brand). */
export function hexToRgbTriplet(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return "22 163 74";
  const n = parseInt(m[1], 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}
