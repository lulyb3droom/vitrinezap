import { notFound } from "next/navigation";
import { getCatalog, getStoreBySlug } from "@/lib/store-data";
import { Storefront } from "@/components/storefront";

export const revalidate = 30;

export default async function StorePage({ params }: { params: { slug: string } }) {
  const store = await getStoreBySlug(params.slug);
  if (!store) notFound();
  const { cats, prods } = await getCatalog(store.id);

  return (
    <Storefront
      store={{
        slug: store.storeSlug,
        name: store.storeName,
        description: store.description,
        logoUrl: store.logoUrl,
        isOpen: store.isOpen,
        openingHours: store.openingHours,
      }}
      categories={cats.map((c) => ({ id: c.id, name: c.name }))}
      products={prods.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        price: Number(p.price),
        imageUrl: p.imageUrl,
        categoryId: p.categoryId,
        available: p.isAvailable && (p.stock === null || p.stock > 0),
        optionsJson: p.optionsJson,
      }))}
    />
  );
}
