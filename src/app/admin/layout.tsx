import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { requireStore } from "@/lib/session";
import { logoutAction } from "@/app/actions/auth";
import { AdminNav } from "@/components/admin-nav";
import { Logo } from "@/components/logo";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const store = await requireStore();
  return (
    <div className="min-h-dvh pb-20 md:pb-0 md:pl-60">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-stone-900 p-4 md:flex">
        <Logo tone="dark" className="mb-8 px-1" />
        <AdminNav variant="side" />
        <form action={logoutAction} className="mt-auto">
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-stone-400 hover:bg-white/5 hover:text-white">
            <LogOut size={18} strokeWidth={1.75} /> Sair
          </button>
        </form>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-stone-200 bg-white/90 px-4 py-3 backdrop-blur">
        <div className="min-w-0">
          <p className="truncate font-bold">{store.storeName}</p>
          <p className="text-xs text-stone-500">
            Plano {store.plan === "pro" ? "Pro" : "Free"}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Link
            href={`/${store.storeSlug}`}
            target="_blank"
            className="flex items-center gap-1.5 rounded-xl bg-primary-100 px-3 py-2 text-sm font-semibold text-stone-900 hover:bg-primary-400"
          >
            Ver loja <ExternalLink size={15} />
          </Link>
          <form action={logoutAction} className="md:hidden">
            <button aria-label="Sair" className="rounded-xl p-2 text-stone-500 hover:bg-stone-100">
              <LogOut size={18} />
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-3xl p-4">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 bg-stone-900 pb-[env(safe-area-inset-bottom)] md:hidden">
        <AdminNav variant="bottom" />
      </nav>
    </div>
  );
}
