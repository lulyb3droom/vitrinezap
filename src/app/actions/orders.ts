"use server";

import { and, count, eq, gte, inArray, isNotNull, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { orders, products, profiles, type OrderItemSummary } from "@/db/schema";
import { buildWhatsAppMessage, whatsappUrl } from "@/lib/whatsapp";
import { money, onlyDigits } from "@/lib/utils";

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX_ORDERS = 40;

const PAYMENTS = ["pix", "cartao", "dinheiro"] as const;

const orderSchema = z.object({
  slug: z.string().min(1),
  customerName: z.string().trim().min(2, "Informe seu nome").max(80),
  customerPhone: z.string().optional(),
  deliveryType: z.enum(["entrega", "retirada"]),
  street: z.string().trim().max(120).optional(),
  number: z.string().trim().max(20).optional(),
  district: z.string().trim().max(80).optional(),
  complement: z.string().trim().max(120).optional(),
  payment: z.enum(PAYMENTS),
  changeFor: z.string().trim().max(20).optional(),
  scheduledFor: z.string().trim().max(80).optional(),
  notes: z.string().trim().max(500).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        qty: z.number().int().min(1).max(99),
        optionItemIds: z.array(z.string()).max(60),
        note: z.string().trim().max(200).optional(),
      }),
    )
    .min(1, "Seu carrinho está vazio")
    .max(60),
});

export type CreateOrderInput = z.input<typeof orderSchema>;
export type CreateOrderResult = { error?: string; url?: string };

/**
 * Cria o pedido recalculando TODOS os preços a partir do banco
 * (nunca confia no valor enviado pelo cliente) e devolve o link do WhatsApp.
 */
export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;

  const [store] = await db.select().from(profiles).where(eq(profiles.storeSlug, d.slug)).limit(1);
  if (!store) return { error: "Loja não encontrada." };
  if (!store.isOpen) return { error: "A loja está fechada no momento." };

  // Proteção básica contra spam/abuso: teto de pedidos por loja em janela curta.
  const since = new Date(Date.now() - RATE_WINDOW_MS);
  const [{ recent }] = await db
    .select({ recent: count() })
    .from(orders)
    .where(and(eq(orders.storeId, store.id), gte(orders.createdAt, since)));
  if (recent >= RATE_MAX_ORDERS) return { error: "Muitos pedidos em pouco tempo. Tente novamente em alguns minutos." };

  if (d.deliveryType === "entrega" && (!d.street || !d.number || !d.district))
    return { error: "Preencha rua, número e bairro para a entrega." };
  if (d.customerPhone && ![10, 11].includes(onlyDigits(d.customerPhone).length))
    return { error: "Telefone inválido (use DDD + número)." };
  if (store.askScheduleDate && !d.scheduledFor) return { error: "Informe para quando você deseja o pedido." };

  const ids = [...new Set(d.items.map((i) => i.productId))];
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.storeId, store.id), inArray(products.id, ids)));
  const byId = new Map(rows.map((p) => [p.id, p]));

  const summary: OrderItemSummary[] = [];
  const qtyByProduct = new Map<string, number>();
  let total = 0;

  for (const line of d.items) {
    const p = byId.get(line.productId);
    if (!p || !p.isAvailable) return { error: "Um dos itens não está mais disponível. Atualize o carrinho." };

    qtyByProduct.set(p.id, (qtyByProduct.get(p.id) ?? 0) + line.qty);
    if (p.stock !== null && qtyByProduct.get(p.id)! > p.stock)
      return { error: `Só temos ${p.stock} unidade(s) de "${p.title}" em estoque.` };

    const chosen = new Set(line.optionItemIds);
    const options: OrderItemSummary["options"] = [];
    for (const g of p.optionsJson) {
      const picked = g.items.filter((it) => chosen.has(it.id));
      if (g.required && picked.length === 0) return { error: `Escolha uma opção em "${g.name}" (${p.title}).` };
      if (g.type === "single" && picked.length > 1) return { error: `Escolha apenas uma opção em "${g.name}".` };
      if (g.type === "multiple" && g.max && picked.length > g.max)
        return { error: `Máximo de ${g.max} opções em "${g.name}".` };
      for (const it of picked) options.push({ group: g.name, name: it.name, price: money(it.price) });
    }

    const unitPrice = money(p.price);
    total += (unitPrice + options.reduce((s, o) => s + o.price, 0)) * line.qty;
    summary.push({ productId: p.id, title: p.title, qty: line.qty, unitPrice, options, note: line.note || undefined });
  }
  total = money(total);

  const address =
    d.deliveryType === "entrega"
      ? `${d.street}, ${d.number} - ${d.district}${d.complement ? ` (${d.complement})` : ""}`
      : null;

  const paymentLabel =
    d.payment === "pix"
      ? store.pixKey
        ? `Pix (Chave: ${store.pixKey})`
        : "Pix (Chave solicitada)"
      : d.payment === "cartao"
        ? "Cartão na entrega"
        : d.changeFor
          ? `Dinheiro (troco para R$ ${d.changeFor})`
          : "Dinheiro (sem troco)";

  const [order] = await db
    .insert(orders)
    .values({
      storeId: store.id,
      customerName: d.customerName,
      customerPhone: d.customerPhone ? onlyDigits(d.customerPhone) : null,
      itemsSummary: summary,
      totalAmount: total.toFixed(2),
      deliveryType: d.deliveryType,
      address,
      paymentMethod: paymentLabel,
      scheduledFor: d.scheduledFor || null,
      notes: d.notes || null,
    })
    .returning({ id: orders.id });

  // Baixa de estoque (só produtos com estoque controlado; nunca abaixo de zero).
  await Promise.all(
    [...qtyByProduct].map(([id, qty]) =>
      db
        .update(products)
        .set({ stock: sql`greatest(${products.stock} - ${qty}, 0)` })
        .where(and(eq(products.id, id), isNotNull(products.stock))),
    ),
  );

  const message = buildWhatsAppMessage({
    shortId: order.id.slice(0, 6).toUpperCase(),
    customerName: d.customerName,
    customerPhone: d.customerPhone,
    items: summary,
    total,
    deliveryType: d.deliveryType,
    address,
    paymentLabel,
    scheduledFor: d.scheduledFor,
    notes: d.notes,
  });

  return { url: whatsappUrl(store.whatsappNumber, message) };
}
