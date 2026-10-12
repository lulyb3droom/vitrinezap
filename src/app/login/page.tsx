import type { Metadata } from "next";
import { LoginForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Entrar — VitrineZap" };

export default function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  return <LoginForm next={searchParams.next} />;
}
