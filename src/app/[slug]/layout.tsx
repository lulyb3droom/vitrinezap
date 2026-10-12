import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStoreBySlug, themeVars } from "@/lib/store-data";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const store = await getStoreBySlug(params.slug);
  if (!store) return { title: "Loja não encontrada" };
  return {
    title: `${store.storeName} — Catálogo`,
    description: store.description ?? `Faça seu pedido na ${store.storeName} pelo WhatsApp.`,
    openGraph: { title: store.storeName, description: store.description ?? undefined, images: store.logoUrl ? [store.logoUrl] : [] },
  };
}

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const store = await getStoreBySlug(params.slug);
  if (!store) notFound();
  return (
    <div style={themeVars(store.themeColor)} className="min-h-dvh">
      {children}
    </div>
  );
}
