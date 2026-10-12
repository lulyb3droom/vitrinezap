"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ImageUpload({
  value,
  onChange,
  label = "Adicionar foto",
  round,
}: {
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  round?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  async function upload(file: File) {
    setBusy(true);
    setError(undefined);
    try {
      const body = new FormData();
      body.set("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Falha no upload.");
      onChange(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha no upload.");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className={cn(
            "relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden border-2 border-dashed border-stone-300 bg-stone-50 text-stone-400 hover:border-primary-500 hover:text-stone-900",
            round ? "rounded-full" : "rounded-2xl",
          )}
          aria-label={label}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : busy ? (
            <Loader2 className="animate-spin" />
          ) : (
            <ImagePlus />
          )}
          {busy && value && (
            <span className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Loader2 className="animate-spin" />
            </span>
          )}
        </button>
        <div className="text-sm">
          <button type="button" onClick={() => ref.current?.click()} className="font-semibold text-stone-900 underline decoration-primary-500 decoration-2 underline-offset-4">
            {value ? "Trocar imagem" : label}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="mt-1 flex items-center gap-1 text-stone-500 hover:text-red-600"
            >
              <Trash2 size={14} /> Remover
            </button>
          )}
          <p className="text-xs text-stone-500">JPG, PNG ou WebP até 4 MB.</p>
        </div>
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture={undefined}
        className="hidden"
        onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
