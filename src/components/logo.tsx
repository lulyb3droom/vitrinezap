import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

/** Marca MenuZap. `tone="dark"` para fundos escuros (sidebar do admin). */
export function Logo({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xl font-extrabold tracking-tight", className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-stone-900">
        <Zap size={18} strokeWidth={2.25} fill="currentColor" />
      </span>
      <span className={tone === "dark" ? "text-white" : "text-stone-900"}>
        Menu<span className="text-primary-500">Zap</span>
      </span>
    </span>
  );
}
