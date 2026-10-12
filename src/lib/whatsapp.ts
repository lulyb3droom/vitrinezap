import type { OrderItemSummary } from "@/db/schema";
import { brl, formatPhone } from "./utils";

export type WhatsAppOrder = {
  shortId: string;
  customerName: string;
  customerPhone?: string | null;
  items: OrderItemSummary[];
  total: number;
  deliveryType: "entrega" | "retirada";
  address?: string | null;
  paymentLabel: string;
  scheduledFor?: string | null;
  notes?: string | null;
};

const LINE = "----------------------------------";

export function buildWhatsAppMessage(o: WhatsAppOrder) {
  const lines: string[] = [];
  lines.push(`🛍️ *NOVO PEDIDO #${o.shortId}*`, LINE);
  lines.push(`👤 *Cliente:* ${o.customerName}`);
  if (o.customerPhone) lines.push(`📞 *Telefone:* ${formatPhone(o.customerPhone)}`);
  lines.push("", "📦 *ITENS DO PEDIDO:*");

  for (const it of o.items) {
    const lineTotal = (it.unitPrice + it.options.reduce((s, x) => s + x.price, 0)) * it.qty;
    lines.push(`• ${it.qty}x ${it.title} (${brl(lineTotal)})`);
    const grouped = new Map<string, string[]>();
    for (const op of it.options) grouped.set(op.group, [...(grouped.get(op.group) ?? []), op.name]);
    for (const [g, names] of grouped) lines.push(`  _${g}: ${names.join(", ")}_`);
    if (it.note) lines.push(`  _Obs: ${it.note}_`);
  }

  lines.push("", LINE);
  if (o.deliveryType === "entrega") {
    lines.push("🛵 *Entrega:* Entregar no Endereço");
    if (o.address) lines.push(`📍 *Endereço:* ${o.address}`);
  } else {
    lines.push("🏪 *Entrega:* Retirada no Local");
  }
  if (o.scheduledFor) lines.push(`🗓️ *Para quando:* ${o.scheduledFor}`);
  lines.push(`💳 *Pagamento:* ${o.paymentLabel}`);
  if (o.notes) lines.push(`📝 *Observações:* ${o.notes}`);
  lines.push("", `💰 *TOTAL:* *${brl(o.total)}*`);
  return lines.join("\n");
}

export function whatsappUrl(number: string, message: string) {
  const digits = number.replace(/\D/g, "");
  const full = digits.startsWith("55") && digits.length >= 12 ? digits : `55${digits}`;
  return `https://wa.me/${full}?text=${encodeURIComponent(message)}`;
}
