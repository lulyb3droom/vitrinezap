import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { profiles } from "@/db/schema";

/** Retorna a loja do usuário logado ou redireciona para /login. */
export async function requireStore() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const [store] = await db.select().from(profiles).where(eq(profiles.id, session.user.id)).limit(1);
  if (!store) redirect("/login");
  return store;
}
