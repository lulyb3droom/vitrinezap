"use client";

import { useState, useTransition } from "react";
import { Alert, Button, Card, Field, Input, Switch, Textarea } from "@/components/ui";
import { ImageUpload } from "@/components/image-upload";
import { saveSettings } from "@/app/actions/admin";
import { formatPhone } from "@/lib/utils";

type Initial = {
  storeName: string;
  whatsapp: string;
  description: string;
  openingHours: string;
  themeColor: string;
  pixKey: string;
  logoUrl: string | null;
  askScheduleDate: boolean;
};

const PRESETS = ["#EAB308", "#f97316", "#ef4444", "#16a34a", "#0ea5e9", "#6366f1", "#d946ef", "#0f172a"];

export function SettingsForm({ initial, slug }: { initial: Initial; slug: string }) {
  const [v, setV] = useState({ ...initial, whatsapp: formatPhone(initial.whatsapp) });
  const [msg, setMsg] = useState<{ error?: string; ok?: boolean }>({});
  const [pending, start] = useTransition();
  const set = <K extends keyof typeof v>(k: K, val: (typeof v)[K]) => setV((s) => ({ ...s, [k]: val }));

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setMsg({});
        start(async () => {
          const res = await saveSettings(v);
          setMsg(res.error ? { error: res.error } : { ok: true });
        });
      }}
    >
      <h1 className="text-xl font-bold">Configurações</h1>

      <Card className="space-y-4 p-4">
        <ImageUpload round value={v.logoUrl} onChange={(u) => set("logoUrl", u)} label="Adicionar logo" />
        <Field label="Nome da loja">
          <Input value={v.storeName} onChange={(e) => set("storeName", e.target.value)} required />
        </Field>
        <Field label="Link da loja" hint="O link não pode ser alterado depois de criado.">
          <Input value={`/${slug}`} disabled />
        </Field>
        <Field label="Bio / descrição">
          <Textarea value={v.description} maxLength={300} onChange={(e) => set("description", e.target.value)} />
        </Field>
        <Field label="Horário de funcionamento" hint="Texto livre exibido no topo da loja.">
          <Input
            value={v.openingHours}
            onChange={(e) => set("openingHours", e.target.value)}
            placeholder="Seg a Sáb, 9h às 18h"
          />
        </Field>
      </Card>

      <Card className="space-y-4 p-4">
        <Field label="WhatsApp que recebe os pedidos" hint="Com DDD.">
          <Input
            value={v.whatsapp}
            inputMode="tel"
            onChange={(e) => set("whatsapp", formatPhone(e.target.value))}
            required
          />
        </Field>
        <Field label="Chave Pix" hint="Aparece na mensagem do pedido quando o cliente escolhe Pix.">
          <Input value={v.pixKey} onChange={(e) => set("pixKey", e.target.value)} placeholder="CPF, e-mail, telefone ou aleatória" />
        </Field>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-stone-700">Pedir data/hora desejada</p>
            <p className="text-xs text-stone-500">Para encomendas, floristas, pet shops e presentes.</p>
          </div>
          <Switch checked={v.askScheduleDate} label="Pedir data desejada" onChange={(x) => set("askScheduleDate", x)} />
        </div>
      </Card>

      <Card className="space-y-3 p-4">
        <p className="text-sm font-medium text-stone-700">Cor do tema</p>
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Cor ${c}`}
              onClick={() => set("themeColor", c)}
              style={{ backgroundColor: c }}
              className={`h-9 w-9 rounded-full ring-offset-2 ${v.themeColor === c ? "ring-2 ring-stone-900" : ""}`}
            />
          ))}
          <input
            type="color"
            aria-label="Cor personalizada"
            value={v.themeColor}
            onChange={(e) => set("themeColor", e.target.value)}
            className="h-9 w-9 cursor-pointer rounded-full border-0 bg-transparent p-0"
          />
        </div>
      </Card>

      {msg.error && <Alert>{msg.error}</Alert>}
      {msg.ok && <p className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">Alterações salvas!</p>}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Salvando…" : "Salvar alterações"}
      </Button>
    </form>
  );
}
