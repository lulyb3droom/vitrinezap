"use server";

import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { z } from "zod";
import { db } from "@/db";
import { categories, profiles } from "@/db/schema";
import { signIn, signOut } from "@/auth";
import { RESERVED_SLUGS, onlyDigits, slugify } from "@/lib/utils";

export type ActionResult = { error?: string };

const registerSchema = z.object({
  storeName: z.string().trim().min(2, "Informe o nome da loja").max(60),
  slug: z.string().trim().min(3, "O link precisa de ao menos 3 caracteres").max(40),
  whatsapp: z.string().refine((v) => [10, 11].includes(onlyDigits(v).length), "WhatsApp inválido (use DDD + número)"),
  email: z.string().trim().email("E-mail inválido"),
  password: z.string().min(8, "A senha precisa de ao menos 8 caracteres"),
});

export async function registerAction(input: z.input<typeof registerSchema>): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;

  const slug = slugify(d.slug);
  if (slug.length < 3 || RESERVED_SLUGS.has(slug)) return { error: "Esse link não está disponível. Tente outro." };
  const email = d.email.toLowerCase();

  const [clash] = await db
    .select({ email: profiles.email, slug: profiles.storeSlug })
    .from(profiles)
    .where(eq(profiles.storeSlug, slug))
    .limit(1);
  if (clash) return { error: "Esse link já está em uso. Tente outro." };
  const [emailClash] = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.email, email)).limit(1);
  if (emailClash) return { error: "Já existe uma conta com esse e-mail." };

  const [created] = await db
    .insert(profiles)
    .values({
      email,
      passwordHash: await bcrypt.hash(d.password, 10),
      storeSlug: slug,
      storeName: d.storeName,
      whatsappNumber: onlyDigits(d.whatsapp),
    })
    .returning({ id: profiles.id });

  await db.insert(categories).values({ storeId: created.id, name: "Destaques", sortOrder: 0 });

  await signIn("credentials", { email, password: d.password, redirectTo: "/admin/dashboard" });
  return {};
}

export async function loginAction(input: { email: string; password: string; next?: string }): Promise<ActionResult> {
  try {
    const next = input.next?.startsWith("/admin") ? input.next : "/admin/dashboard";
    await signIn("credentials", { email: input.email.toLowerCase(), password: input.password, redirectTo: next });
    return {};
  } catch (e) {
    if (e instanceof AuthError) return { error: "E-mail ou senha incorretos." };
    throw e; // NEXT_REDIRECT
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
