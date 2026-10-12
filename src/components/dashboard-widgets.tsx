"use client";

import { useState, useTransition } from "react";
import { Check, Copy } from "lucide-react";
import { Button, Switch } from "@/components/ui";
import { completeOrder, toggleStoreOpen } from "@/app/actions/admin";

export function CopyLink({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);
  const full = () => `${window.location.origin}${path}`;

  return (
    <div className="flex items-center gap-2">
      <code className="min-w-0 flex-1 truncate rounded-xl bg-slate-100 px-3 py-2.5 text-sm">{path}</code>
      <Button
        size="md"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(full());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            window.prompt("Copie o link:", full());
          }
        }}
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
        {copied ? "Copiado" : "Copiar"}
      </Button>
    </div>
  );
}

export function OpenToggle({ initial }: { initial: boolean }) {
  const [open, setOpen] = useState(initial);
  const [pending, start] = useTransition();
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="font-semibold">{open ? "Loja aberta" : "Loja fechada"}</p>
        <p className="text-sm text-slate-500">
          {open ? "Clientes podem enviar pedidos." : "Clientes veem o catálogo, mas não enviam pedidos."}
        </p>
      </div>
      <Switch
        checked={open}
        label="Loja aberta"
        disabled={pending}
        onChange={(v) => {
          setOpen(v);
          start(() => toggleStoreOpen(v));
        }}
      />
    </div>
  );
}

export function CompleteOrderButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <Button size="sm" variant="outline" disabled={pending} onClick={() => start(() => completeOrder(id))}>
      <Check size={14} /> Concluir
    </Button>
  );
}
