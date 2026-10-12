"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Check, Pencil, Plus, Trash2 } from "lucide-react";
import { Alert, Button, Card, Input } from "@/components/ui";
import { createCategory, deleteCategory, moveCategory, renameCategory } from "@/app/actions/admin";

type Row = { id: string; name: string; productCount: number };

export function CategoryManager({ categories }: { categories: Row[] }) {
  const [name, setName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Categorias</h1>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setError(undefined);
          start(async () => {
            const res = await createCategory(name);
            if (res.error) setError(res.error);
            else setName("");
          });
        }}
      >
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nova categoria (ex.: Bolos)" />
        <Button type="submit" disabled={pending || !name.trim()}>
          <Plus size={18} /> Criar
        </Button>
      </form>
      {error && <Alert>{error}</Alert>}

      <div className="space-y-2">
        {categories.map((c, i) => (
          <Card key={c.id} className="flex items-center gap-2 p-3">
            <div className="flex flex-col">
              <button
                aria-label="Subir"
                disabled={i === 0 || pending}
                className="rounded p-0.5 text-stone-500 hover:bg-stone-100 disabled:opacity-30"
                onClick={() => start(() => moveCategory(c.id, -1))}
              >
                <ArrowUp size={16} />
              </button>
              <button
                aria-label="Descer"
                disabled={i === categories.length - 1 || pending}
                className="rounded p-0.5 text-stone-500 hover:bg-stone-100 disabled:opacity-30"
                onClick={() => start(() => moveCategory(c.id, 1))}
              >
                <ArrowDown size={16} />
              </button>
            </div>

            {editId === c.id ? (
              <form
                className="flex flex-1 gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  start(async () => {
                    const res = await renameCategory(c.id, editName);
                    if (res.error) setError(res.error);
                    else setEditId(null);
                  });
                }}
              >
                <Input autoFocus value={editName} onChange={(e) => setEditName(e.target.value)} />
                <Button type="submit" size="md" aria-label="Salvar">
                  <Check size={18} />
                </Button>
              </form>
            ) : (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{c.name}</p>
                  <p className="text-xs text-stone-500">{c.productCount} produto(s)</p>
                </div>
                <button
                  aria-label="Renomear"
                  className="rounded-lg p-2 text-stone-600 hover:bg-stone-100"
                  onClick={() => {
                    setEditId(c.id);
                    setEditName(c.name);
                  }}
                >
                  <Pencil size={18} />
                </button>
                <button
                  aria-label="Excluir"
                  className="rounded-lg p-2 text-stone-400 hover:bg-red-50 hover:text-red-600"
                  onClick={() => {
                    if (confirm(`Excluir "${c.name}"? Os produtos ficarão sem categoria.`)) start(() => deleteCategory(c.id));
                  }}
                >
                  <Trash2 size={18} />
                </button>
              </>
            )}
          </Card>
        ))}
        {categories.length === 0 && (
          <Card className="p-8 text-center text-stone-500">Crie categorias para organizar seu catálogo.</Card>
        )}
      </div>
    </div>
  );
}
