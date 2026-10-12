import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { requireStore } from "@/lib/session";
import { ProductManager } from "@/components/product-manager";

export const metadata = { title: "Produtos — MenuZap" };

export default async function ProdutosPage() {
  const store = await requireStore();
  const [rows, cats] = await Promise.all([
    db.select().from(products).where(eq(products.storeId, store.id)).orderBy(asc(products.sortOrder), asc(products.createdAt)),
    db.select({ id: categories.id, name: categories.name }).from(categories).where(eq(categories.storeId, store.id)).orderBy(asc(categories.sortOrder)),
  ]);

  return (
    <ProductManager
      plan={store.plan}
      categories={cats}
      products={rows.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        price: p.price,
        imageUrl: p.imageUrl,
        isAvailable: p.isAvailable,
        stock: p.stock,
        categoryId: p.categoryId,
        optionsJson: p.optionsJson,
        badges: p.badges ?? [],
      }))}
    />
  );
}
