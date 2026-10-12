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

const DEFAULT_RGB: [number, number, number] = [234, 179, 8];

function parseHex(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return DEFAULT_RGB;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const mix = (a: number[], b: number[], t: number) => a.map((x, i) => Math.round(x + (b[i] - x) * t));
const triplet = (c: number[]) => c.join(" ");

/**
 * Deriva a escala primary-100/400/500/600 e a cor de texto sobre ela a partir da cor da loja,
 * escolhendo grafite ou branco conforme a luminância (contraste legível em qualquer cor).
 */
export function themeVars(hex: string): Record<string, string> {
  const c = parseHex(hex);
  const lum = (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;
  return {
    "--primary-100": triplet(mix(c, [255, 255, 255], 0.85)),
    "--primary-400": triplet(mix(c, [255, 255, 255], 0.2)),
    "--primary-500": triplet(c),
    "--primary-600": triplet(mix(c, [0, 0, 0], 0.2)),
    "--on-primary": lum > 0.5 ? "28 25 23" : "255 255 255",
  };
}
