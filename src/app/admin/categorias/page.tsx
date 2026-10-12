import { asc, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { requireStore } from "@/lib/session";
import { CategoryManager } from "@/components/category-manager";

export const metadata = { title: "Categorias — MenuZap" };

export default async function CategoriasPage() {
  const store = await requireStore();
  const [cats, counts] = await Promise.all([
    db.select().from(categories).where(eq(categories.storeId, store.id)).orderBy(asc(categories.sortOrder), asc(categories.createdAt)),
    db
      .select({ id: products.categoryId, n: count() })
      .from(products)
      .where(eq(products.storeId, store.id))
      .groupBy(products.categoryId),
  ]);
  const byCat = new Map(counts.map((c) => [c.id, c.n]));
  return <CategoryManager categories={cats.map((c) => ({ id: c.id, name: c.name, productCount: byCat.get(c.id) ?? 0 }))} />;
}
