# MenuZap

Catálogos e cardápios digitais com pedido via WhatsApp. Next.js 14 (App Router + Server Actions), Tailwind, Neon Postgres + Drizzle, Auth.js, Zustand, Vercel Blob.

## Rodando localmente

```bash
cp .env.example .env     # preencha DATABASE_URL, AUTH_SECRET, BLOB_READ_WRITE_TOKEN
npm install
npm run db:migrate       # aplica drizzle/0000_*.sql no Neon
npm run dev
```

1. `/cadastro` cria a loja (já com a categoria "Destaques").
2. `/admin/dashboard` → painel; `/{slug}` → vitrine pública; `/{slug}/checkout` → envio do pedido.

## Deploy (Vercel)

Importe o repositório, defina as mesmas variáveis de ambiente e faça o deploy. Para habilitar o Blob: Storage → Create → Blob.

## Decisões de projeto

- **Preços recalculados no servidor** (`actions/orders.ts`): o carrinho só envia IDs/quantidades/opções; totais, disponibilidade, estoque e opções obrigatórias são validados contra o banco.
- **Plano Free**: limite de 10 produtos validado no servidor (`saveProduct`) e no cliente (modal de upgrade).
- **Proteção do `/admin`**: `middleware.ts` (checa cookie) + `requireStore()` (valida o JWT) em cada página/ação.
- Para mudar o plano de uma loja para Pro (ainda sem pagamento): `UPDATE profiles SET plan = 'pro' WHERE store_slug = '...'`.
- O driver `neon-http` não suporta transações; o código não depende delas.

## Pendências conhecidas

- Checkout do Plano Pro (botão de upgrade ainda é placeholder).
- Estoque é validado no pedido, mas não é decrementado automaticamente.
- Sem rate limiting no cadastro/pedido público.
