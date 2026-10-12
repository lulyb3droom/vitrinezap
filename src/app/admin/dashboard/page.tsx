import Link from "next/link";
import { CheckCircle, ShoppingBag } from "lucide-react";
import { and, count, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { orders, products } from "@/db/schema";
import { requireStore } from "@/lib/session";
import { brl, FREE_PLAN_PRODUCT_LIMIT } from "@/lib/utils";
import { recentOrders } from "@/app/actions/admin";
import { Card } from "@/components/ui";
import { CompleteOrderButton, CopyLink, OpenToggle } from "@/components/dashboard-widgets";

export const metadata = { title: "Início — MenuZap" };

export default async function DashboardPage() {
  const store = await requireStore();

  const startOfDay = sql`(date_trunc('day', now() AT TIME ZONE 'America/Sao_Paulo') AT TIME ZONE 'America/Sao_Paulo')`;
  const [[today], [{ n: productCount }], recent] = await Promise.all([
    db
      .select({ n: count(), total: sql<string>`coalesce(sum(${orders.totalAmount}), 0)` })
      .from(orders)
      .where(and(eq(orders.storeId, store.id), sql`${orders.createdAt} >= ${startOfDay}`)),
    db.select({ n: count() }).from(products).where(eq(products.storeId, store.id)),
    recentOrders(store.id),
  ]);

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <OpenToggle initial={store.isOpen} />
      </Card>

      <Card className="space-y-3 p-4">
        <p className="font-semibold">Link da sua loja</p>
        <CopyLink path={`/${store.storeSlug}`} />
        <p className="text-xs text-stone-500">Divulgue na bio do Instagram, status e grupos do WhatsApp.</p>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="border-l-4 border-l-primary-500 p-4">
          <p className="flex items-center gap-1.5 text-sm text-stone-500">
            <ShoppingBag size={15} strokeWidth={1.75} /> Pedidos hoje
          </p>
          <p className="text-3xl font-extrabold">{today.n}</p>
        </Card>
        <Card className="border-l-4 border-l-primary-500 p-4">
          <p className="flex items-center gap-1.5 text-sm text-stone-500">
            <CheckCircle size={15} strokeWidth={1.75} /> Vendido hoje
          </p>
          <p className="text-3xl font-extrabold">{brl(today.total)}</p>
        </Card>
      </div>

      {store.plan === "free" && (
        <Card className="flex items-center justify-between gap-3 p-4">
          <div>
            <p className="font-semibold">
              {productCount}/{FREE_PLAN_PRODUCT_LIMIT} produtos no plano Free
            </p>
            <div className="mt-2 h-2 w-40 overflow-hidden rounded-full bg-stone-100">
              <div
                className="h-full rounded-full bg-brand"
                style={{ width: `${Math.min(100, (productCount / FREE_PLAN_PRODUCT_LIMIT) * 100)}%` }}
              />
            </div>
          </div>
          <Link href="/admin/produtos" className="text-sm font-semibold text-stone-900 underline decoration-primary-500 decoration-2 underline-offset-4">
            Gerenciar
          </Link>
        </Card>
      )}

      <section>
        <h2 className="mb-2 font-bold">Últimos pedidos</h2>
        {recent.length === 0 ? (
          <Card className="p-6 text-center text-sm text-stone-500">
            Nenhum pedido ainda. Compartilhe o link da loja para receber o primeiro!
          </Card>
        ) : (
          <div className="space-y-2">
            {recent.map((o) => (
              <Card key={o.id} className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    #{o.id.slice(0, 6).toUpperCase()} · {o.customerName}
                  </p>
                  <p className="text-sm text-stone-500">
                    {brl(o.totalAmount)} · {o.deliveryType === "entrega" ? "Entrega" : "Retirada"} ·{" "}
                    {o.createdAt.toLocaleString("pt-BR", {
                      timeZone: "America/Sao_Paulo",
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {o.status === "pending" ? (
                  <CompleteOrderButton id={o.id} />
                ) : (
                  <span className="text-xs font-semibold text-stone-400">Concluído</span>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
