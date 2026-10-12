import { notFound } from "next/navigation";
import { getStoreBySlug } from "@/lib/store-data";
import { CheckoutForm } from "@/components/checkout-form";

export const metadata = { title: "Finalizar pedido" };

export default async function CheckoutPage({ params }: { params: { slug: string } }) {
  const store = await getStoreBySlug(params.slug);
  if (!store) notFound();
  return (
    <CheckoutForm
      store={{
        slug: store.storeSlug,
        name: store.storeName,
        isOpen: store.isOpen,
        hasPix: !!store.pixKey,
        askScheduleDate: store.askScheduleDate,
      }}
    />
  );
}
