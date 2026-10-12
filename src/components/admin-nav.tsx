"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Settings, Tags } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin/dashboard", label: "Início", icon: LayoutDashboard },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/categorias", label: "Categorias", icon: Tags },
  { href: "/admin/configuracoes", label: "Ajustes", icon: Settings },
];

export function AdminNav({ variant }: { variant: "side" | "bottom" }) {
  const path = usePathname();
  return (
    <ul className={cn(variant === "side" ? "space-y-1" : "grid grid-cols-4")}>
      {links.map(({ href, label, icon: Icon }) => {
        const active = path.startsWith(href);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                variant === "side"
                  ? "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium"
                  : "flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium",
                active ? "text-primary-400" : "text-stone-400 hover:text-white",
                variant === "side" && active && "bg-white/10",
              )}
            >
              <Icon size={variant === "side" ? 18 : 22} strokeWidth={1.75} />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
